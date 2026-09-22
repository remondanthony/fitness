import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  bucketByMonth,
  bucketByWeek,
  summariseSessions,
  utcWeekStart,
  windowStart,
  type PeriodBucket,
  type SessionForAggregation,
  type SessionVolume,
} from "@/lib/progress/aggregate";
import {
  buildExerciseRecords,
  heaviestSetByWeek,
  pickTrendExercise,
  type ExerciseRecords,
  type LoggedSet,
  type TrendPoint,
} from "@/lib/progress/records";
import {
  buildStreakSummary,
  type StreakSummary,
} from "@/lib/progress/streaks";
import {
  encodeCursor,
  filterRange,
  NO_FILTERS,
  type Cursor,
  type HistoryFilters,
} from "@/lib/progress/history-query";

/**
 * Server-only progress analytics.
 *
 * Reads what the member actually did — completed sessions and the sets inside
 * them — and hands it to the pure aggregation in `lib/progress/aggregate.ts`.
 * All of the arithmetic lives there; this file only fetches.
 *
 * Ownership comes from the session. No function here takes a user id, so there
 * is no argument a browser could set to read somebody else's training, and RLS
 * scopes every row to the caller on top of that.
 *
 * Volume is recomputed from `exercise_logs` on every read.
 * `workout_sessions.total_volume` is written by the browser when a session
 * ends and has never been reconciled against the sets, so it is not selected
 * here and does not appear in any type this module returns.
 */

export type ProgressResult<T> = {
  data: T;
  /** A query failed. Callers should say so rather than present empty as zero. */
  error: boolean;
};

/** Shape of the nested select. The generated types carry no relationships, so
 *  the embedded rows need naming explicitly. */
type SessionRow = {
  id: string;
  workout_slug: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  exercise_logs: { weight: number | null; reps: number | null }[] | null;
};

/** Columns fetched for every analytics read. `total_volume` is absent on purpose. */
const SESSION_SELECT =
  "id, workout_slug, started_at, completed_at, duration_seconds, exercise_logs(weight, reps)";

function toAggregationInput(rows: SessionRow[]): SessionForAggregation[] {
  return rows.map((row) => ({
    id: row.id,
    workoutSlug: row.workout_slug,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSeconds: row.duration_seconds,
    logs: row.exercise_logs ?? [],
  }));
}

/**
 * Completed sessions finished on or after `sinceIso`, with their sets.
 *
 * Wrapped in React `cache`, so a page asking for history, weekly volume and
 * monthly consistency over the same window pays for one query rather than
 * three. Keyed on the window, so a different span is a different fetch.
 *
 * `completed = true` and a non-null `completed_at` are both required: an
 * abandoned session is not a workout, and ordering a timeline by a timestamp
 * that might be missing would put it in an arbitrary place.
 */
const loadCompletedSessionsSince = cache(
  async (sinceIso: string | null): Promise<ProgressResult<SessionVolume[]>> => {
    const user = await getSessionUser();
    if (!user) return { data: [], error: false };

    const supabase = await createClient();

    let query = supabase
      .from("workout_sessions")
      .select(SESSION_SELECT)
      .eq("user_id", user.id)
      .eq("completed", true)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (sinceIso) query = query.gte("completed_at", sinceIso);

    const { data, error } = await query;

    if (error || !data) return { data: [], error: Boolean(error) };

    // The embedded rows come back untyped because every table in the generated
    // Database type declares `Relationships: []`.
    const rows = data as unknown as SessionRow[];

    return { data: summariseSessions(toAggregationInput(rows)), error: false };
  },
);

/**
 * The member's completed sessions, newest first, each with volume recomputed
 * from its own sets.
 *
 * `limit` trims the result after aggregation rather than in SQL, so the volume
 * on a returned session is always the whole session and never a partial sum.
 */
export async function getCompletedSessionHistory(
  limit = 50,
): Promise<ProgressResult<SessionVolume[]>> {
  const result = await loadCompletedSessionsSince(null);

  return {
    data: limit > 0 ? result.data.slice(0, limit) : result.data,
    error: result.error,
  };
}

/**
 * Sessions and volume for the last `weeks` UTC weeks, oldest first.
 *
 * Empty weeks are included. Training consistency is as much about the weeks
 * with nothing in them as the ones with sessions, and a series that skipped
 * them would misrepresent the gap.
 */
export async function getWeeklyProgress(
  weeks = 12,
  now: Date = new Date(),
): Promise<ProgressResult<PeriodBucket[]>> {
  const since = windowStart("week", weeks, now);
  const result = await loadCompletedSessionsSince(since.toISOString());

  return { data: bucketByWeek(result.data, weeks, now), error: result.error };
}

