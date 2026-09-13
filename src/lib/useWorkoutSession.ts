"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  getClock,
  getServerClock,
  subscribeToClock,
  subscribeToNothing,
} from "@/lib/clockStore";
import {
  ensureSession,
  getSnapshot,
  parseSession,
  resetSession,
  saveSession,
  subscribe,
} from "@/lib/workoutSessionStore";
import type { Workout } from "@/data/workouts";

export type LoggedSet = {
  weight: number;
  reps: number;
};

/** Logged sets keyed by workout exercise id. */
export type SessionLog = Record<string, LoggedSet[]>;

export type WorkoutSession = {
  slug: string;
  startedAt: number;
  currentIndex: number;
  log: SessionLog;
  finishedAt: number | null;
};

type RestState = {
  total: number;
  /** Frozen countdown value; only meaningful while paused. */
  remaining: number;
  /** Epoch ms the rest ends at, or null while paused. */
  endsAt: number | null;
  /** What the member is resting before, shown as "next up". */
  label: string;
};

/**
 * Owns every piece of workout-player state: which exercise is active, what has
 * been logged, the rest countdown and completion.
 *
 * The session itself lives in localStorage and is read through
 * `useSyncExternalStore`, so a refresh mid-session resumes exactly where it left
 * off and the server render has a defined (empty) snapshot. Rest and the clock
 * are deliberately ephemeral — resuming into a stale countdown would be wrong.
 */
export type SessionSeed = {
  startedAt: number;
  currentIndex: number;
  log: SessionLog;
};

export type SessionCallbacks = {
  /** Rebuilds local state from a persisted session when none exists locally. */
  seed?: SessionSeed | null;
  /** Fired after a set is recorded locally, so it can be persisted. */
  onSetLogged?: (entry: {
    exerciseId: string;
    setNumber: number;
    weight: number;
    reps: number;
  }) => void;
  /** Fired once when the final set closes the workout. */
  onCompleted?: (totals: { durationSeconds: number; totalVolume: number }) => void;
};

