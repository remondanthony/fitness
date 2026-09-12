-- ===========================================================================
-- STRONGER — Row Level Security
--
-- Every table in this schema holds one member's private data, so all 14 have
-- RLS enabled and four explicit policies each (select / insert / update /
-- delete). There is no `using (true)` anywhere: a member can only ever reach
-- rows they own.
--
-- Ownership is checked with `(select auth.uid())` rather than a bare
-- `auth.uid()`. Postgres evaluates the subquery once per statement instead of
-- once per row, which keeps large history scans fast.
--
-- Unauthenticated requests have a null auth.uid(), so every policy fails
-- closed and anonymous callers see nothing.
-- ===========================================================================

-- Enable RLS everywhere first, so no table is ever briefly readable.
alter table public.profiles enable row level security;
alter table public.user_goals enable row level security;
alter table public.user_preferences enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_session_exercises enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.progress_metrics enable row level security;
alter table public.wellness_logs enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.saved_programs enable row level security;
alter table public.saved_exercises enable row level security;
alter table public.achievements enable row level security;

-- --------------------------------------------------------------------------
-- profiles
-- --------------------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- --------------------------------------------------------------------------
-- user_goals
-- --------------------------------------------------------------------------
create policy "user_goals_select_own"
  on public.user_goals for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_goals_insert_own"
  on public.user_goals for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_goals_update_own"
  on public.user_goals for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_goals_delete_own"
  on public.user_goals for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- user_preferences
-- --------------------------------------------------------------------------
create policy "user_preferences_select_own"
  on public.user_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_preferences_delete_own"
  on public.user_preferences for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- workout_sessions
-- --------------------------------------------------------------------------
create policy "workout_sessions_select_own"
  on public.workout_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "workout_sessions_insert_own"
  on public.workout_sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workout_sessions_update_own"
  on public.workout_sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "workout_sessions_delete_own"
  on public.workout_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- workout_session_exercises
-- --------------------------------------------------------------------------
create policy "workout_session_exercises_select_own"
  on public.workout_session_exercises for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "workout_session_exercises_insert_own"
  on public.workout_session_exercises for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workout_session_exercises_update_own"
  on public.workout_session_exercises for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "workout_session_exercises_delete_own"
  on public.workout_session_exercises for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- exercise_logs
-- --------------------------------------------------------------------------
create policy "exercise_logs_select_own"
  on public.exercise_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "exercise_logs_insert_own"
  on public.exercise_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "exercise_logs_update_own"
  on public.exercise_logs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "exercise_logs_delete_own"
  on public.exercise_logs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- progress_metrics
-- --------------------------------------------------------------------------
create policy "progress_metrics_select_own"
  on public.progress_metrics for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "progress_metrics_insert_own"
  on public.progress_metrics for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "progress_metrics_update_own"
  on public.progress_metrics for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "progress_metrics_delete_own"
  on public.progress_metrics for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- wellness_logs
-- --------------------------------------------------------------------------
create policy "wellness_logs_select_own"
  on public.wellness_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "wellness_logs_insert_own"
  on public.wellness_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "wellness_logs_update_own"
  on public.wellness_logs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "wellness_logs_delete_own"
  on public.wellness_logs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- nutrition_logs
-- --------------------------------------------------------------------------
create policy "nutrition_logs_select_own"
  on public.nutrition_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "nutrition_logs_insert_own"
  on public.nutrition_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "nutrition_logs_update_own"
  on public.nutrition_logs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "nutrition_logs_delete_own"
  on public.nutrition_logs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- habits
-- --------------------------------------------------------------------------
create policy "habits_select_own"
  on public.habits for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "habits_insert_own"
  on public.habits for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "habits_update_own"
  on public.habits for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "habits_delete_own"
  on public.habits for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- habit_completions
-- --------------------------------------------------------------------------
create policy "habit_completions_select_own"
  on public.habit_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "habit_completions_insert_own"
  on public.habit_completions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "habit_completions_update_own"
  on public.habit_completions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "habit_completions_delete_own"
  on public.habit_completions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- saved_programs
-- --------------------------------------------------------------------------
create policy "saved_programs_select_own"
  on public.saved_programs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "saved_programs_insert_own"
  on public.saved_programs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "saved_programs_update_own"
  on public.saved_programs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "saved_programs_delete_own"
  on public.saved_programs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- saved_exercises
-- --------------------------------------------------------------------------
create policy "saved_exercises_select_own"
  on public.saved_exercises for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "saved_exercises_insert_own"
  on public.saved_exercises for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "saved_exercises_update_own"
  on public.saved_exercises for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "saved_exercises_delete_own"
  on public.saved_exercises for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------------
-- achievements
-- --------------------------------------------------------------------------
create policy "achievements_select_own"
  on public.achievements for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "achievements_insert_own"
  on public.achievements for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "achievements_update_own"
  on public.achievements for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "achievements_delete_own"
  on public.achievements for delete
  to authenticated
  using ((select auth.uid()) = user_id);

