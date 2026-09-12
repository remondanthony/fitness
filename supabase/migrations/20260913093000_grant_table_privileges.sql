-- ===========================================================================
-- STRONGER — table privileges for the authenticated role
--
-- Fixes a gap in the Part 10 migrations. Those created the 14 tables and
-- enabled RLS with 56 ownership policies, but never granted the Postgres
-- roles any privileges on the tables. Privileges and RLS are two separate
-- gates: RLS decides *which rows* a role may see, GRANT decides whether the
-- role may touch the table at all. Without the grant every authenticated
-- request failed with:
--
--   403  42501  permission denied for table profiles
--
-- Tables created through the dashboard pick these grants up automatically;
-- tables created by raw SQL migration do not.
--
-- Security notes:
--   * `anon` gets schema usage only — no table privileges — so anonymous
--     callers stay blocked at the privilege layer as well as by RLS.
--   * `authenticated` gets row-level DML, but every statement is still
--     filtered by the existing `(select auth.uid()) = user_id` policies.
--     Nothing here weakens or replaces them.
--   * No policy is created, altered or dropped by this migration.
-- ===========================================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on all tables in schema public
  to authenticated;

-- Applies to tables added later by the migration owner, so future parts do
-- not rediscover this problem.
alter default privileges in schema public
  grant select, insert, update, delete
  on tables
  to authenticated;
