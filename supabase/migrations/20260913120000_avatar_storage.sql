-- ===========================================================================
-- STRONGER — profile picture storage
--
-- A private bucket for member avatars, with ownership enforced by the first
-- folder in the object path. Nothing in the application decides who owns a
-- file: `storage.foldername(name)[1]` must equal the caller's own uid, so a
-- member can only ever read or write inside their own folder.
--
-- Private rather than public: STRONGER has no public profile surface, so an
-- avatar is the member's own data. Reads go through short-lived signed URLs
-- created server-side for the owner.
--
-- Scope: the storage bucket and its four policies. No change to any table in
-- the public schema, and no change to any existing RLS policy. The profile
-- reference itself reuses the `profiles.avatar_url` column that has existed
-- since the initial schema.
-- ===========================================================================

-- 2 MiB, matching MAX_AVATAR_BYTES in src/lib/avatar-rules.ts. The bucket is
-- the backstop: even if a client skipped every check, Storage refuses a larger
-- file or a type outside this list.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Objects live at '<user id>/avatar-<timestamp>.<ext>', so the first path
-- segment is the owner. Anything outside the caller's own folder is refused
-- by all four verbs — there is deliberately no policy that lets an
-- authenticated member write anywhere in the bucket.
drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- USING picks the rows that may be changed; WITH CHECK stops the change from
-- moving an object out of the caller's folder.
drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
