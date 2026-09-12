-- ===========================================================================
-- STRONGER — initial schema
--
-- Scope: user-generated data only. The catalogue (programs, exercises,
-- coaches, meals) stays in TypeScript under src/data — it is static content,
-- identical for every member, and does not benefit from a database yet.
--
-- Every table here is owned by exactly one user and is protected by Row Level
-- Security, enabled in the companion migration 20260913090001.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at honest without relying on the client.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles
--
-- One row per member, keyed by the Supabase Auth user id. Authentication
-- data (email, password, provider identities) stays in auth.users and is
-- deliberately not duplicated here.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text,
  first_name     text,
  last_name      text,
  avatar_url     text,
  bio            text,
  date_of_birth  date,
  height_cm      numeric(5, 1) check (height_cm > 0 and height_cm < 300),
  weight_kg      numeric(5, 2) check (weight_kg > 0 and weight_kg < 500),
  experience_level text check (
    experience_level in ('beginner', 'intermediate', 'advanced')
  ),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. user_goals — one active goal record per member.
-- ---------------------------------------------------------------------------
create table public.user_goals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references auth.users (id) on delete cascade,
  primary_goal     text not null check (
    primary_goal in (
      'build-muscle', 'lose-fat', 'get-stronger',
      'improve-fitness', 'improve-wellness', 'live-healthier'
    )
  ),
  secondary_goal   text check (
    secondary_goal in (
      'build-muscle', 'lose-fat', 'get-stronger',
      'improve-fitness', 'improve-wellness', 'live-healthier'
    )
  ),
  target_weight_kg numeric(5, 2) check (target_weight_kg > 0 and target_weight_kg < 500),
  target_date      date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger user_goals_set_updated_at
  before update on public.user_goals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. user_preferences — one row per member.
-- ---------------------------------------------------------------------------
create table public.user_preferences (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null unique references auth.users (id) on delete cascade,
  -- Sessions per week the member wants to train.
  preferred_training_days     smallint check (preferred_training_days between 1 and 7),
  -- Target session length, in minutes.
  preferred_workout_duration  smallint check (preferred_workout_duration between 5 and 240),
  equipment_access            text check (
    equipment_access in ('no-equipment', 'dumbbells', 'home-gym', 'full-gym')
  ),
  preferred_training_location text check (
    preferred_training_location in ('home', 'gym', 'outdoors', 'hybrid')
  ),
  units                       text not null default 'metric'
                                check (units in ('metric', 'imperial')),
  notifications_enabled       boolean not null default true,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. workout_sessions — one row per attempt at a workout.
--
-- workout_slug points at the static catalogue in src/data/workouts.ts. It is
-- intentionally not a foreign key: the catalogue does not live in Postgres.
-- ---------------------------------------------------------------------------
create table public.workout_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  workout_slug     text not null check (length(workout_slug) between 1 and 120),
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  duration_seconds integer check (duration_seconds >= 0),
  total_volume     numeric(10, 2) check (total_volume >= 0),
  completed        boolean not null default false,
  created_at       timestamptz not null default now(),
  constraint workout_sessions_finished_after_start
    check (completed_at is null or completed_at >= started_at)
);

-- History views read a member's sessions newest first.
create index workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);

create index workout_sessions_user_slug_idx
  on public.workout_sessions (user_id, workout_slug);

