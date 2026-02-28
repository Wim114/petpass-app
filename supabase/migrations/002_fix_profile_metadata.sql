-- ============================================================
-- Migration: Fix profile metadata from auth signup
-- ============================================================
-- The handle_new_user() trigger was only copying id and email.
-- This update also copies first_name, last_name, and district
-- from auth.users.raw_user_meta_data into the profiles table.
-- ============================================================

-- Update the trigger function to copy metadata fields
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, district, referral_code)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'district',
    'PPV-' || upper(substr(md5(random()::text), 1, 6))
  );
  return new;
end;
$$;

-- Backfill existing profiles that have null first_name/last_name
-- from the auth.users metadata (for users who signed up before this fix)
update public.profiles p
set
  first_name = coalesce(p.first_name, u.raw_user_meta_data->>'first_name'),
  last_name = coalesce(p.last_name, u.raw_user_meta_data->>'last_name'),
  district = coalesce(p.district, u.raw_user_meta_data->>'district'),
  updated_at = now()
from auth.users u
where p.id = u.id
  and (p.first_name is null or p.last_name is null)
  and u.raw_user_meta_data->>'first_name' is not null;

-- ============================================================
-- Admin bootstrap: RPC to claim admin role (only if no admin exists)
-- ============================================================
create or replace function public.claim_admin_role()
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only allow if no admin exists in the system
  if exists (select 1 from public.profiles where role = 'admin') then
    return false;
  end if;

  -- Promote the calling user to admin
  update public.profiles
  set role = 'admin', updated_at = now()
  where id = auth.uid();

  return true;
end;
$$;