/** Sessions and volume for the last `months` UTC months, oldest first. */
export async function getMonthlyProgress(
  months = 6,
  now: Date = new Date(),
): Promise<ProgressResult<PeriodBucket[]>> {
  const since = windowStart("month", months, now);
  const result = await loadCompletedSessionsSince(since.toISOString());

  return { data: bucketByMonth(result.data, months, now), error: result.error };
}

export type { PeriodBucket, SessionVolume };

// ---------------------------------------------------------------------------
// Personal records and strength trends
// ---------------------------------------------------------------------------

/** Shape of the embedded log rows. Named explicitly for the same reason as
 *  SessionRow: the generated types carry no relationships. */
type LogRow = {
  exercise_slug: string;
  weight: number | null;
  reps: number | null;
  created_at: string;
};


/**
 * Every set the member has logged inside a completed session.
 *
 * One query, not one per exercise. Reading from the session side and embedding
 * the logs lets the `completed` filter apply to the parent, so sets belonging
 * to an abandoned session never come back; grouping by exercise then happens in
 * pure functions. `total_volume` is not selected here either — records are
 * built from the sets themselves.
 *
 * Unbounded on purpose. Personal records are lifetime bests, so a window would
 * quietly retire them. See the note in the module docs about when this may
 * need revisiting.
 */
const loadCompletedSets = cache(async (): Promise<ProgressResult<LoggedSet[]>> => {
  const user = await getSessionUser();
  if (!user) return { data: [], error: false };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("completed, exercise_logs(exercise_slug, weight, reps, created_at)")
    .eq("user_id", user.id)
    .eq("completed", true)
    .not("completed_at", "is", null);

  if (error || !data) return { data: [], error: Boolean(error) };

  const rows = data as unknown as { exercise_logs: LogRow[] | null }[];

  const sets: LoggedSet[] = [];

  for (const row of rows) {
    for (const log of row.exercise_logs ?? []) {
      sets.push({
        exerciseSlug: log.exercise_slug,
        weight: log.weight,
        reps: log.reps,
        createdAt: log.created_at,
      });
    }
  }

  return { data: sets, error: false };
});

/**
 * Lifetime personal records per exercise, most-trained exercise first.
 *
 * Only sets from completed sessions contribute, so a workout someone walked
 * away from cannot set a record.
 */
export async function getPersonalRecords(): Promise<ProgressResult<ExerciseRecords[]>> {
  const result = await loadCompletedSets();

  return { data: buildExerciseRecords(result.data), error: result.error };
}

export type StrengthTrend = {
  /** Null when no logged exercise has ever been loaded. */
  exerciseSlug: string | null;
  /** Weeks the exercise was trained, oldest first. Never padded with zeros. */
  points: TrendPoint[];
};

/**
 * Heaviest set per week for the member's most-trained loaded exercise.
 *
 * The exercise is chosen from their own history rather than fixed, and it is
 * named alongside the chart so the line is never mistaken for a general
 * "strength" figure. No estimate is computed.
 */
export async function getStrengthTrend(): Promise<ProgressResult<StrengthTrend>> {
  const result = await loadCompletedSets();
  const records = buildExerciseRecords(result.data);
  const exerciseSlug = pickTrendExercise(records);

  return {
    data: {
      exerciseSlug,
      points: exerciseSlug ? heaviestSetByWeek(result.data, exerciseSlug) : [],
    },
    error: result.error,
  };
}

export type { ExerciseRecords, LoggedSet, TrendPoint };

// ---------------------------------------------------------------------------
// Training summary — streaks and lifetime totals
// ---------------------------------------------------------------------------

export type TrainingSummary = {
  /** Completed sessions, all time. */
  totalSessions: number;
  /** Volume across every completed session, recomputed from the sets. */
  totalVolume: number;
  /** Completed sessions in the current UTC week. */
  thisWeekSessions: number;
  streak: StreakSummary;
};

/**
 * Streaks and lifetime totals for the signed-in member.
 *
 * Built from the same cached read the rest of this module uses, so a page
 * showing streaks, totals and history together still makes one query. Nothing
 * new is fetched and no count is taken from `total_volume`.
 */
export async function getTrainingSummary(
  now: Date = new Date(),
): Promise<ProgressResult<TrainingSummary>> {
  const result = await loadCompletedSessionsSince(null);

  const completedAt = result.data.map((session) => session.completedAt);
  const weekStart = utcWeekStart(now).getTime();

  return {
    data: {
      totalSessions: result.data.length,
      totalVolume:
        Math.round(result.data.reduce((total, s) => total + s.volume, 0) * 100) / 100,
      thisWeekSessions: result.data.filter(
        (session) => Date.parse(session.completedAt) >= weekStart,
      ).length,
      streak: buildStreakSummary(completedAt, now),
    },
    error: result.error,
  };
}

