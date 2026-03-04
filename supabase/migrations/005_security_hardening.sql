-- ============================================================
-- Migration: Security Hardening
-- Fixes critical vulnerabilities found during security audit.
-- ============================================================

-- ============================================================
-- V1 FIX: Prevent users from modifying their own role
-- The existing "Users can update their own profile" policy
-- has no WITH CHECK clause, allowing role escalation.
-- ============================================================

-- Drop the existing permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Re-create with WITH CHECK that preserves the existing role value
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ============================================================
-- V3 FIX: Remove user CRUD policies on subscriptions and payments.
-- Only the server (service_role) should write these tables.
-- Stripe webhooks use supabaseAdmin which bypasses RLS.
-- ============================================================

-- Drop user-writable subscription policies
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;

-- Drop user-writable payment policies
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;

-- Users should only be able to READ their own subscription/payment data
-- (SELECT policies already exist from migration 001)

-- ============================================================
-- V9 FIX: Drop the claim_admin_role() RPC function.
-- This was only needed for initial bootstrap and is a
-- privilege escalation vector if left in place.
-- ============================================================

DROP FUNCTION IF EXISTS public.claim_admin_role();
