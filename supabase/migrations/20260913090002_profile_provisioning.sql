-- ===========================================================================
-- STRONGER — profile provisioning
--
-- Creates the profile row the moment a member signs up, so the rest of the
-- app can assume one exists. This is schema plumbing, not authentication:
-- sign-up, sign-in and session handling arrive in Part 11.
--
-- The function is SECURITY DEFINER because it writes to public.profiles while
-- running inside the auth.users insert, before any session exists. search_path
-- is pinned to defeat search-path hijacking, and the body only ever inserts a
-- row keyed by the new user's own id.
-- ===========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, first_name, last_name)
  values (
    new.id,
    -- Supabase puts anything passed via signUp options.data into raw_user_meta_data.
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name',
                         new.raw_user_meta_data ->> 'name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