export type { StreakSummary };

// ---------------------------------------------------------------------------
// One session, in full
// ---------------------------------------------------------------------------

export type SessionDetail = {
  session: SessionVolume;
  /** Every set logged in the session, oldest first. */
  sets: DetailSet[];
  /** Exercises the session planned, in their recorded order. May be empty. */
  plannedSlugs: string[];
};

export type DetailSet = {
  exerciseSlug: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  createdAt: string;
};

/**
 * One completed session and its sets, fetched by id.
 *
 * Deliberately a direct read rather than a lookup inside the history list: the
 * list is capped, and a member's older sessions must stay reachable by their
 * own link rather than falling off the end of a page.
 *
 * `sessionId` comes from the URL, which is why the query is scoped to the
 * member twice over — `.eq("user_id", ...)` from the session, and RLS beneath
 * it. A session belonging to somebody else returns null, identically to one
 * that does not exist, so a guessed id cannot be used to learn whether it is
 * real.
 *
 * Volume comes from the sets, as everywhere else. `total_volume` is not
 * selected.
 */
export const getSessionDetail = cache(
  async (sessionId: string): Promise<ProgressResult<SessionDetail | null>> => {
    const user = await getSessionUser();
    if (!user) return { data: null, error: false };

    // Postgres rejects a malformed uuid with an error, which would otherwise
    // read as "something went wrong" for what is really just a bad link.
    if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return { data: null, error: false };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("workout_sessions")
      .select(
        "id, workout_slug, started_at, completed_at, duration_seconds, " +
          "exercise_logs(exercise_slug, set_number, weight, reps, created_at), " +
          "workout_session_exercises(exercise_slug, exercise_order)",
      )
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .eq("completed", true)
      .not("completed_at", "is", null)
      .maybeSingle();

    if (error) return { data: null, error: true };
    if (!data) return { data: null, error: false };

    // Its own shape rather than an intersection with SessionRow: this query
    // selects more per log than the analytics reads do.
    const row = data as unknown as {
      id: string;
      workout_slug: string;
      started_at: string;
      completed_at: string | null;
      duration_seconds: number | null;
      exercise_logs: (LogRow & { set_number: number })[] | null;
      workout_session_exercises:
        | { exercise_slug: string; exercise_order: number }[]
        | null;
    };

    const [session] = summariseSessions([
      {
        id: row.id,
        workoutSlug: row.workout_slug,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationSeconds: row.duration_seconds,
        logs: row.exercise_logs ?? [],
      },
    ]);

    if (!session) return { data: null, error: false };

    const sets: DetailSet[] = (row.exercise_logs ?? []).map((log) => ({
      exerciseSlug: log.exercise_slug,
      setNumber: log.set_number,
      weight: log.weight,
      reps: log.reps,
      createdAt: log.created_at,
    }));

    const plannedSlugs = [...(row.workout_session_exercises ?? [])]
      .sort((a, b) => a.exercise_order - b.exercise_order)
      .map((entry) => entry.exercise_slug);

    return { data: { session, sets, plannedSlugs }, error: false };
  },
);

// ---------------------------------------------------------------------------
// One exercise, across every session it appears in
// ---------------------------------------------------------------------------

export type ExerciseSessionEntry = {
  sessionId: string;
  workoutSlug: string;
  completedAt: string;
  sets: DetailSet[];
};

export type ExerciseHistory = {
  exerciseSlug: string;
  /** Sessions containing this exercise, most recent completion first. */
  sessions: ExerciseSessionEntry[];
  /** Lifetime records, from the same engine the progress page uses. */
  records: ExerciseRecords | null;
};

/**
 * Every set the member has logged for one exercise, grouped by session.
 *
 * Reads from the session side so `completed = true` applies to the parent and
 * an abandoned workout contributes nothing — the same shape the other history
 * reads use. `total_volume` is not selected; records come from the shared
 * `buildExerciseRecords`, so there is no second personal-record algorithm.
 *
 * `exerciseSlug` comes from the URL, which is a catalogue key rather than an
 * ownership claim: the rows are still scoped to the member by the session and
 * by RLS, so a slug can only ever reveal the caller's own logs.
 */
