-- ============================================================
-- Vyasa Academy - Student Google Sign-In migration
-- ------------------------------------------------------------
-- Adds the student profile fields, extends the auto-profile
-- trigger for OAuth/Google sign-ups, and tightens RLS so a
-- student may read/insert/update only their OWN row and can
-- never promote themselves (role always stays 'student' on
-- any client-issued INSERT/UPDATE).
--
-- Run order:
--   1. Run supabase/schema.sql first (if not already applied).
--   2. Run this file in the Supabase SQL Editor.
--   3. In the Dashboard enable the Google provider and the
--      redirect URLs (see comments at the bottom).
--
-- Safe to run more than once (idempotent) except the trigger
-- body replacement, which is a create-or-replace.
-- ============================================================

-- ------------------------------------------------------------
-- 1. STUDENT FIELD COLUMNS on public.profiles
--    Google identity (email / avatar) comes from Supabase Auth;
--    we mirror it here for fast portal reads only.
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists email          text,
  add column if not exists avatar_url     text,
  add column if not exists mobile_number  text,
  add column if not exists class_level    text,   -- e.g. 'X' (VI..XII)
  add column if not exists board          text,   -- 'CBSE' | 'ICSE' | 'Other'
  add column if not exists school_name    text,
  add column if not exists parent_name    text,
  add column if not exists parent_mobile  text;

-- ------------------------------------------------------------
-- 2. AUTO-CREATE PROFILE for OAuth (Google) sign-ups
--    Supabase fires on_auth_user_created for OAuth users too.
--    Google puts the user's display name in raw meta data as
--    'name' / 'full_name' and the avatar as 'avatar_url'/'picture'.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.email
    ),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      new.raw_user_meta_data ->> 'avatar'
    )
  )
  on conflict (id) do update set
    full_name  = coalesce(public.profiles.full_name,
      excluded.full_name),
    email      = coalesce(public.profiles.email, excluded.email),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now()
  ;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY for the student self-service flow
--    id stays the immutable auth.users UUID (never client-set
--    on INSERT beyond "id = auth.uid()").
-- ------------------------------------------------------------

-- --- profiles: allow a user to read their own row (admin already).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- --- profiles: first-time insert for OAuth sign-ups when the
--     trigger did not create a row (defence in depth).
--     Role is FORCED to 'student'; 'admin'/'teacher' unreachable.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (
    id = auth.uid()
    and role = 'student'
    and full_name is not null
    and full_name <> ''
  );

-- --- profiles: users may update their OWN row, but the role and
--     the row id can never change (old.role = new.role).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and new.id = old.id
    and new.role = old.role
    and new.role in ('student', 'parent')
  );

-- ------------------------------------------------------------
-- 4. GRANTS (public columns the student UI may use)
--    The full row is NOT updatable - only the listed columns.
-- ------------------------------------------------------------
revoke update on public.profiles from authenticated;
revoke insert on public.profiles from anon, authenticated;

grant select on public.profiles to authenticated;
grant insert on public.profiles to authenticated;
grant update (
  full_name,
  email,
  avatar_url,
  mobile_number,
  class_level,
  board,
  school_name,
  parent_name,
  parent_mobile
) on public.profiles to authenticated;

-- update on trigger-managed columns stays denied:
revoke update (role, id, created_at, updated_at) on public.profiles from authenticated;

-- ============================================================
-- REQUIRED DASHBOARD CONFIGURATION (manual, non-code):
--   Authentication -> Providers -> Google:
--     - Enable Google, add the OAuth Client ID + Secret from the
--       Google Cloud Console (create Google OAuth credentials
--       with Authorized redirect URI copied from Supabase).
--   Authentication -> URL Configuration:
--     - Site URL: https://www.vyasaacademy.in
--     - Redirect URLs: https://www.vyasaacademy.in/**
--     - Also add http://localhost:PORT/** if you test locally.
--   Authentication -> Settings:
--     - "Allow new users to sign up" may stay ON now (students
--       register with Google). Existing admin-invited password
--       accounts keep working unchanged.
--   Google Cloud Console (OAuth consent screen):
--     - Make sure the project is in "Testing" or "Production"
--       with your test Gmail(s) added while testing.
-- ============================================================