export function useWorkoutSession(
  workout: Workout,
  callbacks: SessionCallbacks = {},
) {
  const { slug } = workout;

  // Held in a ref so changing handler identity never re-runs the tick effect.
  // Written in an effect rather than during render, which React forbids.
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  const raw = useSyncExternalStore(
    subscribe,
    () => getSnapshot(slug),
    () => null,
  );

  const session = useMemo(() => parseSession(raw, slug), [raw, slug]);

  const [rest, setRest] = useState<RestState | null>(null);
  /** Which way the exercise screen should slide on the next change. */
  const [direction, setDirection] = useState<"next" | "prev">("next");

  // Start a session on first visit. This writes to the store rather than to
  // component state, so React re-renders through the subscription above.
  useEffect(() => {
    ensureSession(slug, callbacksRef.current.seed ?? null);
  }, [slug]);

  const running = Boolean(session) && !session?.finishedAt;

  // The clock ticks only while the workout is live.
  const now = useSyncExternalStore(
    running ? subscribeToClock : subscribeToNothing,
    getClock,
    getServerClock,
  );

  /** Dismisses the rest overlay early. */
  const endRest = useCallback(() => setRest(null), []);

  const exercises = workout.exercises;
  const currentIndex = session?.currentIndex ?? 0;
  const currentExercise = exercises[Math.min(currentIndex, exercises.length - 1)];

  const setsFor = useCallback(
    (exerciseId: string) => session?.log[exerciseId] ?? [],
    [session],
  );

  const totals = useMemo(() => {
    const logs = Object.values(session?.log ?? {});
    const entries = logs.flat();
    return {
      sets: entries.length,
      volume: entries.reduce((sum, entry) => sum + entry.weight * entry.reps, 0),
      exercisesTouched: logs.filter((sets) => sets.length > 0).length,
    };
  }, [session]);

  // `now` is 0 until the first tick; fall back to the live clock so a resumed
  // session shows the correct elapsed time immediately.
  const elapsedSeconds =
    session && (session.finishedAt || now)
      ? Math.max(
          0,
          Math.floor(((session.finishedAt ?? now) - session.startedAt) / 1000),
        )
      : 0;

  const finish = useCallback(() => {
    setRest(null);
    const latest = parseSession(getSnapshot(slug), slug);
    if (!latest || latest.finishedAt) return;

    const finishedAt = Date.now();
    saveSession({ ...latest, finishedAt });

    const entries = Object.values(latest.log).flat();
    callbacksRef.current.onCompleted?.({
      durationSeconds: Math.max(0, Math.floor((finishedAt - latest.startedAt) / 1000)),
      totalVolume: entries.reduce((sum, e) => sum + e.weight * e.reps, 0),
    });
  }, [slug]);

  const goTo = useCallback(
    (index: number) => {
      setRest(null);
      const latest = parseSession(getSnapshot(slug), slug);
      if (!latest) return;
      setDirection(index >= latest.currentIndex ? "next" : "prev");
      saveSession({
        ...latest,
        currentIndex: Math.min(Math.max(index, 0), exercises.length - 1),
      });
    },
    [slug, exercises.length],
  );

  const next = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const previous = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  /** Records one set, then starts rest or finishes the workout. */
  const completeSet = useCallback(
    (weight: number, reps: number) => {
      const latest = parseSession(getSnapshot(slug), slug);
      if (!latest) return;

      const exercise = exercises[Math.min(latest.currentIndex, exercises.length - 1)];
      if (!exercise) return;

      const logged = [...(latest.log[exercise.id] ?? []), { weight, reps }];
      const exerciseDone = logged.length >= exercise.sets;
      const isLastExercise = latest.currentIndex >= exercises.length - 1;
      const workoutDone = exerciseDone && isLastExercise;

      // Advance straight away so the rest screen can stay purely presentational.
      const nextIndex = exerciseDone
        ? Math.min(latest.currentIndex + 1, exercises.length - 1)
        : latest.currentIndex;

      saveSession({
        ...latest,
        currentIndex: nextIndex,
        log: { ...latest.log, [exercise.id]: logged },
        finishedAt: workoutDone ? Date.now() : latest.finishedAt,
      });

      callbacksRef.current.onSetLogged?.({
        exerciseId: exercise.id,
        setNumber: logged.length,
        weight,
        reps,
      });

      if (workoutDone) {
        const entries = Object.values({
          ...latest.log,
          [exercise.id]: logged,
        }).flat();
        callbacksRef.current.onCompleted?.({
          durationSeconds: Math.max(
            0,
            Math.floor((Date.now() - latest.startedAt) / 1000),
          ),
          totalVolume: entries.reduce((sum, e) => sum + e.weight * e.reps, 0),
        });
        setRest(null);
        return;
      }

      if (exerciseDone) setDirection("next");

      const upNext = exercises[nextIndex];
      setRest({
        total: exercise.restSeconds,
        remaining: exercise.restSeconds,
        endsAt: Date.now() + exercise.restSeconds * 1000,
        label: exerciseDone
          ? `${upNext.name} · ${upNext.sets} × ${upNext.reps}`
          : `${exercise.name} · Set ${logged.length + 1}`,
      });
    },
    [slug, exercises],
  );

  const pauseRest = useCallback(() => {
    setRest((current) =>
      current && current.endsAt
        ? {
            ...current,
            remaining: Math.max(0, Math.ceil((current.endsAt - Date.now()) / 1000)),
            endsAt: null,
          }
        : current,
    );
  }, []);

  const resumeRest = useCallback(() => {
    setRest((current) =>
      current && !current.endsAt
        ? { ...current, endsAt: Date.now() + current.remaining * 1000 }
        : current,
    );
  }, []);

  const addRest = useCallback((seconds: number) => {
    setRest((current) => {
      if (!current) return current;
      const remaining =
        (current.endsAt
          ? Math.max(0, Math.ceil((current.endsAt - Date.now()) / 1000))
          : current.remaining) + seconds;
      return {
        ...current,
        total: Math.max(current.total, remaining),
        remaining,
        endsAt: current.endsAt ? Date.now() + remaining * 1000 : null,
      };
    });
  }, []);

  const restart = useCallback(() => {
    setRest(null);
    resetSession(slug);
  }, [slug]);

  const restRemaining = rest
    ? rest.endsAt
      ? Math.max(0, Math.ceil((rest.endsAt - Math.max(now, rest.endsAt - rest.total * 1000)) / 1000))
      : rest.remaining
    : 0;

  // At zero the overlay lingers for a beat on a "rest complete" state, then
  // hands back to the exercise screen.
  useEffect(() => {
    if (!rest?.endsAt || restRemaining > 0) return;
    const timer = window.setTimeout(() => setRest(null), 1300);
    return () => window.clearTimeout(timer);
  }, [rest, restRemaining]);

  return {
    /** False until the persisted session has been read on the client. */
    hydrated: session !== null,
    session,
    currentIndex,
    currentExercise,
    exercises,
    setsFor,
    totals,
    elapsedSeconds,
    isComplete: Boolean(session?.finishedAt),
    direction,
    rest: rest
      ? { ...rest, remaining: restRemaining, paused: rest.endsAt === null }
      : null,
    completeSet,
    endRest,
    pauseRest,
    resumeRest,
    addRest,
    next,
    previous,
    goTo,
    finish,
    restart,
  };
}
