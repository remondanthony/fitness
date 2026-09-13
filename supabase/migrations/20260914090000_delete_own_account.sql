-- ===========================================================================
-- STRONGER — let a member delete their own account
--
-- Removing a row from auth.users is privileged: the `authenticated` role
-- cannot do it. The usual answer is a service-role key called from the server,
-- but that means a credential that bypasses RLS entirely living in the
-- environment, and this project has deliberately never had one.
--
-- This function is the narrower alternative. It is SECURITY DEFINER, so it
-- runs with the privileges needed to delete the row, and it takes NO
-- ARGUMENTS: the account it deletes is always `auth.uid()`, read from the
-- caller's own JWT. There is no user id to tamper with, so there is no request
-- a member could craft that deletes somebody else. A leaked service-role key
-- could delete every account; the worst this function can do is delete the
-- account of whoever calls it, which is what it is for.
--
-- Every one of the 14 application tables references auth.users(id) with
-- ON DELETE CASCADE, so this single delete removes the member's profile,
-- goals, preferences, workout sessions, exercise logs, nutrition and wellness
-- logs, habits, habit completions, progress metrics, achievements and saved
-- items. Nothing is enumerated here, so a table added later is covered by its
-- own foreign key rather than by remembering to edit this function.
--
-- Storage objects are NOT touched here. Deleting rows from storage.objects
-- would orphan the underlying files rather than remove them, so the avatar is
-- deleted through the Storage API before this is called — see
-- src/lib/actions/account-deletion.ts.
--
-- Scope: one new function. No table, column, policy or existing function is
-- changed.
-- ===========================================================================

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
-- Empty search_path so every name below is resolved explicitly and nothing
-- can be shadowed by a schema the caller controls.
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'delete_own_account requires an authenticated caller'
      using errcode = '28000';
  end if;

  -- The only statement. `caller` comes from the JWT, never from an argument.
  delete from auth.users where id = caller;
end;
$$;

comment on function public.delete_own_account() is
  'Deletes the calling member''s own auth account. Takes no arguments: the '
  'target is always auth.uid(), so it cannot be pointed at another user. '
  'Application data follows via ON DELETE CASCADE.';

-- Only a signed-in member may call it. Anonymous visitors and PUBLIC cannot.
revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
