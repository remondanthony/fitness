-- ===========================================================================
-- STRONGER — membership tiers (free / pro / elite)
--
-- Why a table rather than a column on profiles
-- --------------------------------------------
-- `profiles_update_own` is column-agnostic:
--
--     using ((select auth.uid()) = id) with check ((select auth.uid()) = id)
--
-- combined with a table-level UPDATE grant to `authenticated`. Every column on
-- profiles is therefore writable by its owner from the browser, so a
-- `membership` column there would be a self-service upgrade button:
--
--     supabase.from('profiles').update({ membership: 'elite' })
--
-- Making that safe would mean either replacing the table-level grant with
-- column-level grants, or adding a trigger to guard one column — both of which
-- modify security machinery that account deletion, onboarding and avatars all
-- depend on. A separate table changes none of it and is trivial to audit: it
-- has exactly one policy, and that policy only reads.
--
-- Who can write it
-- ----------------
-- Nobody, through the application, and two independent things stop it.
--
--   1. RLS: there is no INSERT, UPDATE or DELETE policy, and a statement with
--      no matching policy is refused.
--   2. Privileges: those three verbs are revoked from `authenticated` below.
--
-- The revoke is not redundant. 20260913093000 set default privileges granting
-- all four verbs on every future table in this schema:
--
--     alter default privileges in schema public
--       grant select, insert, update, delete on tables to authenticated;
--
-- so this table was created holding INSERT, UPDATE and DELETE whether or not
-- they were asked for, and a plain `grant select` does not take them away.
-- Without the explicit revoke, RLS would be the only thing standing between a
-- member and their own tier — and one mistaken policy later, nothing would be.
--
-- Tier changes are an administrative act today, and in Part 18 will come from
-- verified provider state on the server. Neither path runs as `authenticated`.
--
-- Absence means free
-- ------------------
-- A member with no row here is on the free tier. That keeps the default safe
-- without a provisioning trigger, needs no backfill for existing accounts, and
-- means a failure to read can never silently promote anyone.
--
-- Scope: one new table, one SELECT policy, one SELECT grant. No existing
-- table, policy, grant, trigger or function is altered. No payment, invoice,
-- subscription or webhook state — that is Part 18.
-- ===========================================================================

create table public.user_memberships (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  -- The allowed set is fixed here as well as in TypeScript, so a value the
  -- application would reject can never reach the column either.
  tier       text not null default 'free'
               check (tier in ('free', 'pro', 'elite')),
  -- Why the tier is what it is: 'admin' today, a provider reference later.
  -- Deliberately free text and nullable; Part 18 gives it structure.
  source     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_memberships is
  'One row per member with a paid tier. No row means free. Read-only to '
  'members: there is no write policy, so tier changes cannot originate from '
  'an authenticated session.';

create trigger user_memberships_set_updated_at
  before update on public.user_memberships
  for each row execute function public.set_updated_at();

alter table public.user_memberships enable row level security;

-- The only policy. A member may read their own tier and nothing else; the
-- absence of write policies is what stops them changing it.
create policy "user_memberships_select_own"
  on public.user_memberships for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- SELECT only. The revoke undoes the schema-wide default privileges described
-- at the top of this file, so an attempted write fails on privileges before
-- RLS is consulted at all.
revoke insert, update, delete on public.user_memberships from authenticated;
revoke all on public.user_memberships from anon;
grant select on public.user_memberships to authenticated;
