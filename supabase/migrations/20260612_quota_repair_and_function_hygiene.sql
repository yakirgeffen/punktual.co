-- Applied to punktual-prod (tusfsqivanmjqaldkdtx) 2026-06-12 via Supabase MCP.
-- The 2026-06 project rebuild restored core tables only; the quota system from
-- 20251022_setup_quota_system.sql never made it across. This migration repairs
-- the pieces the app actually reads/calls, wires the profile trigger, and drops
-- dead functions flagged by the security advisors.

-- 1. Quota columns the app reads (useCheckEventQuota selects these)
alter table public.user_profiles
  add column if not exists events_created integer not null default 0,
  add column if not exists quota_reset_date date not null default (date_trunc('month', now()))::date;

-- 2. The RPC the app calls after each save.
-- SECURITY INVOKER: RLS owner-update policy authorizes the row; auth.uid() guard as belt-and-braces.
create or replace function public.increment_event_count(user_id_param uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.user_profiles
     set events_created = events_created + 1,
         updated_at = now()
   where user_id = user_id_param
     and user_id = auth.uid();
$$;
revoke execute on function public.increment_event_count(uuid) from public, anon;
grant execute on function public.increment_event_count(uuid) to authenticated;

-- 3. Make the profile trigger function idempotent and wire it to auth.users
-- (function existed but no trigger referenced it; client-side profile creation
-- can race it safely via ON CONFLICT — user_profiles.user_id is UNIQUE)
create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_user_profile();

-- 4. Hygiene per security advisors: trigger functions must not be client-callable
revoke execute on function public.create_user_profile() from public, anon, authenticated;

-- 5. Drop dead functions: handle_new_user inserted into a public.users table that
-- does not exist (legacy schema leftover, no trigger references it);
-- increment_usage lost its last caller when the duplicate flows were fixed.
drop function if exists public.handle_new_user();
drop function if exists public.increment_usage(uuid, date);
drop function if exists public.increment_usage(uuid, date, integer, integer, integer);
