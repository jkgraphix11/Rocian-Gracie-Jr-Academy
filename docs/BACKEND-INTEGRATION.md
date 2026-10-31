# Backend integration status

Supabase project: `hqbbwxysbsqnnhlxjgxs`.

Live DB has the ten initial application tables plus `accounts`, `archive_jobs`, `stripe_events`, `waiver_access_log`, and `waiver_signing_challenges`. These are locked down with RLS and no public table access. This schema currently differs from the earlier draft migration in `supabase/migrations/202610300001_enrollment_design.sql`; do not run the draft migration on this database.

`supabase/functions/enrollment-api/index.ts` is a JWT-protected Edge Function source file implementing only verified-account setup (`POST /accounts`) and account read (`GET /me`). It requires an `APP_ORIGIN` environment secret containing the approved website origin, and standard Supabase service credentials (server-side only). It is NOT a finished enrollment/signing endpoint. Do not publish registration as live until auth OTP, student enrollment, guardian validation, versioned waiver signing, archive PDF evidence, backup/recovery and cross-account isolation tests pass.

The website currently has no live connection. No Stripe processing has been activated. No live waiver archival is operational.