-- ---------------------------------------------------------------------------
-- 5. workout_session_exercises — the movements performed in a session.
--
-- user_id is denormalised from the parent session so RLS can be enforced with
-- a plain column comparison instead of a subquery on every row.
-- ---------------------------------------------------------------------------
create table public.workout_session_exercises (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.workout_sessions (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  exercise_slug  text not null check (length(exercise_slug) between 1 and 120),
  exercise_order smallint not null check (exercise_order >= 0),
  created_at     timestamptz not null default now(),
  constraint workout_session_exercises_unique_order
    unique (session_id, exercise_order)
);

create index workout_session_exercises_session_idx
  on public.workout_session_exercises (session_id);

-- ---------------------------------------------------------------------------
-- 6. exercise_logs — one row per set.
--
-- Powers workout history, volume, personal records and strength progression.
-- ---------------------------------------------------------------------------
create table public.exercise_logs (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.workout_sessions (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  exercise_slug text not null check (length(exercise_slug) between 1 and 120),
  set_number    smallint not null check (set_number >= 1),
  weight        numeric(6, 2) check (weight >= 0),
  reps          smallint not null check (reps >= 0),
  completed     boolean not null default true,
  created_at    timestamptz not null default now(),
  constraint exercise_logs_unique_set
    unique (session_id, exercise_slug, set_number)
);

-- Personal records and progression charts scan by member and movement.
create index exercise_logs_user_exercise_idx
  on public.exercise_logs (user_id, exercise_slug, created_at desc);

create index exercise_logs_session_idx
  on public.exercise_logs (session_id);

-- ---------------------------------------------------------------------------
-- 7. progress_metrics — a timestamped measurement.
--
-- metric_type is free text on purpose (e.g. 'body_weight', 'body_fat_pct',
-- 'waist_cm') so new measurements do not each require a migration.
-- ---------------------------------------------------------------------------
create table public.progress_metrics (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  metric_type text not null check (length(metric_type) between 1 and 60),
  value       numeric(10, 3) not null,
  unit        text check (length(unit) <= 20),
  recorded_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index progress_metrics_user_type_idx
  on public.progress_metrics (user_id, metric_type, recorded_at desc);

-- ---------------------------------------------------------------------------
-- 8. wellness_logs — one row per member per day.
-- ---------------------------------------------------------------------------
create table public.wellness_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  log_date            date not null default current_date,
  sleep_hours         numeric(4, 2) check (sleep_hours >= 0 and sleep_hours <= 24),
  water_liters        numeric(4, 2) check (water_liters >= 0 and water_liters <= 30),
  steps               integer check (steps >= 0),
  mindfulness_minutes integer check (mindfulness_minutes >= 0),
  recovery_score      smallint check (recovery_score between 0 and 100),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint wellness_logs_one_per_day unique (user_id, log_date)
);

create index wellness_logs_user_date_idx
  on public.wellness_logs (user_id, log_date desc);

create trigger wellness_logs_set_updated_at
  before update on public.wellness_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. nutrition_logs — daily totals, one row per member per day.
-- ---------------------------------------------------------------------------
create table public.nutrition_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  log_date   date not null default current_date,
  calories   integer check (calories >= 0),
  protein_g  numeric(6, 2) check (protein_g >= 0),
  carbs_g    numeric(6, 2) check (carbs_g >= 0),
  fat_g      numeric(6, 2) check (fat_g >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_logs_one_per_day unique (user_id, log_date)
);

create index nutrition_logs_user_date_idx
  on public.nutrition_logs (user_id, log_date desc);

create trigger nutrition_logs_set_updated_at
  before update on public.nutrition_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. habits — member-defined daily commitments.
-- ---------------------------------------------------------------------------
create table public.habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null check (length(name) between 1 and 120),
  description  text,
  frequency    text not null default 'daily'
                 check (frequency in ('daily', 'weekdays', 'weekly', 'custom')),
  target_value numeric(8, 2) check (target_value >= 0),
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index habits_user_active_idx
  on public.habits (user_id) where active;

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 11. habit_completions — a habit can only be completed once per day.
-- ---------------------------------------------------------------------------
create table public.habit_completions (
  id             uuid primary key default gen_random_uuid(),
  habit_id       uuid not null references public.habits (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  completed_date date not null default current_date,
  created_at     timestamptz not null default now(),
  constraint habit_completions_once_per_day unique (habit_id, completed_date)
);

create index habit_completions_user_date_idx
  on public.habit_completions (user_id, completed_date desc);

-- ---------------------------------------------------------------------------
-- 12. saved_programs — a member's bookmarked programs.
-- ---------------------------------------------------------------------------
create table public.saved_programs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  program_slug text not null check (length(program_slug) between 1 and 120),
  created_at   timestamptz not null default now(),
  constraint saved_programs_unique unique (user_id, program_slug)
);

-- ---------------------------------------------------------------------------
-- 13. saved_exercises — a member's bookmarked movements.
-- ---------------------------------------------------------------------------
create table public.saved_exercises (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  exercise_slug text not null check (length(exercise_slug) between 1 and 120),
  created_at    timestamptz not null default now(),
  constraint saved_exercises_unique unique (user_id, exercise_slug)
);

-- ---------------------------------------------------------------------------
-- 14. achievements — unlocked milestones, awarded at most once each.
-- ---------------------------------------------------------------------------
create table public.achievements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  achievement_key text not null check (length(achievement_key) between 1 and 80),
  unlocked_at     timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  constraint achievements_unique unique (user_id, achievement_key)
);

create index achievements_user_idx
  on public.achievements (user_id, unlocked_at desc);