export const getExerciseHistory = cache(
  async (exerciseSlug: string): Promise<ProgressResult<ExerciseHistory>> => {
    const empty: ExerciseHistory = { exerciseSlug, sessions: [], records: null };

    const user = await getSessionUser();
    if (!user) return { data: empty, error: false };
    if (!exerciseSlug) return { data: empty, error: false };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("workout_sessions")
      .select(
        "id, workout_slug, completed_at, " +
          "exercise_logs(exercise_slug, set_number, weight, reps, created_at)",
      )
      .eq("user_id", user.id)
      .eq("completed", true)
      .not("completed_at", "is", null)
      .eq("exercise_logs.exercise_slug", exerciseSlug)
      .order("completed_at", { ascending: false });

    if (error || !data) return { data: empty, error: Boolean(error) };

    const rows = data as unknown as {
      id: string;
      workout_slug: string;
      completed_at: string;
      exercise_logs: (LogRow & { set_number: number })[] | null;
    }[];

    const sessions: ExerciseSessionEntry[] = [];
    const allSets: LoggedSet[] = [];

    for (const row of rows) {
      // The embedded filter leaves sessions that never included this exercise
      // in the result with an empty log array; they are not history for it.
      const logs = row.exercise_logs ?? [];
      if (logs.length === 0) continue;

      sessions.push({
        sessionId: row.id,
        workoutSlug: row.workout_slug,
        completedAt: row.completed_at,
        sets: logs
          .map((log) => ({
            exerciseSlug: log.exercise_slug,
            setNumber: log.set_number,
            weight: log.weight,
            reps: log.reps,
            createdAt: log.created_at,
          }))
          .sort((a, b) => a.setNumber - b.setNumber),
      });

      for (const log of logs) {
        allSets.push({
          exerciseSlug: log.exercise_slug,
          weight: log.weight,
          reps: log.reps,
          createdAt: log.created_at,
        });
      }
    }

    // Newest first. Ties break on session id so paging stays stable.
    sessions.sort(
      (a, b) =>
        Date.parse(b.completedAt) - Date.parse(a.completedAt) ||
        a.sessionId.localeCompare(b.sessionId),
    );

    const [records] = buildExerciseRecords(allSets);

    return {
      data: { exerciseSlug, sessions, records: records ?? null },
      error: false,
    };
  },
);

// ---------------------------------------------------------------------------
// Paginated history
// ---------------------------------------------------------------------------

export type SessionPage = {
  sessions: SessionVolume[];
  /** Pass back to fetch the next page. Null when this is the last one. */
  nextCursor: string | null;
};

/** Sessions returned per page. */
export const HISTORY_PAGE_SIZE = 10;

/**
 * One page of completed sessions, newest first.
 *
 * Keyset rather than offset: the sort is `(completed_at desc, id desc)` and a
 * page starts strictly after the previous page's last row. Two sessions
 * finishing in the same millisecond are ordered by id, so the sequence is
 * total — no row can be skipped or repeated between pages, which an OFFSET
 * would allow the moment a session is added while someone is reading.
 *
 * Only a page is fetched. The lifetime-history read used for records and
 * streaks is a different helper on purpose; paging a list should not cost a
 * member's entire training history.
 *
 * `cursor` and `filters` come from the URL and are parsed by
 * `lib/progress/history-query.ts` before they reach this function, so the
 * values interpolated below are a timestamp, a uuid and a slug — never
 * arbitrary text in a filter expression.
 */
export async function getSessionPage(options: {
  limit?: number;
  cursor?: Cursor | null;
  filters?: HistoryFilters;
} = {}): Promise<ProgressResult<SessionPage>> {
  const empty: SessionPage = { sessions: [], nextCursor: null };

  const user = await getSessionUser();
  if (!user) return { data: empty, error: false };

  const limit = Math.min(Math.max(1, options.limit ?? HISTORY_PAGE_SIZE), 50);
  const filters = options.filters ?? NO_FILTERS;
  const { fromIso, toIso } = filterRange(filters);

  const supabase = await createClient();

  let query = supabase
    .from("workout_sessions")
    .select(SESSION_SELECT)
    .eq("user_id", user.id)
    .eq("completed", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .order("id", { ascending: false })
    // One more than asked for: its presence is how we know another page
    // exists, without a second count query.
    .limit(limit + 1);

  if (fromIso) query = query.gte("completed_at", fromIso);
  if (toIso) query = query.lte("completed_at", toIso);
  if (filters.workoutSlug) query = query.eq("workout_slug", filters.workoutSlug);

  if (options.cursor) {
    const { completedAt, id } = options.cursor;
    // Strictly after the previous page's last row, in the same total order.
    query = query.or(
      `completed_at.lt.${completedAt},and(completed_at.eq.${completedAt},id.lt.${id})`,
    );
  }

  const { data, error } = await query;

  if (error || !data) return { data: empty, error: Boolean(error) };

  const rows = data as unknown as SessionRow[];
  const summarised = summariseSessions(toAggregationInput(rows));

  const hasMore = summarised.length > limit;
  const sessions = hasMore ? summarised.slice(0, limit) : summarised;
  const last = sessions[sessions.length - 1];

  return {
    data: {
      sessions,
      nextCursor:
        hasMore && last
          ? encodeCursor({ completedAt: last.completedAt, id: last.id })
          : null,
    },
    error: false,
  };
}
