# Clerkbook / Citestack Repo Audit Report (Post-Remediation)

**Date:** February 11, 2026  
**Scope:** Full repository audit against production-readiness rubric  
**Context:** Follow-up audit after remediation phases 1–4

---

## Executive Summary

This audit re-evaluates the codebase after implementing the remediation plan from the initial audit. The same rubric and weighting are applied.

**Overall weighted score: 3.8 / 5** (up from 2.9)

All ship blockers have been addressed. Remaining gaps: no auth/billing integration tests, no rate limiting implementation, no dead-letter queue for jobs, and some performance optimizations (pagination, caching) still pending.

---

## A. Product Risk / Correctness

### A1. Critical Flows Correctness (weight: high)

| Flow | Tests | Idempotency | Failure Handling | Logging | Score |
|------|-------|-------------|------------------|---------|-------|
| Auth/signup/login | ❌ No | N/A | Basic | Supabase default | 2 |
| Billing/payments | ❌ No | ✅ Yes | OK | logError + Sentry | 4 |
| Stripe webhooks | ❌ No | **✅ Yes** | Return 500 on error | logError + Sentry | 4 |
| Data writes (capture) | ✅ Partial | ✅ Yes | OK | logError | 4 |
| Jobs/credits | ❌ No | ✅ Yes | Refund on failure | logError | 4 |
| Permissions | RLS | N/A | RLS enforced | N/A | 4 |

**Findings:**
- **Stripe webhook idempotency:** ✅ Implemented. `stripe_webhook_events` table; check before processing; insert after success. Duplicate events return 200 without re-processing.
- **Compare flow refund:** ✅ Credits refunded via `grant_credits_refund` when `runCompareItems` fails or insert fails.
- **Capture:** File/URL/Paste all use idempotency (capture file/url via `idempotency_key`; paste via derived key).
- **Job retry:** ✅ `max_attempts`, exponential backoff (2^attempts min, cap 60), `claim_job` only if `attempts < max_attempts`.

**Score: 3.7/5** (up from 3)

### A2. Data Integrity

| Aspect | Status | Notes |
|--------|--------|-------|
| Migrations | ✅ | 23 migrations, ordered, versioned |
| Constraints | ✅ | Unique indexes, FKs, checks; `stripe_webhook_events` event_id unique |
| Transactional boundaries | Partial | Credits RPCs atomic; capture file partial rollback on upload failure |
| Retries | ✅ | Jobs: max_attempts, exponential backoff, run_after |
| Idempotency keys | ✅ | Capture file/url; Stripe webhook; paste (derived) |

**Score: 4.5/5** (up from 4)

### A3. Error Handling & Observability

| Aspect | Status | Notes |
|--------|--------|-------|
| Structured logs | ✅ | `lib/logger.ts` — JSON output with level, timestamp, prefix, meta |
| Correlation IDs | ❌ | None |
| Sentry / APM | ✅ | `@sentry/nextjs`; instrumentation; captureException in webhook |
| Alerts | ⚠️ | Sentry configured; alerts depend on Sentry project setup |
| Dead-letter | ❌ | Failed jobs stay `failed`; no DLQ |

**Score: 3.5/5** (up from 1)

**A. Product Risk / Correctness aggregate: 3.6/5** (up from 2.7)

---

## B. Security Posture

### B1. Secrets & Config Hygiene (weight: high)

| Aspect | Status | Notes |
|--------|--------|-------|
| Env vars | ✅ | All secrets from env; `.env*` in .gitignore |
| Secret leakage | ✅ | Admin secret **header-only** (x-citestack-admin-secret, Bearer); no URL param |
| Key rotation | ✅ | Documented in RUNBOOK.md |
| Least privilege | ✅ | Service role server-side; anon key client |

**Score: 5/5** (up from 4)

### B2. AuthZ & Multi-Tenant Isolation

| Aspect | Status | Notes |
|--------|--------|-------|
| RLS | ✅ | All tables; `stripe_webhook_events` RLS enabled (no user policies; service role only) |
| Org/user boundaries | ✅ | Single-tenant by user_id |
| API checks | ✅ | `getUser()` on protected routes |
| Object-level perms | ✅ | Items, collections, comparisons scoped by user |

**Score: 5/5**

### B3. External Surface Safety

| Aspect | Status | Notes |
|--------|--------|-------|
| Webhook verification | ✅ | Stripe signature verified |
| SSRF | **✅** | `lib/url/blocklist.ts` — blocks localhost, 127.*, 10.*, 172.16–31.*, 192.168.*, 169.254.*, ::1, 0.0.0.0 |
| Injection | ✅ | Parameterized queries |
| File uploads | ✅ | MIME + extension allowlist; 50MB; sha256 dedupe |
| Rate limiting | ❌ | None (documented in RUNBOOK as consideration) |
| CORS/CSRF | ✅ | Next.js default; API is JSON |

**SSRF mitigation:** Blocklist wired into:
- `extract-url` (lib/jobs/extract-url.ts)
- `image-download` (app/api/items/[id]/image-download/route.ts)
- `screenshot-url` (lib/jobs/screenshot-url.ts)
- `capture/url` (app/api/capture/url/route.ts)

**Score: 4.5/5** (up from 2)

**B. Security aggregate: 4.8/5** (up from 3.7)

---

## C. Reliability & Scalability

### C1. Performance & Bottlenecks

| Aspect | Status | Notes |
|--------|--------|-------|
| Hot endpoints | ⚠️ | `/api/jobs/run` every 2 min; items list 200 + joins |
| N+1 | Partial | Items list: Promise.all for tags/collections; tag filter extra query |
| Caching | ❌ | None |
| Payload sizes | ⚠️ | raw_text/cleaned_text up to 500k chars |

