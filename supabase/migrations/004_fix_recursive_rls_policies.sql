-- ============================================================
-- Migration: Fix recursive RLS policies causing 500 errors
-- ============================================================
-- The "Admins can view all ..." policies use a subquery on
-- public.profiles, which itself has RLS enabled. When the
-- current user IS an admin, evaluating the profiles policy
-- triggers the same subquery again → infinite recursion → 500.
--
-- Fix: create a SECURITY DEFINER function that checks admin
-- status bypassing RLS, then update all policies to use it.
-- ============================================================

-- 1. Create a helper function that bypasses RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Drop and recreate all admin policies to use is_admin()

-- ---- profiles ----
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ---- pets ----
drop policy if exists "Admins can view all pets" on public.pets;
create policy "Admins can view all pets"
  on public.pets for select
  using (public.is_admin());

-- ---- subscriptions ----
drop policy if exists "Admins can view all subscriptions" on public.subscriptions;
create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

-- ---- payments ----
drop policy if exists "Admins can view all payments" on public.payments;
create policy "Admins can view all payments"
  on public.payments for select
  using (public.is_admin());

-- ---- waitlist ----
drop policy if exists "Admins can view waitlist" on public.waitlist;
create policy "Admins can view waitlist"
  on public.waitlist for select
  using (public.is_admin());

-- ---- referrals ----
drop policy if exists "Admins can view all referrals" on public.referrals;
create policy "Admins can view all referrals"
  on public.referrals for select
  using (public.is_admin());

-- ---- admin_logs ----
drop policy if exists "Admins can insert admin logs" on public.admin_logs;
create policy "Admins can insert admin logs"
  on public.admin_logs for insert
  with check (public.is_admin());

drop policy if exists "Admins can view admin logs" on public.admin_logs;
create policy "Admins can view admin logs"
  on public.admin_logs for select
  using (public.is_admin());
