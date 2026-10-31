# Enrollment draft API progress

## October 31, 2026
Supabase project `hqbbwxysbsqnnhlxjgxs` now has `public.create_enrollment_draft(uuid,uuid,jsonb)`, an atomic transaction for creating a linked account, student, enrollment, emergency contact and optional guardian. SQL execution is granted only to `service_role`; `anon` and `authenticated` cannot invoke it. RLS remains enabled. The Edge Function source in this feature branch uses this database RPC and requires a UUID idempotency key.

The new Edge Function source is **not deployed**. The existing deployed version only supports account operations. The website still collects local preview data and does not submit student information.

### Critical launch blockers
- Implement verified email sign-in UI, server-side authenticated ownership, and client request wiring.
- Add guardian DOB and authority checks, enforce payload cross-field consistency, verify minor signers.
- Add idempotency payload binding, duplicate-key conflict detection, reasonable throttling and request-rate limits.
- Make database function validation self-contained; Edge Function-only validation is insufficient defense in depth.
- Complete waiver version approval and append-only signed archive.
- Test concurrent requests, rollback on related-record failure, cross-user access restrictions and emails before deployment.
- Determine appropriate external backup and legal retention strategy before collecting live records.

No paid membership, payment processing or waiver archival is active.
