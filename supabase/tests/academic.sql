\set ON_ERROR_STOP on
begin;
do $$ begin if current_database()<>'itsm_test' then raise exception 'Base local de pruebas requerida'; end if; end $$;

-- Un cierre con tres destinatarios: borde de aprobación, borde de reprobación
-- y actividad no entregada. No se usan datos ni conexiones de la institución.
insert into auth.users(id,email) select ('00000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,'academic'||n||'@example.invalid' from generate_series(1,5) n;
insert into public.profiles(id,full_name) select id,'Persona académica ficticia '||row_number() over() from auth.users;
insert into public.user_roles values
('00000000-0000-0000-0000-000000000001','student'),
('00000000-0000-0000-0000-000000000002','student'),
('00000000-0000-0000-0000-000000000003','student'),
('00000000-0000-0000-0000-000000000004','teacher'),
('00000000-0000-0000-0000-000000000005','academic_admin');
insert into public.user_permissions values('00000000-0000-0000-0000-000000000005','period.close');
insert into public.programs(id,name) values('10000000-0000-0000-0000-000000000001','Programa ficticio');
insert into public.periods(id,name,starts_on,ends_on) values('20000000-0000-0000-0000-000000000001','Cierre ficticio','2020-01-01','2030-12-31');
insert into public.subjects(id,program_id,name) values('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Materia de cierre');
insert into public.groups(id,subject_id,period_id,name) values('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Grupo de cierre');
insert into public.enrollments select ('00000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,'40000000-0000-0000-0000-000000000001'::uuid from generate_series(1,3) n;
insert into public.teacher_groups values('00000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000001');
insert into public.categories(id,subject_id,period_id,name,weight) values('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Práctica',100);
insert into public.tasks(id,group_id,category_id,author_id,title,description,due_at) values('60000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','Actividad final','Actividad ficticia','2020-01-02');
insert into public.submissions(id,task_id,student_id,current_version,grade,graded_by,graded_at) values
('70000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',1,2.95,'00000000-0000-0000-0000-000000000004',now()),
('70000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',1,2.94,'00000000-0000-0000-0000-000000000004',now()),
('70000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003',0,null,null,null);
insert into public.submission_versions(submission_id,version,body,late) values
('70000000-0000-0000-0000-000000000001',1,'Respuesta ficticia A',false),
('70000000-0000-0000-0000-000000000002',1,'Respuesta ficticia B',false);

-- Otra materia comprueba pesos por categoría y actividades de igual peso:
-- ((4 + 2) / 2) * 60 % + 4 * 40 % = 3.4.
insert into public.subjects(id,program_id,name) values('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Materia ponderada');
insert into public.groups(id,subject_id,period_id,name) values('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Grupo ponderado');
insert into public.enrollments values('00000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000002');
insert into public.teacher_groups values('00000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000002');
insert into public.categories(id,subject_id,period_id,name,weight) values
('50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Tareas',60),
('50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Proyecto',40);
insert into public.tasks(id,group_id,category_id,author_id,title,description,due_at)
select ('60000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,'40000000-0000-0000-0000-000000000002'::uuid,
case when n=4 then '50000000-0000-0000-0000-000000000003'::uuid else '50000000-0000-0000-0000-000000000002'::uuid end,
'00000000-0000-0000-0000-000000000004'::uuid,'Actividad ponderada '||n,'Ejemplo ficticio','2020-01-02'::timestamptz from generate_series(2,4) n;
insert into public.submissions(id,task_id,student_id,current_version,grade,graded_by,graded_at)
select ('70000000-0000-0000-0000-'||lpad((n+2)::text,12,'0'))::uuid,('60000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,
'00000000-0000-0000-0000-000000000001'::uuid,1,case when n=3 then 2.0 else 4.0 end,'00000000-0000-0000-0000-000000000004'::uuid,now() from generate_series(2,4) n;
insert into public.submission_versions(submission_id,version,body,late)
select ('70000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,1,'Respuesta ponderada ficticia',false from generate_series(4,6) n;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000005","aal":"aal2"}',true) \gset
select public.close_period('20000000-0000-0000-0000-000000000001');
reset role;
set constraints all immediate;
do $$ begin
 assert (select final_grade=3.0 and passed from public.final_results where student_id='00000000-0000-0000-0000-000000000001' and group_id='40000000-0000-0000-0000-000000000001'),'2.95 must round to 3.0 and pass';
 assert (select final_grade=2.9 and not passed from public.final_results where student_id='00000000-0000-0000-0000-000000000002'),'2.94 must round to 2.9 and fail';
 assert (select grade=0 and current_version=0 from public.submissions where id='70000000-0000-0000-0000-000000000003'),'missing submission must receive zero without inventing a delivered version';
 assert (select count(*)=1 from public.grade_history where submission_id='70000000-0000-0000-0000-000000000003' and new_grade=0),'closing zero must have an audit trail';
 assert (select final_grade=0 and not passed from public.final_results where student_id='00000000-0000-0000-0000-000000000003'),'missing work must count in final result';
 assert (select final_grade=3.4 and passed from public.final_results where student_id='00000000-0000-0000-0000-000000000001' and group_id='40000000-0000-0000-0000-000000000002'),'categories must use their weights and equal activity weights within each category';
 assert (select closed_at is not null from public.periods where id='20000000-0000-0000-0000-000000000001'),'term must be closed';
end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","aal":"aal1"}',true) \gset
do $$ begin assert (select count(*)=2 from public.final_results),'student sees only their two final results'; end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000004","aal":"aal1"}',true) \gset
do $$ declare blocked boolean:=false; begin
 begin perform public.review_work('70000000-0000-0000-0000-000000000001','grade',5.0,'Cambio no permitido'); exception when raise_exception then blocked:=true; end;
 assert blocked,'closed term must block a new grade';
end $$;
reset role;
select 'OK: category weights, closing, rounding boundaries, pass threshold, missing zeros, audit and closed-term lock' as result;
rollback;
