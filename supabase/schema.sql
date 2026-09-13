-- ============================================================
-- Vyasa Academy - Authentication & Portal schema
-- Run in the Supabase SQL Editor (Dashboard -> SQL -> New query).
-- Requires a Supabase project: https://supabase.com/dashboard
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES (one row per auth user)
--    auth.users is created by Supabase Auth. We extend it here.
--    role is stored on the server (profiles row), never on the client.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  role       text not null default 'student'
             check (role in ('student','parent','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. STUDENT_PROFILES (academic record for role = student)
-- ------------------------------------------------------------
create table if not exists public.student_profiles (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  student_id    text unique not null,          -- academy's own student reference
  class_level   text,                          -- e.g. '10'
  section       text,                          -- e.g. 'B'
  academic_year text,                          -- e.g. '2026-27'
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. PARENT_PROFILES (role = parent)
-- ------------------------------------------------------------
create table if not exists public.parent_profiles (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. STUDENT_PARENT_RELATIONSHIP (which parent may see which student)
--    Only rows a parent is linked to are visible to that parent.
-- ------------------------------------------------------------
create table if not exists public.student_parent_relationship (
  student_user_id uuid references public.profiles (id) on delete cascade,
  parent_user_id  uuid references public.profiles (id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (student_user_id, parent_user_id)
);

-- ------------------------------------------------------------
-- 5. updated_at maintenance
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 6. Auto-create a profile row whenever a user is created.
--    Public sign-up must stay DISABLED in the Auth dashboard,
--    so users only ever arrive through the admin invite flow below.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 7. Helper checks used by RLS policies
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_linked_parent(p_student_user_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.student_parent_relationship r
    where r.student_user_id = p_student_user_id
      and r.parent_user_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- 8. ROW LEVEL SECURITY  (the real authorization boundary)
-- ------------------------------------------------------------

-- --- profiles ---
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.student_parent_relationship enable row level security;

drop policy if exists "profiles_select_own"         on public.profiles;
drop policy if exists "profiles_update_own"         on public.profiles;
drop policy if exists "student_select_own_or_parent" on public.student_profiles;
drop policy if exists "parent_select_own"           on public.parent_profiles;
drop policy if exists "rel_select_participant"      on public.student_parent_relationship;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- users may maintain their own name only; role/id are server-managed.
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "student_select_own_or_parent"
  on public.student_profiles for select
  using (user_id = auth.uid() or public.is_linked_parent(user_id));

create policy "parent_select_own"
  on public.parent_profiles for select
  using (user_id = auth.uid());

create policy "rel_select_participant"
  on public.student_parent_relationship for select
  using (
    student_user_id = auth.uid()
    or parent_user_id = auth.uid()
    or public.is_admin()
  );

-- No INSERT/UPDATE/DELETE policies on these tables -> denied for everyone.
-- Data is created only by the security definer trigger and the admin function.

-- Hard revoke on the public tables for the built-in roles (defense in depth).
revoke all on public.profiles                 from anon, authenticated;
revoke all on public.student_profiles          from anon, authenticated;
revoke all on public.parent_profiles           from anon, authenticated;
revoke all on public.student_parent_relationship from anon, authenticated;

grant select                            on public.profiles                 to authenticated;
grant select                            on public.student_profiles          to authenticated;
grant select                            on public.parent_profiles           to authenticated;
grant select                            on public.student_parent_relationship to authenticated;
grant update (full_name)                on public.profiles                 to authenticated;

-- ------------------------------------------------------------
-- 9. ADMIN INVITE FLOW (server-side, future Admin dashboard)
--    Creates an auth user with the role + name baked into metadata;
--    the trigger above creates the matching profiles row.
--    No public UI calls this directly - an Admin page will later.
--    After this function returns, the future admin page triggers the
--    "set your password" email via Supabase resetPasswordForEmail(email),
--    completing the invite: admin creates -> user gets email ->
--    user sets password -> user logs in.
-- ------------------------------------------------------------
create or replace function public.admin_create_user(
  p_email text,
  p_full_name text,
  p_role text default 'student',
  p_password text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid;
begin
  if not public.is_admin() then
    raise exception 'Only an academy administrator can create users.';
  end if;

  if p_role not in ('student','parent','admin') then
    raise exception 'Invalid role.';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters.';
  end if;

  v_uid := auth.admin_create_user(
    email      => p_email,
    password   => p_password,
    email_confirm => true,
    user_metadata => jsonb_build_object('full_name', p_full_name, 'role', p_role)
  );

  return v_uid;
end;
$$;

revoke all on function public.admin_create_user(text, text, text, text)
  from anon, authenticated;

-- ------------------------------------------------------------
-- 10. ADMIN PORTAL - create / link / list accounts
--     Every function is SECURITY DEFINER and starts by verifying
--     the CALLER is an admin (is_admin). Only authenticated may
--     execute them (revoked from PUBLIC / anon first).
-- ------------------------------------------------------------

-- Admins may also read the child tables directly (portal UI lists).
drop policy if exists "student_select_own_or_parent" on public.student_profiles;
create policy "student_select_own_or_parent"
  on public.student_profiles for select
  using (user_id = auth.uid() or public.is_linked_parent(user_id) or public.is_admin());

drop policy if exists "parent_select_own" on public.parent_profiles;
create policy "parent_select_own"
  on public.parent_profiles for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "rel_select_participant" on public.student_parent_relationship;
create policy "rel_select_participant"
  on public.student_parent_relationship for select
  using (student_user_id = auth.uid() or parent_user_id = auth.uid() or public.is_admin());

-- Create a STUDENT account in one step (auth user + profiles + student_profiles).
create or replace function public.admin_create_student(
  p_email text,
  p_full_name text,
  p_student_id text,
  p_class_level text default null,
  p_section text default null,
  p_academic_year text default null
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid  uuid;
  v_temp text;
begin
  if not public.is_admin() then
    raise exception 'Only an academy administrator can create users.';
  end if;
  if p_email is null or p_full_name is null or p_student_id is null then
    raise exception 'Email, full name and student ID are required.';
  end if;
  if exists (select 1 from auth.users u where lower(u.email) = lower(p_email)) then
    raise exception 'An account already exists for this email.';
  end if;
  if exists (select 1 from public.student_profiles s where s.student_id = p_student_id) then
    raise exception 'This student ID is already in use.';
  end if;

  v_temp := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12) || 'Aa1!';

  v_uid := auth.admin_create_user(
    email         => p_email,
    password      => v_temp,
    email_confirm => true,
    user_metadata => jsonb_build_object('full_name', p_full_name, 'role', 'student')
  );

  insert into public.student_profiles (user_id, student_id, class_level, section, academic_year)
  values (v_uid, p_student_id, p_class_level, p_section, p_academic_year);

  return jsonb_build_object('user_id', v_uid, 'temp_password', v_temp);
end;
$$;

-- Create a PARENT account in one step (auth user + profiles + parent_profiles).
create or replace function public.admin_create_parent(
  p_email text,
  p_full_name text
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid  uuid;
  v_temp text;
begin
  if not public.is_admin() then
    raise exception 'Only an academy administrator can create users.';
  end if;
  if p_email is null or p_full_name is null then
    raise exception 'Email and full name are required.';
  end if;
  if exists (select 1 from auth.users u where lower(u.email) = lower(p_email)) then
    raise exception 'An account already exists for this email.';
  end if;

  v_temp := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12) || 'Aa1!';

  v_uid := auth.admin_create_user(
    email         => p_email,
    password      => v_temp,
    email_confirm => true,
    user_metadata => jsonb_build_object('full_name', p_full_name, 'role', 'parent')
  );

  insert into public.parent_profiles (user_id)
  values (v_uid);

  return jsonb_build_object('user_id', v_uid, 'temp_password', v_temp);
end;
$$;

-- Link one or more students to a parent (the parent then sees them).
create or replace function public.admin_link_students(
  p_parent_user_id uuid,
  p_student_user_ids uuid[]
)
returns integer
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an academy administrator can link accounts.';
  end if;
  if p_parent_user_id is null or p_student_user_ids is null
     or cardinality(p_student_user_ids) = 0 then
    raise exception 'Select a parent and at least one student.';
  end if;

  insert into public.student_parent_relationship (student_user_id, parent_user_id)
  select s, p_parent_user_id
  from unnest(p_student_user_ids) as s
  where not exists (
    select 1 from public.student_parent_relationship r
    where r.student_user_id = s and r.parent_user_id = p_parent_user_id
  );

  return 1;
end;
$$;

-- List all accounts for the portal (students with class info, parents
-- with linked-children count). Caller must be an admin.
create or replace function public.admin_list_accounts()
returns jsonb
language sql
security definer set search_path = public
stable
as $$
  select coalesce(jsonb_agg(row_to_json(t) order by t.role, t.full_name), '[]'::jsonb)
  from (
    select
      p.id                 as user_id,
      u.email              as email,
      p.full_name          as full_name,
      p.role               as role,
      p.created_at         as created_at,
      sp.student_id        as student_id,
      sp.class_level       as class_level,
      sp.section           as section,
      sp.academic_year     as academic_year,
      (
        select count(*)::int
        from public.student_parent_relationship r
        where r.parent_user_id = p.id
      )                    as linked_students
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.student_profiles sp on sp.user_id = p.id
  ) t;
$$;

revoke execute on function public.admin_create_student(text, text, text, text, text, text) from public, anon;
revoke execute on function public.admin_create_parent(text, text) from public, anon;
revoke execute on function public.admin_link_students(uuid, uuid[]) from public, anon;
revoke execute on function public.admin_list_accounts() from public, anon;

grant execute on function public.admin_create_student(text, text, text, text, text, text) to authenticated;
grant execute on function public.admin_create_parent(text, text) to authenticated;
grant execute on function public.admin_link_students(uuid, uuid[]) to authenticated;
grant execute on function public.admin_list_accounts() to authenticated;