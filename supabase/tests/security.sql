\set ON_ERROR_STOP on
begin;
do $$ begin if current_database()<>'itsm_test' then raise exception 'Base local de pruebas requerida'; end if; end $$;
create function private.expect_rejection(statement text) returns void language plpgsql as $$
declare rejected boolean:=false;
begin
 begin execute statement; exception when insufficient_privilege or raise_exception then rejected:=true; end;
 if not rejected then raise exception 'ASSERT: expected rejection for %',statement; end if;
end $$;
grant execute on function private.expect_rejection(text) to authenticated,service_role;
insert into auth.users(id,email) select ('00000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,'test'||n||'@example.invalid' from generate_series(1,7) n;
insert into public.profiles(id,full_name) select id,'Persona ficticia '||row_number() over() from auth.users;
insert into public.user_roles values
('00000000-0000-0000-0000-000000000001','student'),('00000000-0000-0000-0000-000000000002','student'),
('00000000-0000-0000-0000-000000000003','teacher'),('00000000-0000-0000-0000-000000000004','academic_admin'),
('00000000-0000-0000-0000-000000000005','system_admin'),('00000000-0000-0000-0000-000000000006','system_admin'),('00000000-0000-0000-0000-000000000007','student');
insert into public.user_permissions values('00000000-0000-0000-0000-000000000004','contact.manage'),('00000000-0000-0000-0000-000000000004','period.close');
insert into public.programs(id,name) values('10000000-0000-0000-0000-000000000001','Carrera de prueba');
insert into public.periods(id,name,starts_on,ends_on) values('20000000-0000-0000-0000-000000000001','Período de prueba','2020-01-01','2030-12-31');
insert into public.subjects(id,program_id,name) values('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Materia A'),('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Materia B');
insert into public.groups(id,subject_id,period_id,name) values('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','A'),('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','B');
insert into public.enrollments values('00000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002');
insert into public.teacher_groups values('00000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000001');
insert into public.categories(id,subject_id,period_id,name,weight) values('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Tareas',100),('50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Tareas',100);
insert into public.tasks(id,group_id,category_id,author_id,title,description,due_at) values('60000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','Actividad A','Original','2020-01-02'),('60000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003','Actividad B','Original privado','2020-01-02');
insert into public.submissions(id,task_id,student_id) values('70000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001'),('70000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","aal":"aal1","user_metadata":{"role":"system_admin"}}',true) \gset
do $$ begin
 assert (select count(*) from public.profiles)=1,'student profile isolation';
 assert (select count(*) from public.submissions)=1,'student grade isolation';
 assert (select count(*) from public.tasks)=1,'task recipient isolation';
 assert not private.system_admin(),'editable metadata must not grant roles';
 perform public.submit_work('70000000-0000-0000-0000-000000000001','Primera entrega',array[]::uuid[]);
 assert (select late from public.submission_versions limit 1),'late flag';
 perform private.expect_rejection($q$select public.submit_work('70000000-0000-0000-0000-000000000002','Ajena',array[]::uuid[])$q$);
 perform private.expect_rejection($q$select public.submit_work('70000000-0000-0000-0000-000000000001','Reemplazo sin permiso',array[]::uuid[])$q$);
end $$;

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000003","aal":"aal1"}',true) \gset
do $$ begin
 assert (select count(*) from public.submissions)=1,'assigned group only';
 perform public.review_work('70000000-0000-0000-0000-000000000001','grade',4.2,'Buen trabajo');
 perform private.expect_rejection($q$select public.review_work('70000000-0000-0000-0000-000000000002','grade',5,'Ajena')$q$);
 perform public.review_work('70000000-0000-0000-0000-000000000001','authorize_replacement',null,null);
 perform public.set_translation('task','60000000-0000-0000-0000-000000000001','en','{"title":"Assignment A","description":"Reviewed translation"}');
end $$;

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","aal":"aal1"}',true) \gset
do $$ begin
 assert (select grade from public.submissions limit 1)=4.2,'immediate grade visibility';
 assert (select count(*) from public.content_translations)=1,'translation follows original access';
 perform public.submit_work('70000000-0000-0000-0000-000000000001','Reemplazo autorizado',array[]::uuid[]);
 assert (select count(*) from public.submission_versions)=2,'replacement history';
 assert (select grade is null from public.submissions limit 1),'replacement clears previous grade for review';
 perform private.expect_rejection($q$select public.set_translation('task','60000000-0000-0000-0000-000000000001','en','{"title":"Unauthorized"}')$q$);
end $$;

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000002","aal":"aal1"}',true) \gset
do $$ begin assert (select count(*) from public.content_translations)=0,'translation must not expose another student task'; end $$;

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000005","aal":"aal1"}',true) \gset
do $$ begin perform private.expect_rejection($q$select public.manage_account('00000000-0000-0000-0000-000000000001','suspended')$q$); end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000005","aal":"aal2"}',true) \gset
do $$ begin
 assert (select count(*) from public.submissions)=0,'account admin has no grades';
 assert (select count(*) from public.content_translations)=0,'account admin has no task translations';
 perform public.manage_account('00000000-0000-0000-0000-000000000001','suspended');
 perform private.expect_rejection($q$select public.request_deletion('00000000-0000-0000-0000-000000000003')$q$);
 perform public.request_deletion('00000000-0000-0000-0000-000000000007');
 perform private.expect_rejection('select public.approve_deletion('''||(select id::text from public.deletion_requests where target_id='00000000-0000-0000-0000-000000000007')||''')');
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000006","aal":"aal2"}',true) \gset
do $$ begin
 perform public.approve_deletion((select id from public.deletion_requests where target_id='00000000-0000-0000-0000-000000000007'));
 assert (select state from public.deletion_requests where target_id='00000000-0000-0000-0000-000000000007')='approved','second admin approval';
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","aal":"aal1"}',true) \gset
do $$ begin
 assert (select count(*) from public.submissions)=0,'suspension blocks an existing identity';
 perform private.expect_rejection($q$select public.add_comment('70000000-0000-0000-0000-000000000001','No permitido')$q$);
end $$;

select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000004","aal":"aal2"}',true) \gset
do $$ begin perform private.expect_rejection($q$select public.close_period('20000000-0000-0000-0000-000000000001')$q$); end $$;

reset role;
do $$ begin assert not has_function_privilege('anon','public.submit_contact(text,text,text,text,text)','EXECUTE'),'anonymous cannot bypass contact gateway'; end $$;
set local role service_role;
do $$ begin
 for i in 1..60 loop perform public.submit_contact('Ejemplo','test'||i||'@example.invalid','software','Mensaje ficticio de prueba',lpad(to_hex(i),64,'0')); end loop;
 perform private.expect_rejection($q$select public.submit_contact('Ejemplo','overflow@example.invalid','software','Mensaje ficticio de prueba',repeat('f',64))$q$);
end $$;
reset role;
select 'OK: migrations, RLS, grading, replacement, translation, suspension, MFA, dual approval, close blocking and contact budget' as result;
rollback;
