-- REVIEWABLE SCHEMA DESIGN. Not applied. No live collection is enabled.
-- Apply to a fresh Supabase project after review; policies intentionally deny client writes.
begin;
create extension if not exists pgcrypto;
create table public.accounts (
 id uuid primary key references auth.users(id),
 created_at timestamptz not null default now(),
 display_name text not null,
 verified_email text not null
);
create table public.students (
 id uuid primary key default gen_random_uuid(),
 account_id uuid not null references public.accounts(id),
 first_name text not null, last_name text not null, dob date not null,
 contact_email text not null, contact_phone text not null,
 created_at timestamptz not null default now(),
 unique(id,account_id)
);
create table public.enrollments (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null, account_id uuid not null,
 plan_code text not null check(plan_code in ('intro','monthly')),
 status text not null default 'draft' check(status in ('draft','awaiting_signature','archive_pending','awaiting_payment','awaiting_academy','active','cancelled')),
 idempotency_key uuid not null unique,
 created_at timestamptz not null default now(),
 foreign key(student_id,account_id) references public.students(id,account_id),
 unique(id,student_id,account_id)
);
create table public.emergency_contacts (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null, account_id uuid not null,
 full_name text not null, relationship text not null, phone text not null,
 foreign key(student_id,account_id) references public.students(id,account_id)
);
create table public.guardians (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null, account_id uuid not null,
 full_name text not null, dob date not null, relationship text not null,
 email text not null, phone text not null,
 authority_reviewed_at timestamptz,
 foreign key(student_id,account_id) references public.students(id,account_id)
);
create table public.waiver_versions (
 id uuid primary key default gen_random_uuid(),
 version text not null, language text not null check(language in ('es','en')),
 exact_text text not null,
 text_sha256 text not null check(text_sha256 ~ '^[a-f0-9]{64}$'),
 approved_at timestamptz, approved_by text,
 effective_at timestamptz,
 created_at timestamptz not null default now(),
 unique(version,language),
 check ((approved_at is null and approved_by is null) or (approved_at is not null and approved_by is not null))
);
create table public.waiver_records (
 id uuid primary key default gen_random_uuid(),
 enrollment_id uuid not null, student_id uuid not null, account_id uuid not null,
 version_id uuid not null references public.waiver_versions(id),
 signer_name text not null, signer_role text not null check(signer_role in ('adult','guardian')),
 signer_auth_id uuid not null references auth.users(id),
 signed_at timestamptz not null default now(),
 -- Exact student/guardian/contact snapshot, exact consent wording + answers,
 -- authenticated session/OTP verification event, request ID and minimized request metadata.
 evidence jsonb not null,
 canonical_evidence_sha256 text not null check(canonical_evidence_sha256 ~ '^[a-f0-9]{64}$'),
 pdf_sha256 text not null check(pdf_sha256 ~ '^[a-f0-9]{64}$'),
 manifest_sha256 text not null check(manifest_sha256 ~ '^[a-f0-9]{64}$'),
 kms_signature text not null, signing_key_version text not null,
 pdf_object_key text not null unique, evidence_object_key text not null unique,
 manifest_object_key text not null unique,
 supersedes uuid references public.waiver_records(id),
 foreign key(enrollment_id,student_id,account_id) references public.enrollments(id,student_id,account_id)
);
create table public.memberships (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null, account_id uuid not null,
 enrollment_id uuid not null references public.enrollments(id),
 stripe_customer_id text not null, stripe_subscription_id text not null unique,
 stripe_price_id text not null,
 status text not null,
 current_period_end timestamptz,
 last_reconciled_at timestamptz,
 foreign key(student_id,account_id) references public.students(id,account_id)
);
create table public.archive_jobs (
 id uuid primary key default gen_random_uuid(), enrollment_id uuid not null references public.enrollments(id),
 idempotency_key uuid not null unique, state text not null default 'queued',
 attempts integer not null default 0, last_error_code text, created_at timestamptz not null default now()
);
create table public.stripe_events (
 event_id text primary key, event_type text not null, received_at timestamptz not null default now(),
 processed_at timestamptz, processing_error text
);
create table public.waiver_access_log (
 id uuid primary key default gen_random_uuid(), record_id uuid not null references public.waiver_records(id),
 actor_id uuid not null references auth.users(id), action text not null,
 occurred_at timestamptz not null default now(), request_id uuid not null
);
create function public.reject_waiver_mutation() returns trigger language plpgsql set search_path=pg_catalog as $$
begin raise exception 'Append-only record: create a superseding version'; end; $$;
create trigger immutable_waiver before update or delete on public.waiver_records for each row execute function public.reject_waiver_mutation();
create trigger immutable_version before update or delete on public.waiver_versions for each row execute function public.reject_waiver_mutation();
create trigger immutable_access_log before update or delete on public.waiver_access_log for each row execute function public.reject_waiver_mutation();
-- Published versions are inserted only after review. Drafts live outside this immutable catalogue.
-- Direct client access is read-only and owner-scoped. All writes go through authenticated server validation.
alter table public.accounts enable row level security;
create policy own_account on public.accounts for select to authenticated using(id=auth.uid());
alter table public.students enable row level security;
create policy own_student on public.students for select to authenticated using(account_id=auth.uid());
alter table public.enrollments enable row level security;
create policy own_enrollment on public.enrollments for select to authenticated using(account_id=auth.uid());
alter table public.emergency_contacts enable row level security;
create policy own_emergency on public.emergency_contacts for select to authenticated using(account_id=auth.uid());
alter table public.guardians enable row level security;
create policy own_guardian on public.guardians for select to authenticated using(account_id=auth.uid());
alter table public.memberships enable row level security;
create policy own_membership on public.memberships for select to authenticated using(account_id=auth.uid());
alter table public.waiver_versions enable row level security;
create policy approved_waiver on public.waiver_versions for select to authenticated using(approved_at is not null and effective_at<=now());
alter table public.waiver_records enable row level security;
alter table public.waiver_access_log enable row level security;
alter table public.stripe_events enable row level security;
alter table public.archive_jobs enable row level security;
-- No direct client policies for evidence, audit, webhooks or jobs. A server endpoint authorizes every download.
revoke all on public.accounts,public.students,public.enrollments,public.emergency_contacts,public.guardians,public.memberships,public.waiver_versions,public.waiver_records,public.waiver_access_log,public.stripe_events,public.archive_jobs from anon,authenticated;
grant select on public.accounts,public.students,public.enrollments,public.emergency_contacts,public.guardians,public.memberships,public.waiver_versions to authenticated;
grant all on public.accounts,public.students,public.enrollments,public.emergency_contacts,public.guardians,public.memberships,public.waiver_versions,public.waiver_records,public.waiver_access_log,public.stripe_events,public.archive_jobs to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('waiver-archive','waiver-archive',false,10485760,array['application/pdf','application/json']);
-- No storage.objects client policies. Service role only; no public URLs and no upsert.
commit;
