-- ===========================================================================
-- STRONGER — tie an exercise log to a session the member actually owns
--
-- The Part 10 insert policy checked only that the row's user_id matched the
-- caller. That let an authenticated member insert a log carrying their own
-- user_id but pointing at somebody else's session_id.
--
-- It exposed nothing: RLS scopes reads by user_id, so the owner of the
-- referenced session could not see the row and their session's log count was
-- unaffected. The Server Action never produced such a row either, because it
-- only ever uses a server-resolved session id. But the invariant belongs in
-- the database rather than resting on application code, so it is enforced
-- here.
--
-- Scope: the exercise_logs INSERT policy only. No schema change, no new
-- constraint, and the SELECT / UPDATE / DELETE policies are left untouched.
-- ===========================================================================

drop policy if exists "exercise_logs_insert_own" on public.exercise_logs;

create policy "exercise_logs_insert_own"
  on public.exercise_logs for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );
