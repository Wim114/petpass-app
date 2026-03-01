-- ============================================================
-- Migration: Ensure profile exists for authenticated users
-- ============================================================
-- Handles the edge case where auth.users exists but profiles
-- row is missing (e.g. profile was manually deleted, or the
-- on_auth_user_created trigger didn't fire).
-- ============================================================

-- 1. Allow users to insert their own profile row
--    (the trigger uses SECURITY DEFINER and bypasses RLS,
--     but the client-side fallback needs this policy)
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- 2. RPC function that creates a profile if one doesn't exist.
--    Runs as SECURITY DEFINER so it can read auth.users metadata
--    and insert into profiles regardless of RLS.
create or replace function public.ensure_profile_exists()
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  _profile profiles;
  _user record;
begin
  -- Check if profile already exists
  select * into _profile from public.profiles where id = auth.uid();

  if found then
    return row_to_json(_profile);
  end if;

  -- Get user metadata from auth.users
  select id, email, raw_user_meta_data
  into _user
  from auth.users
  where id = auth.uid();

  if not found then
    raise exception 'User not found';
  end if;

  -- Create the missing profile
  insert into public.profiles (id, email, first_name, last_name, district, referral_code)
  values (
    _user.id,
    _user.email,
    _user.raw_user_meta_data->>'first_name',
    _user.raw_user_meta_data->>'last_name',
    _user.raw_user_meta_data->>'district',
    'PPV-' || upper(substr(md5(random()::text), 1, 6))
  )
  returning * into _profile;

  return row_to_json(_profile);
end;
$$;
