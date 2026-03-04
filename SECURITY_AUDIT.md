# PetPass Vienna - Security Audit Report

**Date:** 2026-03-04
**Auditor:** Automated Security Review (Claude)
**Target:** https://petpass-app.vercel.app
**Scope:** Full-stack codebase review (Phases 1-6)

---

## 1. Architecture Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (CLIENT)                        │
│  React 19 + Vite + React Router v7 + Zustand + React Query     │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ AuthGuard │  │AdminGuard│  │ Auth     │  │Dashboard │       │
│  │(frontend) │  │(frontend)│  │ Store    │  │  Pages   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│       │              │            │               │             │
│       ▼              ▼            ▼               ▼             │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  supabase-js (anon key) + apiCall() utility          │       │
│  │  VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY          │       │
│  └──────────────────┬──────────────────────────────────┘       │
└─────────────────────┼───────────────────────────────────────────┘
                      │  JWT Bearer Token
         ┌────────────┼────────────────┐
         ▼                             ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│  Supabase PostgREST  │  │  Vercel Serverless Functions      │
│  (RLS Enforcement)   │  │  /api/*                           │
│                      │  │                                   │
│  profiles, pets,     │  │  admin-stats.ts                   │
│  subscriptions,      │  │  create-checkout-session.ts       │
│  payments, waitlist, │  │  create-portal-session.ts         │
│  referrals,          │  │  delete-account.ts                │
│  admin_logs,         │  │  plan-config.ts                   │
│  site_config         │  │  stripe-webhook.ts                │
│                      │  │  sync-stripe-customer.ts          │
└─────────────────────┘  │                                   │
                         │  Uses: supabaseAdmin               │
                         │  (SERVICE_ROLE_KEY — bypasses RLS) │
                         └──────────────┬────────────────────┘
                                        │
                         ┌──────────────┼───────────────┐
                         ▼              ▼               ▼
                    ┌──────────┐  ┌──────────┐  ┌──────────┐
                    │ Supabase │  │  Stripe  │  │ Supabase │
                    │ Database │  │   API    │  │  Auth    │
                    └──────────┘  └──────────┘  └──────────┘
```

### Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser → Supabase PostgREST | RLS policies enforce row-level access |
| Browser → Vercel API | JWT verification + role checks in each handler |
| Vercel API → Supabase | SERVICE_ROLE_KEY bypasses all RLS |
| Stripe → Vercel Webhook | Stripe signature verification |
| Browser → Supabase Storage | Storage bucket policies (not audited in SQL) |

---

## 2. Auth Flow

```
SIGNUP:
  Browser → supabase.auth.signUp({email, password, metadata})
    → Supabase creates auth.users row
    → Trigger: handle_new_user() creates profiles row
    → Session returned with JWT

SIGN IN:
  Browser → supabase.auth.signInWithPassword()
    → JWT issued → stored in localStorage (persistSession: true)
    → authStore.fetchProfile() loads profile from DB
    → Profile.role determines admin access

API CALLS:
  Browser → apiCall(endpoint)
    → Gets session.access_token from supabase.auth.getSession()
    → Sends Authorization: Bearer {token}
    → Vercel API → verifyUser() validates JWT via supabase.auth.getUser()

ADMIN ACCESS:
  Frontend: AdminGuard checks profile?.role === 'admin'
  Backend: verifyUser() + profiles.role === 'admin' query
```

---

## 3. Authorization Model

| Resource | Frontend Guard | Backend Guard | RLS |
|----------|---------------|---------------|-----|
| Dashboard pages | AuthGuard | N/A (direct Supabase) | Yes - own rows |
| Admin pages | AdminGuard | verifyUser + role check | Admin SELECT |
| Admin stats API | N/A | verifyUser + admin check | N/A (service role) |
| Plan config GET | None | None (public) | SELECT using(true) |
| Plan config PUT | N/A | verifyUser + admin check | N/A (service role) |
| Delete account | AuthGuard | verifyUser (own user) | N/A (service role) |
| Checkout session | AuthGuard | verifyUser | N/A (service role) |
| Portal session | AuthGuard | verifyUser | N/A (service role) |
| Stripe webhook | N/A | Stripe signature | N/A (service role) |
| **Sync Stripe customer** | **None** | **NONE** | **N/A (service role)** |

---

## 4. RLS Analysis

### Policies by Table

| Table | SELECT | INSERT | UPDATE | DELETE | Issues |
|-------|--------|--------|--------|--------|--------|
| profiles | Own + Admin | Own (migration 003) | Own | Own | Missing WITH CHECK on UPDATE |
| pets | Own + Admin | Own | Own | Own | OK |
| subscriptions | Own + Admin | Own | Own | Own | Users can INSERT/UPDATE/DELETE own subs |
| payments | Own + Admin | Own | Own | Own | Users can INSERT/DELETE own payments |
| waitlist | Admin only | Anyone | None | None | No update/delete policy |
| referrals | Own + Admin | Own | Own | Own | OK |
| admin_logs | Admin | Admin INSERT | None | None | OK |
| site_config | Anyone | Admin | Admin | Admin | OK |

### Critical RLS Observations

1. **profiles UPDATE policy lacks WITH CHECK** — The UPDATE policy uses `using (id = auth.uid())` but has no `with check` clause. This means the USING condition only controls *which rows* can be updated, but the user could potentially set any column value including `role`.

2. **subscriptions/payments full CRUD for users** — Users can INSERT, UPDATE, and DELETE their own subscription and payment records directly via PostgREST. This could allow subscription status manipulation.

3. **Admin role check is self-referential** — Admin policies query `profiles` to check `role = 'admin'`. If a user manages to set their own role to 'admin', all admin policies pass.

---

## 5. Attack Surface

### Vulnerability Summary

| # | Severity | Category | Location | Description |
|---|----------|----------|----------|-------------|
| V1 | **CRITICAL** | Privilege Escalation | RLS + profiles UPDATE | Users can update their own `role` column to 'admin' |
| V2 | **CRITICAL** | Unauthenticated API | `api/sync-stripe-customer.ts` | No authentication — anyone can create Stripe customers for any user |
| V3 | **HIGH** | Data Manipulation | RLS subscriptions/payments | Users can modify their own subscription status and payment records |
| V4 | **HIGH** | CORS Misconfiguration | `api/_lib/cors.ts` | Wildcard `.vercel.app` allows any Vercel deployment to make requests |
| V5 | **HIGH** | Deno Edge Functions | `supabase/functions/admin-stats` | CORS allows all origins (`*`) |
| V6 | **MEDIUM** | File Upload | `ProfilePage.tsx` | No file type/size validation on avatar upload |
| V7 | **MEDIUM** | Missing CSP | `vercel.json` | No Content-Security-Policy header |
| V8 | **MEDIUM** | Session via getSession() | `src/lib/api.ts` | Uses `getSession()` instead of `getUser()` for token — can be spoofed from localStorage |
| V9 | **LOW** | Admin Bootstrap | `claim_admin_role()` RPC | First user can claim admin — no revocation mechanism |
| V10 | **LOW** | Information Disclosure | Error responses | Stack traces in error messages (`(err as Error).message`) |

---

## 6. Vulnerabilities — Detailed Analysis

### V1: CRITICAL — Users Can Escalate to Admin Role

**File:** `supabase/migrations/001_initial_schema.sql:140-142`
**RLS Policy:** "Users can update their own profile"

```sql
create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());
  -- NO WITH CHECK clause — any column can be set to any value
```

**Why Vulnerable:** The UPDATE policy only has a `USING` clause (controls which rows), but no `WITH CHECK` clause (controls what values can be written). Since the `role` column has no column-level security, any authenticated user can execute:

```sql
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

Or via the Supabase JS client:
```javascript
await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
```

**Exploit Scenario:**
1. Authenticated user opens browser DevTools console
2. Runs: `(await window.__supabase.from('profiles').update({role:'admin'}).eq('id', '<user-id>'))`
3. User now has admin access to all admin pages and API endpoints
4. Can view all user data, modify plans, view revenue, etc.

**Impact:** Complete admin takeover. All admin-only API endpoints trust the `role` column from the same `profiles` table.

**Fix:** Add a restrictive RLS policy that prevents role modification, or add a `WITH CHECK` clause.

---

### V2: CRITICAL — Unauthenticated Stripe Customer Sync

**File:** `api/sync-stripe-customer.ts:6-65`

```typescript
export default async function handler(req, res) {
  // NO verifyUser() call — NO authentication
  const { userId, email, name } = req.body;
  // Uses supabaseAdmin to query and update any profile
  // Creates Stripe customers for arbitrary users
}
```

**Why Vulnerable:** This endpoint has zero authentication. Any unauthenticated request can:
1. Query any user's `stripe_customer_id` by providing their `userId`
2. Create a Stripe customer for any user
3. Overwrite a user's `stripe_customer_id` in their profile

**Exploit Scenario:**
1. Attacker sends `POST /api/sync-stripe-customer` with `{ userId: "<victim-uuid>", email: "attacker@evil.com" }`
2. A new Stripe customer is created with the attacker's email
3. The victim's profile `stripe_customer_id` is overwritten
4. Attacker can now manipulate the victim's billing via the new Stripe customer

**Impact:** Billing takeover for any user. Potential financial fraud.

**Fix:** Add `verifyUser()` and ensure `userId === user.id`.

---

### V3: HIGH — Users Can Manipulate Subscriptions/Payments via RLS

**File:** `supabase/migrations/001_initial_schema.sql:184-232`

```sql
-- Users can INSERT/UPDATE/DELETE their own subscriptions
create policy "Users can insert their own subscriptions" ...
create policy "Users can update their own subscriptions" ...
create policy "Users can delete their own subscriptions" ...

-- Same for payments
create policy "Users can insert their own payments" ...
create policy "Users can update their own payments" ...
create policy "Users can delete their own payments" ...
```

**Why Vulnerable:** These policies were designed for server-side operations (webhook processing) but the server uses `supabaseAdmin` (service role) which bypasses RLS entirely. The RLS policies therefore only apply to **client-side** requests, giving users direct write access.

**Exploit Scenario:**
```javascript
// User upgrades themselves to VIP for free
await supabase.from('subscriptions').insert({
  user_id: user.id,
  plan: 'vip',
  status: 'active',
  current_period_end: '2099-12-31T00:00:00Z'
});

// User creates fake payment records
await supabase.from('payments').insert({
  user_id: user.id,
  amount_cents: 0,
  status: 'paid'
});
```

**Impact:** Free subscription upgrades, fake payment records, revenue data corruption.

**Fix:** Remove INSERT/UPDATE/DELETE policies for subscriptions and payments. Only the webhook (service role) should write these tables.

---

### V4: HIGH — Overly Permissive CORS Wildcard

**File:** `api/_lib/cors.ts:12`

```typescript
if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
  return origin;
}
```

**Why Vulnerable:** Any domain ending in `.vercel.app` is trusted. An attacker can deploy a malicious site on Vercel (e.g., `evil-phishing.vercel.app`) and make authenticated cross-origin requests to PetPass APIs.

**Exploit Scenario:**
1. Attacker deploys `https://petpass-phishing.vercel.app` on Vercel free tier
2. Victim visits attacker's site while logged into PetPass
3. Attacker's JavaScript makes requests to PetPass API using victim's cookies/tokens
4. Attacker can invoke delete-account, create-checkout-session, etc.

**Fix:** Only allow the specific Vercel preview deployment pattern for this project.

---

### V5: HIGH — Edge Functions Allow All Origins

**File:** `supabase/functions/admin-stats/index.ts:8-11`

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
};
```

**Why Vulnerable:** All Supabase edge functions use `Access-Control-Allow-Origin: *`. While the admin-stats function does verify JWT + admin role, the wildcard CORS allows any website to attempt requests. Combined with V1 (privilege escalation), this widens the attack surface significantly.

**Fix:** Restrict to known origins only.

---

### V6: MEDIUM — Unrestricted File Upload

**File:** `src/pages/dashboard/ProfilePage.tsx:62-88`

```typescript
const handleAvatarUpload = async (e) => {
  const file = e.target.files?.[0];
  // No file size check
  // No MIME type validation
  // File extension taken from user-controlled file.name
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/avatar.${fileExt}`;
  await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
};
```

**Why Vulnerable:**
- No file size limit (DoS via large uploads)
- No MIME type validation (only HTML `accept="image/*"` which is client-side only)
- File extension from user input (could upload `.html`, `.svg` with scripts)
- If the `avatars` bucket is public, uploaded SVGs with embedded JavaScript execute in the browser

**Fix:** Validate file type and size on client and enforce via Supabase storage policies.

---

### V7: MEDIUM — Missing Content Security Policy

**File:** `vercel.json:8-18`

Headers include `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `Referrer-Policy` but **no Content-Security-Policy** header.

**Why Vulnerable:** Without CSP, if any XSS vector exists (e.g., stored XSS via uploaded SVGs, or future template changes), there is no defense-in-depth to prevent script execution.

**Fix:** Add a strict CSP header.

---

### V8: MEDIUM — getSession() Used for Token Extraction

**File:** `src/lib/api.ts:10`

```typescript
const { data: { session } } = await supabase.auth.getSession();
```

**Why Vulnerable:** Supabase documentation warns that `getSession()` reads from localStorage without server-side validation. If an attacker can write to localStorage (via XSS or shared domain), they can inject a forged session token. The `getUser()` method validates against the server.

**Mitigation Note:** The server-side `verifyUser()` does call `getUser()`, which validates the token. So the risk is limited to client-side state confusion, not backend auth bypass.

**Fix:** Use `getUser()` on the client for security-critical decisions, or at minimum document the trade-off.

---

### V9: LOW — Admin Bootstrap Without Revocation

**File:** `supabase/migrations/002_fix_profile_metadata.sql:45-63`

```sql
create or replace function public.claim_admin_role()
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (select 1 from public.profiles where role = 'admin') then
    return false;
  end if;
  update public.profiles set role = 'admin' where id = auth.uid();
  return true;
end;
$$;
```

**Why Vulnerable:** This function is callable by any authenticated user. While it checks if an admin already exists, combined with V1 (role escalation), an attacker could remove the existing admin first and then claim the role.

**Fix:** Drop this function after initial setup, or add rate limiting and alerting.

---

### V10: LOW — Error Message Information Disclosure

**Files:** Multiple API routes (e.g., `sync-stripe-customer.ts:63`, `stripe-webhook.ts:195`)

```typescript
return res.status(500).json({ error: (err as Error).message });
```

**Why Vulnerable:** Internal error messages (Stripe errors, database errors, connection failures) are returned directly to the client. These can reveal internal infrastructure details, table names, or service configurations.

**Fix:** Return generic error messages in production. Log details server-side only.

---

## 7. Hardening Plan

### Immediate (P0) — Fix Within 24 Hours

1. **Restrict `role` column updates via RLS** — Add `WITH CHECK` that prevents role changes
2. **Add authentication to `sync-stripe-customer`** — Add `verifyUser()` + user ID match
3. **Remove user CRUD on subscriptions/payments** — Drop INSERT/UPDATE/DELETE policies
4. **Restrict CORS to project-specific origins** — Remove wildcard `.vercel.app`

### Short-Term (P1) — Fix Within 1 Week

5. **Add CSP headers** to `vercel.json`
6. **Validate file uploads** — size, MIME type, extension whitelist
7. **Restrict Edge Function CORS** — Replace `*` with specific origins
8. **Sanitize error messages** — Generic errors to client, details to logs

### Medium-Term (P2) — Fix Within 1 Month

9. **Add rate limiting** on all API endpoints (Vercel edge middleware or Upstash)
10. **Drop `claim_admin_role()`** RPC after initial admin setup
11. **Add audit logging** for all admin actions (currently only plan-config logs)
12. **Review storage bucket policies** for the `avatars` bucket

### Secure Architecture Patterns

#### RLS Template for User-Owned Data
```sql
-- Allow users to read own data
CREATE POLICY "users_select_own" ON table_name FOR SELECT
  USING (user_id = auth.uid());

-- Only server (service role) can write
-- NO INSERT/UPDATE/DELETE policies for client access
```

#### Secure Admin Check Pattern
```sql
-- Prevent role modification via RLS
CREATE POLICY "users_update_own_safe" ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );
```

#### Secure API Middleware Pattern
```typescript
// Every API route should start with:
const user = await verifyUser(req.headers.authorization);
if (!user) return res.status(401).json({ error: 'Unauthorized' });

// For admin routes, add:
const { data: profile } = await supabaseAdmin
  .from('profiles').select('role').eq('id', user.id).single();
if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
```

### Deployment Checklist

- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is NEVER exposed in client bundles
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Separate environment variables for preview vs production in Vercel
- [ ] Enable Supabase email verification before production launch
- [ ] Enable Supabase rate limiting for auth endpoints
- [ ] Review and restrict Supabase storage bucket policies
- [ ] Set up monitoring/alerting for admin role changes
- [ ] Run `supabase db lint` to verify RLS coverage

---

## 8. Security Score

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| Authentication | 8 | 10 | JWT verification solid; getSession() concern is minor |
| Authorization (Backend) | 5 | 10 | sync-stripe-customer unprotected; role check pattern is good elsewhere |
| Authorization (RLS) | 3 | 10 | Critical: role escalation possible; subscriptions/payments writable |
| Input Validation | 7 | 10 | Good Zod usage; file upload needs work |
| CORS/Headers | 4 | 10 | Wildcard CORS; missing CSP |
| Infrastructure | 7 | 10 | Proper env separation; Stripe webhook verification |
| Data Protection | 7 | 10 | RLS on all tables; error messages leak info |
| Secure Defaults | 6 | 10 | Good security headers except CSP; service role properly isolated |

### **Overall Security Score: 38/100**

The score is heavily penalized by the critical privilege escalation vulnerability (V1) which effectively compromises the entire authorization model. Once V1 is fixed along with V2 and V3, the score would rise to approximately **72/100**.
