-- ===========================================================================
-- STRONGER — tie a habit completion to a habit the member actually owns
--
-- Same class of gap as the exercise_logs insert policy hardened in
-- 20260913100000. The Part 10 policy checked only that the row's user_id
-- matched the caller, so an authenticated member could insert a completion
-- carrying their own user_id but pointing at another member's habit_id.
--
-- As before it leaks nothing — reads are scoped by user_id — but the
-- invariant belongs in the database rather than resting on application code.
--
-- Scope: the habit_completions INSERT policy only. No schema change, no new
-- constraint, and the SELECT / UPDATE / DELETE policies are left untouched.
-- ===========================================================================

drop policy if exists "habit_completions_insert_own" on public.habit_completions;

create policy "habit_completions_insert_own"
  on public.habit_completions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.user_id = (select auth.uid())
    )
  );
