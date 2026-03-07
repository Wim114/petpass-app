# PetPass Vienna - Comprehensive Security Audit Report

**Date:** 2026-03-07
**Auditor:** Security Engineering Team
**Target:** PetPass production web application
**Scope:** Full-stack security audit covering Vercel (frontend + serverless), Supabase (backend, DB, auth, storage, edge functions), and Stripe (payments)
**Prior Audit:** 2026-03-04 (findings V1, V3, V9 remediated via migration 005)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Methodology](#3-methodology)
4. [Remediation Status from Prior Audit](#4-remediation-status-from-prior-audit)
5. [Current Vulnerability Findings](#5-current-vulnerability-findings)
6. [Security Checklist by Category](#6-security-checklist-by-category)
7. [Configuration Hardening Guide](#7-configuration-hardening-guide)
8. [Ongoing Security Maintenance](#8-ongoing-security-maintenance)
9. [Remediation Timeline](#9-remediation-timeline)

---

## 1. Executive Summary

This is a follow-up comprehensive security audit of the PetPass application. The prior audit (2026-03-04) identified 10 vulnerabilities including 2 critical issues. Since then, migration `005_security_hardening.sql` has been applied, remediating the most critical findings: role escalation via profile UPDATE (old V1), user write access to subscriptions/payments (old V3), and the `claim_admin_role()` RPC (old V9).

The application now demonstrates a solid security foundation:
- JWT-based authentication on all Vercel API routes
- RLS on all 7 database tables with security hardening applied
- Stripe webhook signature verification
- Comprehensive security headers including CSP
- Input sanitization on admin endpoints
- Storage policies with MIME type and size validation

However, this audit identifies **3 critical**, **3 high**, **5 medium**, and **4 low** severity findings that still require attention. The most urgent issues involve **unauthenticated Supabase Edge Functions** that bypass all the security controls present in the equivalent Vercel API routes.

### Finding Summary

| Priority | Count | Key Areas |
|----------|-------|-----------|
| Critical | 3 | Unauthenticated Supabase Edge Functions (create-checkout-session, sync-stripe-customer, create-portal-session) |
| High | 3 | PII exposure in admin stats, no rate limiting, sensitive data in error logs |
| Medium | 5 | CORS preview deployment access, missing MFA enforcement, non-idempotent webhook, waitlist spam, missing profile INSERT policy |
| Low | 4 | Referral code predictability, outdated Stripe SDK in edge functions, missing CORS credentials header, silent audit log failures |

---

## 2. Architecture Overview

```
+-------------------------------------------------------------------+
|                       BROWSER (CLIENT)                             |
|  React 19 + Vite 6 + React Router v7 + Zustand + React Query      |
|                                                                    |
|  +----------+  +----------+  +----------+  +----------+           |
|  | AuthGuard |  |AdminGuard|  |  Auth    |  |Dashboard |           |
|  |(frontend) |  |(frontend)|  |  Store   |  |  Pages   |           |
|  +----------+  +----------+  +----------+  +----------+           |
|       |              |            |               |                |
|       v              v            v               v                |
|  +-----------------------------------------------------------+    |
|  |  supabase-js (anon key) + apiCall() utility                |    |
|  |  VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY                |    |
|  +---------------------+-------------------------------------+    |
+-------------------------|-----------------------------------------+
                          |  JWT Bearer Token
           +--------------+----------------+
           v                               v
+-----------------------+  +--------------------------------+
|  Supabase PostgREST   |  |  Vercel Serverless Functions    |
|  (RLS Enforcement)    |  |  /api/*                         |
|                       |  |                                 |
|  profiles, pets,      |  |  admin-stats.ts       [auth+admin] |
|  subscriptions,       |  |  create-checkout.ts   [auth]    |
|  payments, waitlist,  |  |  create-portal.ts     [auth]    |
|  referrals,           |  |  delete-account.ts    [auth]    |
|  admin_logs,          |  |  plan-config.ts       [public/admin] |
|  site_config          |  |  news.ts              [public/admin] |
|                       |  |  stripe-webhook.ts    [signature] |
+-----------------------+  |  sync-stripe.ts       [auth]    |
                           +----------------+---------------+
                                            |
+-----------------------+  +----------------+  +-------------+
|  Supabase Edge Funcs  |  |   Supabase DB  |  |  Stripe API |
|  (NO AUTH on 3 funcs) |  |                |  |             |
|  create-checkout [!]  |  +----------------+  +-------------+
|  sync-customer   [!]  |
|  create-portal   [!]  |
|  admin-stats     [ok] |
|  stripe-webhook  [ok] |
+-----------------------+
```

### Trust Boundaries

| Boundary | Protection | Status |
|----------|-----------|--------|
| Browser -> Supabase PostgREST | RLS policies | OK (hardened) |
| Browser -> Vercel API | JWT verification + role checks | OK |
| Browser -> Supabase Edge Functions | JWT verification | **3 FUNCTIONS MISSING AUTH** |
| Vercel API -> Supabase | SERVICE_ROLE_KEY (bypasses RLS) | OK (server-side only) |
| Stripe -> Vercel Webhook | Stripe signature verification | OK |
| Browser -> Supabase Storage | Bucket policies (MIME + size) | OK |

---

## 3. Methodology

### 3.1 Static Analysis
- Manual code review of all 7 Vercel serverless functions (`api/*.ts`)
- Manual code review of all 5 Supabase Edge Functions (`supabase/functions/*/index.ts`)
- Review of all 6 database migrations for RLS policies and schema security
- Review of client-side auth flow (`src/stores/authStore.ts`, `src/lib/supabase.ts`)
- Pattern search for hardcoded secrets, exposed keys, and unsafe practices

### 3.2 Configuration Review
- `vercel.json`: Security headers, CSP, rewrites
- `.env.example`: Environment variable inventory
- `package.json`: Dependency versions and known vulnerabilities
- Supabase storage policies (migration 006)

### 3.3 Threat Modeling
- Data flow mapping across all integration points
- Attack surface enumeration for authenticated and unauthenticated paths
- OWASP Top 10 evaluation against each endpoint
- Comparison of Vercel API routes vs Supabase Edge Functions for security parity

---

## 4. Remediation Status from Prior Audit

| Old ID | Severity | Finding | Status | Remediation |
|--------|----------|---------|--------|-------------|
| V1 | CRITICAL | Role escalation via profile UPDATE | **FIXED** | Migration 005: Added WITH CHECK preventing role modification |
| V2 | CRITICAL | Unauthenticated sync-stripe-customer (Vercel) | **FIXED** | `api/sync-stripe-customer.ts` now has `verifyUser()` + user ID enforcement |
| V3 | HIGH | User CRUD on subscriptions/payments | **FIXED** | Migration 005: Dropped INSERT/UPDATE/DELETE policies |
| V4 | HIGH | CORS wildcard `.vercel.app` | **PARTIALLY FIXED** | Tightened to project-specific regex, but still allows all preview deployments (see V7 below) |
| V5 | HIGH | Edge Function CORS `*` | **PARTIALLY FIXED** | `admin-stats` edge function now uses `ALLOWED_ORIGIN` from env, but other edge functions have more fundamental issues (V1-V3 below) |
| V6 | MEDIUM | Unrestricted file upload | **FIXED** | Migration 006: Storage policies with 5MB limit and MIME type validation |
| V7 | MEDIUM | Missing CSP header | **FIXED** | `vercel.json` now includes comprehensive CSP |
| V8 | MEDIUM | getSession() for token extraction | **ACCEPTABLE** | Server-side `verifyUser()` uses `getUser()` which validates the token |
| V9 | LOW | `claim_admin_role()` RPC | **FIXED** | Migration 005: Function dropped |
| V10 | LOW | Error message disclosure | **PARTIALLY FIXED** | Vercel API routes now return generic messages; see V6 below for remaining logging concerns |

---

## 5. Current Vulnerability Findings

### V1 - CRITICAL: Unauthenticated Checkout Session Creation (Edge Function)

| Attribute | Detail |
|-----------|--------|
| **File** | `supabase/functions/create-checkout-session/index.ts:34` |
| **Description** | The Supabase Edge Function accepts `userId` directly from the request body without any JWT verification. It uses the service role key (line 13) to query and update profiles, bypassing all RLS. Compare with the secure Vercel equivalent at `api/create-checkout-session.ts:26` which properly calls `verifyUser()`. |
| **Impact** | An attacker can create Stripe checkout sessions for any user, potentially linking subscriptions to victims' accounts, manipulating billing state, or causing unwanted charges. |
| **Likelihood** | High - The endpoint is publicly accessible with zero authentication. |
| **Priority** | **Critical** |
| **Recommended Fix** | Add JWT verification following the pattern in `supabase/functions/admin-stats/index.ts:42-67`. Extract and verify the token from the Authorization header, then use `user.id` instead of the request body `userId`. Additionally, add price ID validation (the Vercel route has `ALLOWED_PRICE_IDS` whitelist at line 9-15; the edge function has none). |

### V2 - CRITICAL: Unauthenticated Stripe Customer Sync (Edge Function)

| Attribute | Detail |
|-----------|--------|
| **File** | `supabase/functions/sync-stripe-customer/index.ts:32` |
| **Description** | Accepts `userId` and `email` from the request body without JWT verification. Uses the service role key to query profiles and create Stripe customers for arbitrary users. The Vercel equivalent (`api/sync-stripe-customer.ts:15-23`) correctly verifies the JWT and derives userId from the authenticated user. |
| **Impact** | Attacker can create Stripe customers linked to any Supabase user, potentially overwriting their `stripe_customer_id` and hijacking their billing relationship. The response also discloses existing customer IDs (`customerId` field). |
| **Likelihood** | High - Publicly accessible, no authentication required. |
| **Priority** | **Critical** |
| **Recommended Fix** | Add JWT verification. Use the authenticated user's ID instead of trusting the request body. |

### V3 - CRITICAL: Unauthenticated Billing Portal Access (Edge Function)

| Attribute | Detail |
|-----------|--------|
| **File** | `supabase/functions/create-portal-session/index.ts:29` |
| **Description** | Accepts `customerId` from the request body without any authentication or ownership verification. An attacker who knows or guesses a Stripe customer ID (`cus_*` format) can open a billing portal session. The Vercel equivalent (`api/create-portal-session.ts:17-32`) correctly verifies the JWT and looks up the customer ID from the authenticated user's profile. |
| **Impact** | Unauthorized access to Stripe billing portal: view subscription details, update payment methods, cancel subscriptions, access invoice history with PII. |
| **Likelihood** | High - Stripe customer IDs follow predictable patterns and may be exposed through other vulnerabilities. |
| **Priority** | **Critical** |
| **Recommended Fix** | Add JWT verification. Look up `stripe_customer_id` from the authenticated user's profile instead of accepting it from the request body. |

### V4 - HIGH: Admin Stats Endpoint Exposes Raw User Emails

| Attribute | Detail |
|-----------|--------|
| **File** | `api/admin-stats.ts:279-292` |
| **Description** | The `recentSignups` array in the response includes raw email addresses (line 288: `email: row.email`). While the endpoint requires admin authentication, this creates unnecessary PII exposure in API responses that could be logged, cached by CDN/proxy, or intercepted. The admin stats edge function (`supabase/functions/admin-stats/index.ts`) does not expose emails. |
| **Impact** | PII leakage of user email addresses. Violates GDPR data minimization principle (Article 5). |
| **Likelihood** | Medium - Requires compromised admin credentials. |
| **Priority** | **High** |
| **Recommended Fix** | Mask email addresses (e.g., `j***@example.com`). If full emails are needed for admin operations, create a separate endpoint with additional audit logging. |

### V5 - HIGH: No Rate Limiting on Any Endpoint

| Attribute | Detail |
|-----------|--------|
| **Files** | All `api/*.ts` and `supabase/functions/*/index.ts` |
| **Description** | No application-level rate limiting exists on any endpoint. While Supabase Auth has built-in rate limits and Vercel provides basic DDoS protection, custom API routes have no request throttling. Critical endpoints like `delete-account`, `create-checkout-session`, and `admin-stats` can be called at arbitrary rates. |
| **Impact** | Brute-force attacks, resource exhaustion through expensive Stripe API calls, database query flooding, potential cost escalation on Vercel/Stripe. |
| **Likelihood** | Medium - Requires targeting specific endpoints. |
| **Priority** | **High** |
| **Recommended Fix** | Implement rate limiting using Vercel Edge Middleware with Upstash Redis or `@vercel/kv`. Suggested limits: auth endpoints 10/min, checkout 5/min, admin 30/min, delete-account 3/hour, webhook 100/min. |

### V6 - HIGH: Sensitive Data in Error Logs

| Attribute | Detail |
|-----------|--------|
| **Files** | `api/stripe-webhook.ts:41,64,106,139,152,194`, `api/delete-account.ts:49,63,70`, `api/admin-stats.ts:327`, `api/sync-stripe-customer.ts:62,71`, `supabase/functions/create-checkout-session/index.ts:104` |
| **Description** | Multiple endpoints log full error objects via `console.error('...:', err)`. These error objects from Stripe and Supabase may contain customer IDs, email addresses, payment intent details, database query information, or authentication tokens. These logs persist in Vercel and Supabase dashboards. |
| **Impact** | Sensitive data (customer IDs, emails, internal details) stored in log systems with potentially broad team access and long retention. |
| **Likelihood** | Medium - Requires access to deployment logs. |
| **Priority** | **High** |
| **Recommended Fix** | Sanitize error objects before logging: `console.error('Webhook error:', err instanceof Error ? err.message : 'Unknown error')`. Never log full error objects that may contain Stripe or Supabase response data. |

### V7 - MEDIUM: CORS Allows All Preview Deployments Against Production API

| Attribute | Detail |
|-----------|--------|
| **File** | `api/_lib/cors.ts:15` |
| **Description** | The regex `/^https:\/\/petpass-app[a-z0-9-]*\.vercel\.app$/` allows any Vercel preview deployment matching the `petpass-app*` pattern. If preview deployments share production environment variables (a common Vercel default), any preview deployment can make authenticated API calls against the production database and Stripe account. |
| **Impact** | A compromised or malicious PR's preview deployment could access production data and payment systems. |
| **Likelihood** | Low-Medium - Requires a preview deployment with production env vars. |
| **Priority** | **Medium** |
| **Recommended Fix** | (1) Scope production secrets to "Production" environment only in Vercel dashboard. (2) Use separate Supabase project or Stripe test keys for preview. (3) Optionally tighten the regex or use an explicit allowlist. |

### V8 - MEDIUM: No MFA Enforcement for Admin Accounts

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/components/auth/AdminGuard.tsx`, `api/admin-stats.ts:30`, `api/plan-config.ts:107`, `api/news.ts:72` |
| **Description** | Admin access is determined solely by `profile.role === 'admin'` with standard password/OAuth authentication. Supabase supports TOTP-based MFA, but it is not enforced for admin accounts. A compromised admin password grants full administrative access. |
| **Impact** | Admin account compromise through credential theft, phishing, or credential stuffing gives full access to all user data, revenue metrics, and content management. |
| **Likelihood** | Medium - Depends on admin password hygiene and phishing resistance. |
| **Priority** | **Medium** |
| **Recommended Fix** | Enable Supabase MFA (TOTP). Add server-side MFA verification in admin endpoints by checking `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` returns `aal2`. Add a client-side MFA enrollment flow for admin users. |

### V9 - MEDIUM: Stripe Invoice Webhook Not Idempotent

| Attribute | Detail |
|-----------|--------|
| **File** | `api/stripe-webhook.ts:69-108` |
| **Description** | The `handleInvoicePaid` function uses `.insert()` (line 94) for payment records without checking for duplicates. While `handleCheckoutSessionCompleted` uses `.upsert()` with `onConflict: 'stripe_subscription_id'` (line 48), the invoice handler has no idempotency protection. The `payments` table has no unique constraint on `stripe_invoice_id`. Stripe retries webhook delivery on timeout or failure. |
| **Impact** | Duplicate payment records inflating revenue metrics, accounting discrepancies, potential issues with refund processing. |
| **Likelihood** | Medium - Stripe routinely retries webhooks. |
| **Priority** | **Medium** |
| **Recommended Fix** | (1) Add a unique constraint: `ALTER TABLE payments ADD CONSTRAINT unique_stripe_invoice UNIQUE (stripe_invoice_id)`. (2) Use `.upsert({ ... }, { onConflict: 'stripe_invoice_id' })` instead of `.insert()`. |

### V10 - MEDIUM: Waitlist Table Open to Unlimited Spam Insertions

| Attribute | Detail |
|-----------|--------|
| **File** | `supabase/migrations/001_initial_schema.sql:237-238` |
| **Description** | The RLS policy `"Anyone can insert into waitlist"` uses `WITH CHECK (true)`, allowing unlimited anonymous insertions with no rate limiting, CAPTCHA, email validation, or deduplication. There is no unique constraint on the `email` column. |
| **Impact** | Waitlist table can be flooded with millions of spam entries, causing storage costs, polluting analytics, and potentially degrading database performance. |
| **Likelihood** | Medium - The endpoint is fully open to unauthenticated requests. |
| **Priority** | **Medium** |
| **Recommended Fix** | (1) Add unique constraint on `email`. (2) Add rate limiting at the application layer (e.g., Vercel Edge Middleware). (3) Consider requiring CAPTCHA or email verification. |

### V11 - MEDIUM: No Explicit INSERT Policy on Profiles Table

| Attribute | Detail |
|-----------|--------|
| **File** | `supabase/migrations/001_initial_schema.sql:135-155` |
| **Description** | The `profiles` table has SELECT, UPDATE, and DELETE policies but no explicit INSERT policy. Profile creation is handled by the `handle_new_user()` trigger (line 299-313) which runs as `SECURITY DEFINER`. Without an explicit INSERT deny policy, the security relies on RLS's implicit deny behavior. |
| **Impact** | If RLS defaults or Supabase behavior changes, direct client-side profile insertion could become possible. Low risk currently but violates defense-in-depth. |
| **Likelihood** | Low - Current code only creates profiles via the trigger. |
| **Priority** | **Medium** |
| **Recommended Fix** | Add explicit policy: `CREATE POLICY "Profiles created by trigger only" ON profiles FOR INSERT WITH CHECK (false);` |

### V12 - LOW: Referral Code Predictability

| Attribute | Detail |
|-----------|--------|
| **File** | `supabase/migrations/001_initial_schema.sql:309` |
| **Description** | Referral codes are generated via `'PPV-' || upper(substr(md5(random()::text), 1, 6))`, producing codes like `PPV-A1B2C3`. With only hex characters and 6 positions, the keyspace is 16^6 = ~16.7M combinations. MD5 of `random()` provides weak randomness. |
| **Impact** | Referral codes could be brute-forced to claim referral rewards fraudulently. |
| **Likelihood** | Low - Requires many attempts and understanding of the referral reward system. |
| **Priority** | **Low** |
| **Recommended Fix** | Use `encode(gen_random_bytes(8), 'hex')` for stronger randomness and longer codes (16 hex chars = 2^64 combinations). |

### V13 - LOW: Outdated Stripe SDK and API Version in Edge Functions

| Attribute | Detail |
|-----------|--------|
| **Files** | `supabase/functions/create-checkout-session/index.ts:2,5`, `supabase/functions/create-portal-session/index.ts:1,5` |
| **Description** | Edge functions use `stripe@14.11.0` with `apiVersion: "2023-10-16"`, while Vercel functions use `stripe@20.4.0` (from `package.json:28`). The edge functions are 6+ major versions behind. |
| **Impact** | Missing security patches, bug fixes, and API improvements from the Stripe SDK. |
| **Likelihood** | Low - Stripe maintains backward compatibility. |
| **Priority** | **Low** |
| **Recommended Fix** | Update edge function Stripe imports to match latest stable version. Maintain consistent versioning across Vercel and Supabase functions. |

### V14 - LOW: CORS Missing Access-Control-Allow-Credentials Header

| Attribute | Detail |
|-----------|--------|
| **File** | `api/_lib/cors.ts` |
| **Description** | CORS configuration does not explicitly set `Access-Control-Allow-Credentials`. The app uses Bearer tokens via Authorization headers rather than cookies, so this is not currently exploitable. However, the omission should be a documented design decision. |
| **Impact** | Minimal given current auth mechanism. Would become relevant if cookie-based auth is ever added. |
| **Likelihood** | Low. |
| **Priority** | **Low** |
| **Recommended Fix** | Document that credentials are intentionally not supported in CORS. If cookies are ever introduced for auth, this must be revisited. |

### V15 - LOW: Audit Log Failures Silently Swallowed

| Attribute | Detail |
|-----------|--------|
| **Files** | `api/plan-config.ts:165-167`, `api/news.ts:134-136` |
| **Description** | Admin audit log insertions are wrapped in try/catch with empty catch blocks. If the `admin_logs` table is unavailable or the insert fails, no error is logged and the admin action proceeds without being recorded. This creates a gap in the audit trail. |
| **Impact** | Missing audit trail for admin actions during logging failures. Could mask unauthorized admin activity. |
| **Likelihood** | Low - Only occurs if the admin_logs table is unavailable. |
| **Priority** | **Low** |
| **Recommended Fix** | At minimum, log the failure: `catch (e) { console.error('Audit log failed:', e instanceof Error ? e.message : 'Unknown'); }`. Consider making audit logging mandatory for critical actions. |

---

## 6. Security Checklist by Category

### 6.1 Authentication & Authorization

- [x] JWT-based authentication on all Vercel API routes via `verifyUser()` (`api/_lib/supabase.ts:12-25`)
- [x] Server-side token validation using `supabase.auth.getUser()` (not just `getSession()`)
- [x] Admin role check on all admin endpoints (admin-stats, plan-config PUT, news PUT)
- [x] Role escalation prevention via RLS WITH CHECK clause (`005_security_hardening.sql:16-22`)
- [x] `claim_admin_role()` RPC removed (`005_security_hardening.sql:49`)
- [x] Client-side AdminGuard for routing protection
- [x] User can only sync their own Stripe customer in Vercel route (`api/sync-stripe-customer.ts:23`)
- [ ] **FAIL: 3 Supabase Edge Functions lack authentication (V1, V2, V3)**
- [ ] **FAIL: No MFA enforcement for admin accounts (V8)**
- [ ] Verify Supabase JWT expiry is set to 3600s or less
- [ ] Verify OAuth provider scopes follow least-privilege
- [ ] Verify email confirmation is required for new signups
- [ ] Verify password strength requirements are configured

### 6.2 Data Protection & Encryption

- [x] Supabase provides encryption at rest for PostgreSQL
- [x] SSL/TLS enforced via Vercel (automatic) and HSTS header
- [x] No raw card data stored - Stripe handles all payment details
- [x] CSP header restricts script and connection sources (`vercel.json:18`)
- [x] `X-Frame-Options: DENY` prevents clickjacking
- [x] GDPR consent fields in schema (`gdpr_consent_at`, `marketing_consent`)
- [ ] **FAIL: User emails exposed in admin-stats response (V4)**
- [ ] **FAIL: Sensitive data potentially logged via console.error (V6)**
- [ ] Verify EXIF data is stripped from uploaded avatar images
- [ ] Verify GDPR consent is collected before data processing begins

### 6.3 API & Serverless Function Security

- [x] Input validation on checkout (price ID whitelist in Vercel route)
- [x] Input sanitization on plan-config and news (HTML tag stripping, length limits)
- [x] Parameterized queries via Supabase JS client (no raw SQL)
- [x] HTTP method restrictions on all endpoints
- [x] Error responses don't expose stack traces to clients (generic messages)
- [x] `X-Content-Type-Options: nosniff` prevents MIME sniffing
- [ ] **FAIL: No rate limiting on any endpoint (V5)**
- [ ] **FAIL: CORS allows preview deployments (V7)**
- [ ] **FAIL: Edge function checkout has no price ID validation (V1)**
- [ ] Verify request body size limits are configured
- [ ] Add `Cache-Control: no-store` to sensitive API responses

### 6.4 Third-Party Integrations (Stripe)

- [x] Webhook signature verification using `stripe.webhooks.constructEvent()` (`api/stripe-webhook.ts:171`)
- [x] Raw body parsing disabled for webhook (`api/stripe-webhook.ts:8-10`)
- [x] Stripe secret keys only in server-side environment variables
- [x] Price ID whitelist validation in Vercel checkout route (`api/create-checkout-session.ts:9-15`)
- [x] `supabase_user_id` stored in Stripe customer metadata for reconciliation
- [x] Stripe publishable key exposed only as `VITE_STRIPE_PUBLISHABLE_KEY` (client-safe)
- [ ] **FAIL: Invoice webhook not idempotent (V9)**
- [ ] **FAIL: Edge function checkout has no price validation (V1)**
- [ ] Verify Stripe test mode keys are not in production environment
- [ ] Verify PCI-DSS SAQ A compliance
- [ ] Consider handling `invoice.payment_failed` events

### 6.5 Infrastructure - Vercel

- [x] Comprehensive security headers in `vercel.json`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - Content-Security-Policy with restricted sources
- [x] SPA rewrite excludes `/api` and `/assets` paths
- [ ] Verify production secrets are NOT available in preview deployments
- [ ] Verify Deployment Protection is enabled for previews
- [ ] Consider adding `preload` to HSTS directive
- [ ] Set `maxDuration` on serverless functions

### 6.6 Infrastructure - Supabase

- [x] RLS enabled on all 7 tables (`001_initial_schema.sql:127-133`)
- [x] Security hardening migration applied (`005_security_hardening.sql`)
- [x] Storage avatar policies with MIME validation and 5MB limit (`006_storage_avatar_policies.sql`)
- [x] Trigger functions use `SECURITY DEFINER` with explicit `search_path`
- [x] User write access to subscriptions/payments removed
- [ ] **FAIL: Missing explicit INSERT policy on profiles (V11)**
- [ ] Verify database is not publicly accessible
- [ ] Verify PITR (Point-in-Time Recovery) is enabled
- [ ] Verify automatic backups are configured and tested
- [ ] Check if Realtime is enabled - disable if not needed
- [ ] Verify `site_config` table RLS policies exist

### 6.7 Logging, Monitoring & Incident Response

- [x] Admin audit logging via `admin_logs` table (plan-config, news)
- [x] Stripe webhook events logged by type (`api/stripe-webhook.ts:173`)
- [ ] **FAIL: Audit log failures silently swallowed (V15)**
- [ ] No alerting for failed authentication attempts
- [ ] No monitoring for unusual API usage patterns
- [ ] No alerting for payment anomalies
- [ ] No documented incident response plan
- [ ] Consider structured JSON logging for analysis
- [ ] Set up 5xx error rate alerts

### 6.8 Runtime & Dependency Management

- [x] Modern dependency versions (React 19, Vite 6, Stripe 20)
- [x] `.env.example` documents variables without real values
- [x] No `.env` files committed to repository
- [ ] **FAIL: Outdated Stripe SDK in edge functions (V13)**
- [ ] Run `npm audit` and address findings
- [ ] Set up Dependabot or Renovate for automated updates
- [ ] Establish secret rotation schedule
- [ ] Verify no debug endpoints in production

### 6.9 Admin Access & Privilege Management

- [x] Admin role defined with CHECK constraint (`001_initial_schema.sql:22`)
- [x] Server-side admin verification on all admin API routes
- [x] Admin actions logged to `admin_logs` table
- [x] Role modification prevented by RLS WITH CHECK (`005_security_hardening.sql`)
- [ ] **FAIL: No MFA enforcement for admins (V8)**
- [ ] Document admin access provisioning/revocation process
- [ ] Implement periodic admin account reviews
- [ ] Consider admin session timeout shorter than regular users
- [ ] Consider separation of duties for critical operations

---

## 7. Configuration Hardening Guide

### 7.1 Vercel Dashboard

1. **Environment Variable Scoping** (addresses V7)
   - Set `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` to **Production only**
   - Create separate Stripe test-mode keys for Preview and Development
   - Set `SITE_URL` differently for preview deployments

2. **Deployment Protection**
   - Enable "Vercel Authentication" for preview deployments
   - Consider enabling "Trusted IPs" if team uses fixed IPs

3. **Security Headers Enhancement**
   - Add `Permissions-Policy: interest-cohort=()` to opt out of Topics API
   - Consider adding `preload` to HSTS once confirmed
   - Evaluate replacing `'unsafe-inline'` in style-src with nonces

4. **Function Configuration**
   - Set `maxDuration` on serverless functions to prevent runaway costs
   - Configure request body size limits via `vercel.json`

### 7.2 Supabase Dashboard

1. **Authentication Settings**
   - Enable email confirmation for new signups
   - Set minimum password length to 12+ characters
   - Enable TOTP MFA and enforce for admin accounts
   - Set JWT expiry to 3600 seconds (1 hour) or less
   - Restrict OAuth redirect URIs to production and localhost

2. **Database Security**
   - Restrict direct database connections to trusted IPs
   - Verify SSL is enforced for all connections
   - Add explicit INSERT deny policy on profiles table
   - Add unique constraint on `payments.stripe_invoice_id`
   - Add unique constraint on `waitlist.email`

3. **API & Realtime**
   - Disable Supabase Realtime if not used
   - Review and configure API rate limits in dashboard
   - Verify REST API rate limits are appropriate

4. **Storage**
   - Verify avatar bucket public read is intentional
   - Consider EXIF stripping for uploaded images
   - Review for virus/malware scanning options

5. **Backup & Recovery**
   - Enable PITR on Pro plan
   - Test backup restoration quarterly
   - Document recovery procedures

### 7.3 Stripe Dashboard

1. **Webhook Configuration**
   - Enable event filtering (only subscribe to handled events)
   - Set up webhook failure alerts
   - Monitor webhook delivery success rate

2. **API Key Management**
   - Rotate API keys quarterly
   - Use restricted API keys with minimum required permissions
   - Verify test-mode keys are not in production env vars

3. **Payment Security**
   - Enable Stripe Radar for fraud detection
   - Configure 3D Secure for applicable regions
   - Set up alerts for unusual payment patterns

4. **Customer Portal**
   - Restrict allowed portal actions to necessary operations
   - Verify portal branding matches legitimate application

---

## 8. Ongoing Security Maintenance

### 8.1 Automated Processes

| Process | Tool | Frequency |
|---------|------|-----------|
| Dependency vulnerability scanning | Dependabot/Renovate | Weekly |
| `npm audit` in CI pipeline | GitHub Actions | Every PR |
| Secret scanning | GitHub secret scanning | Continuous |
| Static analysis | ESLint security rules | Every PR |

### 8.2 Manual Reviews

| Frequency | Activity |
|-----------|----------|
| Weekly | Review Vercel function logs for errors and anomalies |
| Weekly | Check Stripe webhook delivery success rate |
| Monthly | Run `npm audit` and address findings |
| Monthly | Review admin account list and access levels |
| Quarterly | Rotate Stripe API keys and webhook secrets |
| Quarterly | Review RLS policies if schema changes |
| Quarterly | Review Supabase Auth settings |
| Bi-annually | Full security audit (code + configuration) |
| Annually | External penetration testing |

### 8.3 Monitoring & Alerting Recommendations

1. **Error tracking** - Integrate Sentry for frontend and serverless functions
2. **Auth monitoring** - Alert on failed login rate spikes, password reset anomalies
3. **API monitoring** - Track per-endpoint request rates, error rates, latency
4. **Stripe monitoring** - Webhook failure rate, unusual payment amounts, churn spikes
5. **Uptime monitoring** - Production app and critical API endpoint availability
6. **Log retention** - Set retention policies balancing debugging needs with GDPR data minimization

### 8.4 Incident Response Checklist

1. **Contain** - Disable compromised accounts/keys immediately
2. **Assess** - Determine scope: which data/users affected
3. **Rotate** - Change all potentially compromised secrets (Supabase, Stripe, webhook secrets)
4. **Notify** - Inform affected users per GDPR (72-hour window for authorities)
5. **Remediate** - Fix the exploited vulnerability
6. **Review** - Post-incident analysis and documentation
7. **Improve** - Update security measures based on lessons learned

---

## 9. Remediation Timeline

### Immediate (0-48 hours) - Critical

| ID | Finding | Action | File |
|----|---------|--------|------|
| V1 | Unauth checkout edge function | Add JWT verification, price validation | `supabase/functions/create-checkout-session/index.ts` |
| V2 | Unauth sync-customer edge function | Add JWT verification, use verified user ID | `supabase/functions/sync-stripe-customer/index.ts` |
| V3 | Unauth portal edge function | Add JWT verification, lookup customer from profile | `supabase/functions/create-portal-session/index.ts` |

### Short-term (1-2 weeks) - High

| ID | Finding | Action | File |
|----|---------|--------|------|
| V4 | Email exposure | Mask emails in response | `api/admin-stats.ts` |
| V5 | No rate limiting | Add Vercel Edge Middleware with Upstash | New middleware file |
| V6 | Sensitive logs | Sanitize all `console.error()` calls | All `api/*.ts` files |
| V9 | Non-idempotent webhook | Add unique constraint + use upsert | `api/stripe-webhook.ts`, new migration |

### Medium-term (2-4 weeks) - Medium

| ID | Finding | Action | File |
|----|---------|--------|------|
| V7 | CORS preview access | Scope env vars to production only | Vercel dashboard + `api/_lib/cors.ts` |
| V8 | No admin MFA | Enable + enforce MFA for admins | Auth config + admin endpoints |
| V10 | Waitlist spam | Add email unique constraint + rate limit | New migration |
| V11 | Missing INSERT policy | Add explicit deny INSERT on profiles | New migration |

### Long-term (1-3 months) - Low

| ID | Finding | Action | File |
|----|---------|--------|------|
| V12 | Referral code predictability | Improve randomness | New migration |
| V13 | Outdated Stripe SDK | Update edge function dependencies | Edge function files |
| V14 | CORS credentials header | Document design decision | `api/_lib/cors.ts` |
| V15 | Silent audit failures | Add error logging for audit failures | `api/plan-config.ts`, `api/news.ts` |

### Ongoing

- Implement monitoring and alerting infrastructure
- Set up automated dependency scanning in CI
- Document and rehearse incident response procedures
- Schedule regular security review cadence
- Conduct annual external penetration test

---

## Security Score

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| Authentication (Vercel) | 9 | 10 | All routes properly authenticated |
| Authentication (Edge Functions) | 2 | 10 | 3 of 5 functions completely unauthenticated |
| Authorization & RLS | 8 | 10 | Hardened; missing profile INSERT policy |
| Input Validation | 8 | 10 | Good validation; edge functions lack price checks |
| CORS & Headers | 7 | 10 | Strong headers; CORS allows previews |
| Stripe Integration | 7 | 10 | Proper webhook verification; idempotency issue |
| Infrastructure Config | 7 | 10 | Good defaults; env scoping needs verification |
| Data Protection | 6 | 10 | Email exposure in admin stats; logging concerns |
| Monitoring & Response | 3 | 10 | Basic audit logging; no alerts or monitoring |
| Dependency Management | 7 | 10 | Modern versions; edge functions outdated |

### Overall Security Score: 64/100

The score is primarily impacted by the 3 critical unauthenticated edge functions and the lack of monitoring infrastructure. Fixing the critical findings would raise the score to approximately **78/100**. Full implementation of rate limiting, monitoring, and MFA would bring it to **90+/100**.

---

*End of Security Audit Report*
