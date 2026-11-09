-- Run against the deployed schema. All synthetic records are rolled back.
begin;
set local role service_role;
do $$
declare request uuid:=gen_random_uuid(); a jsonb; b jsonb; student uuid; enrollment uuid; other_student uuid;
begin
 a:=public.claim_free_trial(request,'José','QA-Trial','1990-01-01',' QA-TRIAL@example.invalid ','+52 (664) 000-0001');
 if a->>'status'<>'granted' or a->>'classes'<>'3' then raise exception 'First grant failed'; end if;
 b:=public.claim_free_trial(request,'JOSE','QA Trial','1990-01-01','qa-trial@example.invalid','+526640000001');
 if a<>b then raise exception 'Idempotent retry failed'; end if;
 b:=public.claim_free_trial(gen_random_uuid(),'Jose','QA Trial','1990-01-01','different@example.invalid','+16640000002');
 if b->>'status'<>'already_used' then raise exception 'Changed contact bypassed identity'; end if;
 b:=public.claim_free_trial(gen_random_uuid(),'Sibling','QA Trial','1992-01-01','qa-trial@example.invalid','+16640000003');
 if b->>'status'<>'review_required' then raise exception 'Shared email not held for review'; end if;
 b:=public.claim_free_trial(gen_random_uuid(),'Another','QA Trial','1994-01-01','another@example.invalid','+52 (664) 000-0001');
 if b->>'status'<>'review_required' then raise exception 'Shared formatted phone not held for review'; end if;
 begin
  perform public.claim_free_trial(request,'Other','Person','1990-01-01','other@example.invalid','+16640000004');
  raise exception 'Request key reuse allowed';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.claim_free_trial(gen_random_uuid(),'Future','Person','2990-01-01','future@example.invalid','+16640000004');
  raise exception 'Future DOB allowed';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.claim_free_trial(gen_random_uuid(),'Local','Number','1990-01-01','local@example.invalid','6640000001');
  raise exception 'Local phone without country allowed';
 exception when check_violation then null; end;
 insert into public.students(first_name,last_name,date_of_birth,email,phone)
 values('Enrollment','QA Test','1995-02-03','enrollment-qa@example.invalid','+16640000005') returning id into student;
 insert into public.enrollments(student_id,enrollment_type,status) values(student,'intro','started') returning id into enrollment;
 if exists(select 1 from trial_private.trial_students where student_id=student) then raise exception 'Draft consumed trial'; end if;
 update public.enrollments set status='complete' where id=enrollment;
 if not exists(select 1 from trial_private.trial_students where student_id=student) then raise exception 'Completion failed to claim'; end if;
 update public.enrollments set status='cancelled' where id=enrollment;
 update public.students set first_name='Changed',email='changed@example.invalid',phone='+16640000006' where id=student;
 begin
  insert into public.enrollments(student_id,enrollment_type,status) values(student,'intro','complete');
  raise exception 'Profile edit/cancellation reset trial';
 exception when raise_exception then
  if SQLERRM<>'TRIAL_ALREADY_USED' then raise; end if;
 end;
 insert into public.students(first_name,last_name,date_of_birth,email,phone)
 values('ENROLLMENT','QA Test','1995-02-03','new-account@example.invalid','+16640000007') returning id into other_student;
 begin
  insert into public.enrollments(student_id,enrollment_type,status) values(other_student,'intro','complete');
  raise exception 'New student record bypassed identity';
 exception when raise_exception then
  if SQLERRM<>'TRIAL_ALREADY_USED' then raise; end if;
 end;
 insert into public.enrollments(student_id,enrollment_type,status) values(student,'membership','complete');
 begin
  insert into trial_private.free_trial_claims(request_id,first_name,last_name,date_of_birth,email,phone)
  values(gen_random_uuid(),'Jose','QA Trial','1990-01-01','direct@example.invalid','+16640000008');
  raise exception 'Direct insert bypassed matching';
 exception when raise_exception then
  if SQLERRM<>'TRIAL_ALREADY_USED' then raise; end if;
 end;
 if has_function_privilege('anon','public.claim_free_trial(uuid,text,text,date,text,text)','EXECUTE')
    or has_function_privilege('authenticated','public.claim_free_trial(uuid,text,text,date,text,text)','EXECUTE') then
  raise exception 'Browser roles can enumerate eligibility';
 end if;
 if has_schema_privilege('anon','trial_private','USAGE')
    or has_schema_privilege('authenticated','trial_private','USAGE') then raise exception 'Private ledger exposed'; end if;
end $$;
select 'PASS: first trial, retries, normalization, changed contacts, shared-contact review, validation, completion trigger, cancellation/profile changes, duplicate identities, monthly unaffected and browser denial' as result;
rollback;
