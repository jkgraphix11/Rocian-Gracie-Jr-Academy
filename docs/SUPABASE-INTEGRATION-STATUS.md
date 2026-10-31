# Supabase backend integration — October 31, 2026

## Target project
Supabase project `hqbbwxysbsqnnhlxjgxs` (RGJA Tijuana Website Database).

## Applied database migrations
1. `initial_student_enrollment_secure_schema`: students, guardians, emergency contacts, membership plans, enrollments, waiver versions/signatures, Stripe placeholders and audit events; all application tables have RLS enabled with direct client access denied. Private `signed-waivers` bucket.
2. `align_enrollment_auth_and_archival_foundation`: `accounts`, nullable owner foreign keys on student/enrollment rows, enrollment idempotency keys, `archive_jobs`, `stripe_events`, `waiver_access_log`, and `waiver_signing_challenges`.

**Important:** The initial deployed database schema is NOT the same as `supabase/migrations/202610300001_enrollment_design.sql`. Do not apply that old migration: it creates duplicate tables with different columns. The live project is the reference until a reconciled baseline migration is committed.

## Current activation state
- The website remains a static frontend using a browser-only demonstration.
- No production enrollment POST, authorized document signing, PDF archive worker, Stripe checkout, or staff UI is live.
- No live data should be submitted yet. Keep preview labels truthful and collect no real personal data.
- Do not put the service-role key into GitHub, the browser, or a static GitHub Pages build.
- Edge Functions must verify the Auth user session server-side, enforce origin and input validation, limit abuse, check idempotency, and protect all writes. Add a transaction-safe enrollment RPC rather than multiple partial inserts.
- Before production: review bilingual approved waiver, guardian and academy countersigning requirements, authenticated signer evidence, append-only archive manifests, independent backups, restore tests, privacy notice, and staff MFA.

## Next implementation
1. Make a canonical reconciled schema migration from live DB, capturing the two applied migrations.
2. Implement Auth OTP and verified account ownership.
3. Add transaction-safe enrollments API with tests for unauthorized access and idempotency.
4. Bind the enrollment UI to those APIs on a staging-only route.
5. Implement waiver signing and private archival before public activation.
