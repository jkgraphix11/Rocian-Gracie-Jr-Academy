-- One lifetime three-class trial per person, independent of login/account.
-- Called by trusted server code when academy accepts a trial, never on a draft.
begin;
create schema if not exists trial_private;
revoke all on schema trial_private from public, anon, authenticated;
grant usage on schema trial_private to service_role;

create function trial_private.normalize_name(value text) returns text
language sql immutable strict parallel safe set search_path = '' as $$
 select regexp_replace(lower(translate(normalize(value, NFKC),
 'ÁÀÂÄÃÅÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑÇáàâäãåéèêëíìîïóòôöõúùûüñç',
 'AAAAAAEEEEIIIIOOOOOUUUUNCaaaaaaeeeeiiiiooooouuuunc')), '[^[:alnum:]]', '', 'g');
$$;
create function trial_private.normalize_phone(value text) returns text
language sql immutable strict parallel safe set search_path = '' as $$
 select regexp_replace(value, '[^0-9]', '', 'g');
$$;
create table trial_private.free_trial_claims (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique,
 first_name text not null check(length(btrim(first_name)) between 1 and 100),
 last_name text not null check(length(btrim(last_name)) between 1 and 100),
 date_of_birth date not null check(isfinite(date_of_birth)),
 email text not null check(length(email) <= 254 and btrim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 phone text not null check(phone ~ '^\+[0-9 ()-]{10,25}$'),
 name_key text generated always as (trial_private.normalize_name(first_name || ' ' || last_name)) stored not null,
 email_key text generated always as (lower(btrim(email))) stored not null,
 phone_key text generated always as (trial_private.normalize_phone(phone)) stored not null,
 class_allowance integer not null default 3 check(class_allowance = 3),
 granted_at timestamptz not null default now(),
 constraint trial_name_required check(length(name_key) > 0),
 constraint trial_phone_country_required check(phone_key ~ '^(52[0-9]{10}|1[0-9]{10})$'),
 constraint one_trial_per_person unique(name_key, date_of_birth)
);
create index trial_email_lookup on trial_private.free_trial_claims(email_key);
create index trial_phone_lookup on trial_private.free_trial_claims(phone_key);
alter table trial_private.free_trial_claims enable row level security;
revoke all on trial_private.free_trial_claims from public, anon, authenticated;
grant select,insert on trial_private.free_trial_claims to service_role;

create function trial_private.guard_trial_claim() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
 if TG_OP <> 'INSERT' then
  raise exception using errcode='P0001', message='TRIAL_HISTORY_IMMUTABLE';
 end if;
 -- Serializes cross-field checks as well as inserts, including different accounts.
 -- At higher isolation a stale snapshot could miss a contact match: fail closed.
 if current_setting('transaction_isolation') <> 'read committed' then
  raise exception using errcode='P0001', message='TRIAL_REQUIRES_READ_COMMITTED';
 end if;
 perform pg_advisory_xact_lock(73821, 3);
 if NEW.date_of_birth > (now() at time zone 'America/Tijuana')::date then
  raise exception using errcode='22023', message='INVALID_TRIAL_DATE_OF_BIRTH';
 end if;
 if exists(select 1 from trial_private.free_trial_claims c
  where c.name_key=trial_private.normalize_name(NEW.first_name || ' ' || NEW.last_name)
    and c.date_of_birth=NEW.date_of_birth) then
  raise exception using errcode='P0001', message='TRIAL_ALREADY_USED';
 end if;
 -- Contact-only matches may be siblings, spouses or recycled numbers.
 -- Hold for staff review rather than calling them the same person.
 if exists(select 1 from trial_private.free_trial_claims c
  where c.email_key=lower(btrim(NEW.email))
     or c.phone_key=trial_private.normalize_phone(NEW.phone)) then
  raise exception using errcode='P0001', message='TRIAL_REVIEW_REQUIRED';
 end if;
 return NEW;
end;
$$;
create trigger guard_trial_claim before insert or update or delete
 on trial_private.free_trial_claims for each row execute function trial_private.guard_trial_claim();

create function public.claim_free_trial(
 p_request_id uuid, p_first_name text, p_last_name text, p_date_of_birth date,
 p_email text, p_phone text
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare existing trial_private.free_trial_claims; claim_id uuid;
begin
 -- No personal data in error details or API responses; caller verifies the identity.
 if p_request_id is null or p_first_name is null or p_last_name is null
    or p_date_of_birth is null or p_email is null or p_phone is null then
  raise exception using errcode='22023', message='TRIAL_IDENTITY_REQUIRED';
 end if;
 if current_setting('transaction_isolation') <> 'read committed' then
  raise exception using errcode='22023', message='TRIAL_REQUIRES_READ_COMMITTED';
 end if;
 perform pg_advisory_xact_lock(73821, 3);
 select * into existing from trial_private.free_trial_claims where request_id=p_request_id;
 if found then
  if existing.name_key=trial_private.normalize_name(p_first_name || ' ' || p_last_name)
     and existing.date_of_birth=p_date_of_birth
     and existing.email_key=lower(btrim(p_email))
     and existing.phone_key=trial_private.normalize_phone(p_phone) then
   return jsonb_build_object('status','granted','claim_id',existing.id,'classes',3);
  end if;
  raise exception using errcode='22023', message='TRIAL_REQUEST_ID_REUSED';
 end if;
 begin
  insert into trial_private.free_trial_claims(request_id,first_name,last_name,date_of_birth,email,phone)
  values(p_request_id,p_first_name,p_last_name,p_date_of_birth,p_email,p_phone) returning id into claim_id;
 exception when raise_exception then
  if SQLERRM='TRIAL_ALREADY_USED' then return jsonb_build_object('status','already_used'); end if;
  if SQLERRM='TRIAL_REVIEW_REQUIRED' then return jsonb_build_object('status','review_required'); end if;
  raise;
 end;
 return jsonb_build_object('status','granted','claim_id',claim_id,'classes',3);
end;
$$;
revoke all on function trial_private.normalize_name(text), trial_private.normalize_phone(text), trial_private.guard_trial_claim() from public,anon,authenticated;
grant execute on function trial_private.normalize_name(text), trial_private.normalize_phone(text), trial_private.guard_trial_claim() to service_role;
revoke all on function public.claim_free_trial(uuid,text,text,date,text,text) from public,anon,authenticated;
grant execute on function public.claim_free_trial(uuid,text,text,date,text,text) to service_role;
comment on function public.claim_free_trial(uuid,text,text,date,text,text) is
 'Trusted backend only. granted = one lifetime three-class allowance; already_used = same normalized name/DOB; review_required = shared phone/email. Never grant from browser or draft enrollment.';
-- Link grants to stable student records so editing a profile cannot reset a trial.
create table trial_private.trial_students (
 student_id uuid primary key references public.students(id),
 enrollment_id uuid not null unique references public.enrollments(id) deferrable initially deferred,
 claim_id uuid not null unique references trial_private.free_trial_claims(id)
);
alter table trial_private.trial_students enable row level security;
revoke all on trial_private.trial_students from public,anon,authenticated;
grant select,insert on trial_private.trial_students to service_role;
create function trial_private.preserve_trial_link() returns trigger
language plpgsql security invoker set search_path='' as $$
begin raise exception using errcode='P0001',message='TRIAL_HISTORY_IMMUTABLE'; end;
$$;
create trigger preserve_trial_link before update or delete on trial_private.trial_students
 for each row execute function trial_private.preserve_trial_link();

create function trial_private.enforce_enrollment_trial() returns trigger
language plpgsql security invoker set search_path='' as $$
declare student public.students; result jsonb; linked trial_private.trial_students;
begin
 perform pg_advisory_xact_lock(73821,3);
 select * into linked from trial_private.trial_students where enrollment_id=NEW.id;
 if found then
  if NEW.student_id <> linked.student_id then
   raise exception using errcode='P0001',message='TRIAL_PARTICIPANT_IMMUTABLE';
  end if;
  return NEW;
 end if;
 if NEW.enrollment_type <> 'intro' or NEW.status <> 'complete' then return NEW; end if;
 if exists(select 1 from trial_private.trial_students where student_id=NEW.student_id) then
  raise exception using errcode='P0001',message='TRIAL_ALREADY_USED';
 end if;
 select * into strict student from public.students where id=NEW.student_id for update;
 result:=public.claim_free_trial(NEW.id, student.first_name,student.last_name,
   student.date_of_birth,student.email,student.phone);
 if result->>'status'='already_used' then
  raise exception using errcode='P0001',message='TRIAL_ALREADY_USED';
 elsif result->>'status'='review_required' then
  raise exception using errcode='P0001',message='TRIAL_REVIEW_REQUIRED';
 elsif result->>'status' <> 'granted' or result->>'claim_id' is null then
  raise exception using errcode='P0001',message='TRIAL_ELIGIBILITY_UNAVAILABLE';
 end if;
 insert into trial_private.trial_students(student_id,enrollment_id,claim_id)
 values(NEW.student_id,NEW.id,(result->>'claim_id')::uuid);
 return NEW;
end;
$$;
create trigger enforce_enrollment_trial before insert or update on public.enrollments
 for each row execute function trial_private.enforce_enrollment_trial();
revoke all on function trial_private.preserve_trial_link(),trial_private.enforce_enrollment_trial() from public,anon,authenticated;
grant execute on function trial_private.preserve_trial_link(),trial_private.enforce_enrollment_trial() to service_role;
-- No historical data at inspection. Fail closed if concurrent completed trials appeared.
do $$ begin
 if exists(select 1 from public.enrollments where enrollment_type='intro' and status='complete') then
  raise exception 'Existing completed trials require backfill before enabling this migration';
 end if;
end $$;

commit;
