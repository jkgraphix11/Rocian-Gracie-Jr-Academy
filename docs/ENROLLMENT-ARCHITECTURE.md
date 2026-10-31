# Current implementation update — October 30, 2026

Guardian details now appear on the student page immediately when DOB indicates under 18, and disappear for adults. Required guardian validation runs on that same page. All text/date/email/phone inputs and the class dropdown are required; whitespace-only values are rejected. The dropdown includes all current disciplines, class levels, yoga, Open Mat and the free-intro exploration option. Selecting the intro interest changes the plan to the free intro; the review displays the interest separately from the plan.

The active waiver is `RGJ-ACADEMY-2026-10-30-v1`, using the supplied Spanish PDF word-for-word except layout whitespace. Both UI languages show the Spanish original, explicitly identified; no approved translation was provided. The original PDF is linked. PDF and text hashes are recorded in demo evidence. The provisional document is retained in docs/waivers for history. Explicit medical and image-use acknowledgements reflect clauses already in the source. No claim of legal approval/enforceability is made.

The original includes participant, additional guardian for minors, and released-party signatures. The demo collects participant and guardian typed names and always marks the academy signature pending. If a minor cannot sign, ask the academy for its procedure. Before live use, extend the unapplied database design to append-only per-signer evidence and authenticated academy countersigning. Each signature must bind to the exact immutable document, participant snapshot and prior evidence manifest; require all applicable signers before representing a document as fully executed. No real legal submission, archival, authentication or payment is enabled.

Historical notes below referring to the provisional text or guardian fields on the contacts page are superseded by this update.

---

# Enrollment implementation and activation

## Implemented in this revision

Eight bilingual static routes retain the existing Archivo/dark/lime design and hero. Homepage primary trial CTAs enter `/enroll/` or `/en/enroll/`; membership and waiver navigation open the same complete flow. The full-screen menu and sticky navigation are retained. Existing contact/location WhatsApp links remain available.

Six steps: intro/monthly selection; student identity/DOB/contact/program; emergency contact plus guardian when under 18; complete versioned provisional waiver, explicit unchecked acknowledgements and typed name matching; editable review and checkout placeholder; truthful preview confirmation. Age uses the Tijuana calendar date. Guardian must be 18+. Returning to edit details invalidates signature and acknowledgements. Changing document language invalidates signing and preserves fields in memory. No personal information is put in browser storage, URLs, logs or requests. Reload closes the draft. Print/save-as-PDF creates a clearly watermarked local draft using the browser; this is not the proposed production PDF/archive system.

## Not implemented or connected

No Supabase instance/migration execution, authentication/OTP, backend endpoints, real signatures, server PDF generation, archival storage, trusted timestamp, KMS signing, email, webhook processor, Stripe account or live payment. `supabase/migrations/202610300001_enrollment_design.sql` is a reviewable unapplied schema. The front end has no configuration switch that silently enables live collection. Activation requires backend implementation and acceptance tests below.

## Records and access design

`accounts` is one verified adult login linked to Supabase Auth. `students` supports adult self-enrollment and dependent minors. Separate `guardians`, `emergency_contacts`, `enrollments`, `memberships`, immutable `waiver_versions` and `waiver_records`, append-only `waiver_access_log`, retryable `archive_jobs`, deduplicated `stripe_events` model the lifecycle. Composite foreign keys bind each enrollment/student to the same owner. Corrections never rewrite executed waiver snapshots; create a new record linked through `supersedes`.

The schema denies browser writes. Owner-scoped RLS allows selected profile reads only. Evidence and archive access go through server endpoints. Keep the service-role key exclusively server-side. Administrative access uses separate server-verified staff roles, least privilege, MFA and an audit trail; never trust user-editable profile metadata for staff permissions. Staff role administration and endpoints remain to implement. Retention/deletion requires a documented, counsel-approved policy and tightly controlled migration workflow, not a public delete endpoint. Database administrators can bypass controls: append-only triggers alone do not make a record immutable.

## Proposed authenticated signing contract

1. Adult/guardian verifies email via Supabase Auth OTP. The server validates the session with Auth, derives account ID, applies rate limits and CSRF/origin controls, and verifies guardian authority as required by academy policy. Typed names and IP addresses alone do not establish identity.
2. `POST /api/enrollments` validates an allowlisted plan, dates, contact fields, relationships and adult status using the server’s Tijuana calendar date. Ignore caller-supplied owner/status fields. Persist a draft with an idempotency key; under-18 students cannot sign as adults.
3. `GET /api/enrollments/:id/waiver` checks ownership and returns the current approved version, exact UTF-8 text/hash, locale, complete signer/student snapshot, precise acknowledgement strings, and a short-lived single-use challenge tied to these values. The server supplies all authoritative values.
4. `POST /api/enrollments/:id/sign` accepts the challenge, explicitly true acknowledgements, typed name and idempotency key. Recheck identity/ownership, age/guardian authority, exact normalized name, current version/hash, locale and unchanged draft snapshot. Reject stale or consumed challenges (safe retries return the original record). Reauthentication/OTP should be recent. Do not accept a client timestamp, digest, or PDF as authoritative evidence. A new language or version requires renewed consent.
5. Atomically consume the challenge and enqueue archival work with `archive_pending`. Freeze the evidence snapshot so retries never use later profile changes. Server time in UTC is authoritative; client time, user agent, request ID and minimized IP evidence are labeled auxiliary, with collection/retention disclosed in the privacy notice.
6. Generate a PDF with embedded Unicode fonts from the exact immutable text, student/guardian snapshot, signature, acknowledgement wording, version, locale and server signing timestamp. Persist canonical JSON evidence using a documented deterministic serialization (RFC 8785) and SHA-256. Hash the PDF bytes separately. Create a manifest containing record IDs, document hash, evidence hash, PDF hash, and server timestamp; sign the manifest with an external versioned KMS key. Do not call a simple browser hash a digital signature or trusted timestamp.
7. Upload PDF/JSON/signed manifest to random unique object keys in private `waiver-archive` with `upsert:false`. Verify fetched byte hashes, then commit the immutable `waiver_records` entry and complete the job. Only now expose archive success. Handle upload/transaction failures with idempotent retries, quarantined orphan cleanup and alerts; never silently report a saved waiver on failure.
8. An authenticated record-download endpoint verifies account ownership or server-managed staff permission, logs access, and streams a verified copy or returns a short-lived signed URL. Send an authenticated retrieval link (not a public attachment) to the verified signer. Email failure must be retryable without repeating signing.