**Score: 3/5** (unchanged)

### C2. Async Jobs Robustness

| Aspect | Status | Notes |
|--------|--------|-------|
| Retries/backoff | **✅** | max_attempts=3; exponential backoff (2^attempts min, cap 60); run_after |
| Idempotency | ✅ | claim_job atomic; enrich skips if already queued |
| Timeouts | ✅ | extract-url 15s; screenshot 30s |
| Poison-pill | ⚠️ | Failed jobs stay failed; no DLQ; max_attempts prevents infinite retry |

**Score: 4/5** (up from 3)

### C3. Dependency + Build Stability

| Aspect | Status | Notes |
|--------|--------|-------|
| Lockfile | ✅ | package-lock.json |
| Version pinning | Partial | Some ^ ranges |
| CI reproducibility | **✅** | `.github/workflows/ci.yml` — lint, test, build on push/PR |
| Native deps | ⚠️ | @napi-rs/canvas, pdf-parse — may need build env |

**Score: 4/5** (up from 3)

**C. Reliability aggregate: 3.7/5** (up from 3)

---

## D. Maintainability & Velocity

### D1. Architecture Clarity

| Aspect | Status | Notes |
|--------|--------|-------|
| Module boundaries | ✅ | lib/ for credits, jobs, stripe, supabase, url, admin-auth, collections |
| Layering | ✅ | API routes → lib → Supabase |
| Naming | ✅ | Consistent |
| "Where does logic live?" | ✅ | Clear |

**Score: 4/5**

### D2. Test Coverage Quality

| Aspect | Status | Notes |
|--------|--------|-------|
| Critical path tests | ✅ Partial | `lib/url/blocklist.test.ts`, `lib/idempotency.test.ts`; normalize.test.ts |
| Integration tests | ❌ | None |
| Mocking | ✅ | idempotency tests use vi.fn() mocks |
| Flaky tests | N/A | — |

**Score: 2.5/5** (up from 1)

### D3. Code Health / Consistency

| Aspect | Status | Notes |
|--------|--------|-------|
| Lint | ✅ | ESLint + Next config |
| Type safety | ✅ | TypeScript |
| Dead code | ⚠️ | invite_codes / invite_redemptions tables; unclear if used |
| Duplication | **✅** | `addItemToCollection` extracted to lib/collections.ts |
| Complexity | ✅ | Manageable |

**Score: 4/5** (up from 3)

**D. Maintainability aggregate: 3.5/5** (up from 2.7)

---

## E. DX / Release Quality

### E1. CI/CD Confidence

| Aspect | Status | Notes |
|--------|--------|-------|
| Checks gated | **✅** | `ci.yml` — lint, test, build on main/PR |
| Preview envs | ⚠️ | Vercel assumed; unknown |
| Migrations | ⚠️ | Manual; no CI migration check |
| Rollback plan | ⚠️ | Runbook documents flows; explicit rollback steps minimal |

**Score: 4/5** (up from 1)

### E2. Runbooks + On-Call Readiness

| Aspect | Status | Notes |
|--------|--------|-------|
| "How to debug" | **✅** | docs/RUNBOOK.md — env vars, deploy, migrations, Stripe, cron |
| "How to recover" | ✅ | Common failures, key rotation |
| Known failure modes | ✅ | Webhook 500, stuck jobs, credits mismatch, extraction fails |

**Score: 4/5** (up from 1)

**E. DX aggregate: 4/5** (up from 1)

---

## Scorecard (0–5 each + weighted total)

| Category | Raw Score | Weight | Weighted |
|----------|-----------|--------|----------|
| **Security + critical flows** (A+B) | 4.2 | 40% | 1.68 |
| **Reliability & observability** (C) | 3.7 | 25% | 0.93 |
| **Maintainability & tests** (D) | 3.5 | 20% | 0.70 |
| **Performance & scaling** (C1) | 3.0 | 10% | 0.30 |
| **DX & runbooks** (E) | 4.0 | 5% | 0.20 |
| **Total** | — | — | **3.8** |

*Same rubric as initial audit: Security + critical flows 40%, Reliability 25%, Maintainability 20%, Performance 10%, DX 5%*

---

## Remediation Summary

| Ship Blocker | Status |
|--------------|--------|
| Stripe webhook idempotency | ✅ Done |
| SSRF mitigation | ✅ Done |
| Admin secret in URL | ✅ Removed |
| CI | ✅ Done |

| Additional Fixes | Status |
|-----------------|--------|
| Compare flow credit refund | ✅ Done |
| Job retry/backoff | ✅ Done |
| Sentry + structured logging | ✅ Done |
| Tests: blocklist, idempotency | ✅ Done |
| addItemToCollection extracted | ✅ Done |
| Paste idempotency | ✅ Done |
| docs/RUNBOOK.md | ✅ Done |
| .env.example | ✅ Updated |

---

## Remaining Risks (post-remediation)

| # | Risk | Impact | Likelihood | Effort | Mitigation |
|---|------|--------|------------|--------|------------|
| 1 | No auth/billing integration tests | Medium | Medium | Medium | Add Playwright/e2e for signup → capture → compare |
| 2 | No rate limiting | Medium | Medium | Low | Add Vercel/Upstash rate limiting per RUNBOOK |
| 3 | Job poison pills — no DLQ | Low | Low | Medium | Add dead-letter table; move failed jobs after max_attempts |
| 4 | Items list N+1 / 200 limit at scale | Low | Medium | Medium | Pagination, cursor, optimize queries |
| 5 | No correlation IDs | Low | Low | Low | Add X-Request-ID; propagate in logs |

---

## Recommendation

**Clear for production** regarding the original ship blockers. The system is significantly more robust and observable. Consider rate limiting and further integration tests before high-traffic marketing launch.
