begin;
alter table public.profiles add constraint profile_text_limits check(length(trim(full_name)) between 1 and 200 and length(address)<=500 and length(document_number)<=100);
alter table public.programs add constraint program_text_limits check(length(trim(name)) between 1 and 150 and length(description)<=10000 and length(price_label)<=200);
alter table public.subjects add constraint subject_text_limits check(length(trim(name)) between 1 and 150);
alter table public.groups add constraint group_text_limits check(length(trim(name)) between 1 and 100);
alter table public.periods add constraint period_text_limits check(length(trim(name)) between 1 and 150);
alter table public.categories add constraint category_text_limits check(length(trim(name)) between 1 and 100);
alter table public.tasks add constraint task_text_limits check(length(description)<=20000);
alter table public.submission_versions add constraint submission_text_limits check(length(body)<=50000);
alter table public.rubrics add constraint rubric_size_limit check(octet_length(criteria::text)<=20000 and jsonb_array_length(criteria)<=30);
alter table public.identity_requests add constraint identity_request_size_limit check(octet_length(proposed::text)<=16000);

create function private.guard_academic_structure() returns trigger language plpgsql security definer set search_path='' as $$
declare g public.groups; period uuid;
begin
 if tg_table_name='subjects' then
 perform private.require(exists(select 1 from public.programs where id=new.program_id and archived_at is null));
 elsif tg_table_name='groups' then
 perform private.require(exists(select 1 from public.subjects s join public.programs p on p.id=s.program_id where s.id=new.subject_id and s.archived_at is null and p.archived_at is null));
 perform private.lock_period(new.period_id);
 elsif tg_table_name='categories' then
 perform private.lock_period(new.period_id);
 elsif tg_table_name in ('tasks','enrollments','teacher_groups') then
 select * into strict g from public.groups where id=new.group_id;
 perform private.require(g.archived_at is null);
 perform private.lock_period(g.period_id);
 if tg_table_name='tasks' then
 perform private.require(exists(select 1 from public.categories c where c.id=new.category_id and c.subject_id=g.subject_id and c.period_id=g.period_id));
 elsif tg_table_name='enrollments' then
 perform private.require(exists(select 1 from public.user_roles where user_id=new.student_id and role='student'));
 perform private.require(exists(select 1 from public.profiles p join public.subjects s on s.id=g.subject_id where p.id=new.student_id and (p.program_id is null or p.program_id=s.program_id)));
 else perform private.require(exists(select 1 from public.user_roles where user_id=new.teacher_id and role='teacher'));
 end if;
 end if;
 return new;
end $$;
create trigger subject_structure before insert or update of program_id on public.subjects for each row execute function private.guard_academic_structure();
create trigger group_structure before insert or update of subject_id,period_id on public.groups for each row execute function private.guard_academic_structure();
create trigger category_structure before insert or update on public.categories for each row execute function private.guard_academic_structure();
create trigger task_structure before insert or update of group_id,category_id on public.tasks for each row execute function private.guard_academic_structure();
create trigger enrollment_structure before insert or update on public.enrollments for each row execute function private.guard_academic_structure();
create trigger teacher_structure before insert or update on public.teacher_groups for each row execute function private.guard_academic_structure();

create or replace function public.assign_program(p_user uuid,p_program uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.permitted('enrollment.manage'));
 if exists(select 1 from public.enrollments e join public.groups g on g.id=e.group_id join public.subjects s on s.id=g.subject_id where e.student_id=p_user and s.program_id is distinct from p_program) then raise exception 'La carrera no coincide con las matrículas existentes'; end if;
 update public.profiles set program_id=p_program where id=p_user;
 perform private.log_event('program.assign','profiles',p_user::text);
end $$;
revoke all on function private.guard_academic_structure() from public,anon,authenticated;
commit;