## Tamper evidence and backups

Hashing detects changes only when the reference digest is independently protected. Store signed manifests and their public-key/version metadata separately; restrict KMS signing permissions. Replicate archive objects and manifests to independent encrypted storage with provider-supported retention/object lock. Consider an accredited preservation/timestamp provider for Mexico/NOM-151 requirements following local legal review. Neither Supabase nor typed-name signing by itself establishes NOM-151 compliance.

Enable paid database PITR as appropriate and encrypted periodic database exports to a separate account. Supabase database backups **do not contain Storage object bytes**. Back up every PDF, JSON and manifest separately, with object inventory, hashes, retention settings and key recovery procedures. Proposed operational targets: daily independent object backup, alert after a missed run, quarterly restore drills to an isolated project. Set RPO/RTO with the academy before launch; these are design proposals, not running services. A drill must restore SQL and objects, compare hashes/signatures, sample authenticated download access and confirm tenant isolation.

## Stripe configuration contract

Keep runtime secrets out of the repository and client bundle. Required server configuration: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `APP_ORIGIN`, `ARCHIVE_KMS_KEY_ID`. Use separate test/live environments and pinned, reviewed SDK/API versions. Public Auth clients use only the publishable Supabase key with RLS. Production flags default off and cannot be enabled until all dependencies pass.

The academy must approve MXN or other actual billing currency, final prices, interval, taxes, trial eligibility, cancellation/refund/renewal terms and legal merchant identity. The free intro is separate from a Stripe trial and must not automatically turn into a paid subscription.

`POST /api/checkout`: authenticated owner only, archived approved waiver required; server maps plan code to an allowlisted active Stripe Price (never accepts client amounts/price IDs), records separate membership-term acceptance, uses `mode:subscription`, and uses a stable idempotency key. Redirect only to Stripe-generated URLs. Checkout cancel returns to a resumable review. A success URL is not evidence of payment.

`POST /api/stripe/webhook`: verify signature against raw body; dedupe event IDs; handle checkout completion/async success/failure, invoice paid/payment failed, subscription updated/deleted, refunds and disputes according to academy policy. Reconcile authoritative subscription state to handle out-of-order delivery; never assume an unpaid completed checkout grants access. Keep billing state separate from academy admission and waiver state. Periodic reconciliation catches missing events. Create customer-portal sessions on the server for the authenticated owner’s stored Stripe customer; never accept an arbitrary customer ID.

For the free intro, archived approved waiver leads to `awaiting_academy`, not automatic booking. For paid plans, grant training eligibility only after verified payment/subscription status plus academy acceptance and current required waiver.

## Launch acceptance tests still required

- Migrate a test Supabase project and prove user A cannot read/write/download user B’s students or records; unauthenticated storage access is denied; staff access is audited.
- Test exact 18th birthday, leap dates, invalid/future DOB, underage guardian, forged owner/status, stale version/challenge, replay, concurrent sign requests and changed identity after signing.
- Verify Unicode Spanish PDF rendering, multipage completeness, exact text/evidence/PDF hashes, independent signature validation, denied overwrite, worker failure/retry and complete restore.
- Stripe test checkout success, cancel, declined and delayed payments; duplicate/out-of-order webhooks, renewal failure, cancellation, refunds and portal ownership.
- Academy and qualified local counsel approve Spanish and English waiver equivalence, legal entity, risk/release scope, minors and guardian authority, electronic consent/identity evidence, privacy notice, retention and any required preservation certification. Do not describe this provisional draft as enforceable or compliant.

## Reference basis (consulted October 30, 2026)

- Supabase backup scope: https://supabase.com/docs/guides/platform/backups
- Stripe webhook-based fulfillment: https://docs.stripe.com/payments/existing-customers?platform=web&ui=stripe-hosted
- Stripe integration practices: https://github.com/stripe/ai/blob/main/skills/stripe-best-practices/references/payments.md
- Mexico Código de Comercio, electronic signatures including art. 97: https://www.diputados.gob.mx/LeyesBiblio/pdf/CCom.pdf
- NOM-151 preservation framework: https://sidof.segob.gob.mx/notas/docFuente/5478024

These sources inform the implementation design, not an enforceability opinion. The draft is original provisional wording; it is not another gym’s legal form.
