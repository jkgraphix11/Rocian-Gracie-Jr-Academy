# One lifetime free trial per person

The three free classes are one allowance, not three separate trial registrations.

Status: applied and verified on Supabase project `hqbbwxysbsqnnhlxjgxs`. The existing student and enrollment tables were empty at application. The static enrollment preview does not submit data to a backend and therefore does not yet display a live eligibility decision. Database completion is enforced regardless of which backend performs the write.

## Matching

- Full first/last name plus birth date: one lifetime claim, regardless of account, changed phone or changed email. Name keys ignore case, spacing, punctuation and common Spanish/Latin accents.
- Phone numbers use international country codes; formatting characters are removed. Email keys ignore surrounding spaces and case. Provider-specific email aliases are not rewritten.
- Same phone or email with a different identity: return `review_required`; never auto-grant another trial or automatically conclude that the people are the same. Staff must verify siblings, spouses, recycled numbers, name changes, twins and typos. Do not delete the original claim to resolve these cases. A reviewed exception workflow is a separate follow-up.
- Entirely different false identity details cannot be identified reliably from these fields. Verify contact ownership and have academy staff verify identity.

## Server contract

After authenticating and verifying contact ownership, the trusted backend may call `public.claim_free_trial` with a server-controlled UUID request ID, legal first/last name, birth date, contact email and international phone (+52 or +1). Never use emergency contact identity as the participant identity; children use their own name/DOB and the parent's contact details.

The enrollment trigger calls this automatically when an `intro` enrollment enters `complete`, in the same transaction, using the enrollment ID as its request ID. It links the lifetime claim to the stable student ID. Subsequent profile changes, cancellation, and status transitions on that same enrollment cannot grant a new allowance. Do not separately call the RPC with a different request ID for an enrollment that will be completed. Standalone staff workflows should call only when accepting the trial, not on field edits, eligibility previews or abandoned drafts. Keep the request ID through retries. A repeated identical request returns the same claim. Different details with the same request ID fail. Both retry and creation must be part of the enrollment acceptance transaction so failed acceptance rolls the claim back.

`granted` carries claim ID and class allowance 3. `already_used` blocks a second trial and should offer a paid membership. `review_required` holds acceptance for staff review; it must never be treated as eligible. Database errors and unavailable eligibility service fail closed. Show generic bilingual messages, never existing names, contact details or birth dates.

The private ledger has RLS and no browser permissions. Only trusted service code can call the function. A trigger also protects direct inserts and preserves history against update/delete. A unique constraint prevents concurrent same-name/DOB duplicates; a transaction lock protects cross-field matching in READ COMMITTED transactions. Changing user/student profile information does not change the saved trial identity snapshot.

Before collecting live enrollments, implement the authenticated website/backend connection, map the database errors to user-facing messages, and implement staff resolution and class attendance accounting. Import any academy trial history held outside this currently empty database before launch; otherwise it cannot identify those past participants. Claims alone do not book classes, prove attendance, or activate the currently static website.

## Verification

`supabase/tests/trial_eligibility.sql` passed against the live database under `service_role`, with all synthetic data rolled back. It covers first grants, idempotency, case/accent/spacing normalization, changed contact details, shared phone/email review, future birth dates, missing phone country codes, draft versus completed enrollments, profile changes and cancellation, new student records, direct inserts, paid memberships, and denied browser privileges. Security advisors report only informational RLS-without-policy notices; these tables intentionally deny browser access.
