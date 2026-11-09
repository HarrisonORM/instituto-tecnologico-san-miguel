begin;
insert into auth.users(id) values
 ('b1000000-0000-4000-a000-000000000001'),('b1000000-0000-4000-a000-000000000002'),
 ('b1000000-0000-4000-a000-000000000003'),('b1000000-0000-4000-a000-000000000004');
insert into public.profiles(id,full_name) values
 ('b1000000-0000-4000-a000-000000000001','Sistema local'),('b1000000-0000-4000-a000-000000000002','Académico local'),
 ('b1000000-0000-4000-a000-000000000003','Docente local'),('b1000000-0000-4000-a000-000000000004','Estudiante local');
insert into public.user_roles values
 ('b1000000-0000-4000-a000-000000000001','system_admin'),('b1000000-0000-4000-a000-000000000002','academic_admin'),
 ('b1000000-0000-4000-a000-000000000003','teacher'),('b1000000-0000-4000-a000-000000000004','student');
create function private.deny_people(command text) returns void language plpgsql set search_path='' as $$
begin
 begin execute command; exception when sqlstate '42501' or sqlstate 'P0001' then return; end;
 raise exception 'ASSERT: operación no permitida aceptada: %',command;
end $$;
grant execute on function private.deny_people(text) to authenticated;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"b1000000-0000-4000-a000-000000000001","aal":"aal1"}',true) \gset
select private.deny_people($q$select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['structure.manage'],'{}')$q$);
select set_config('request.jwt.claims',jsonb_build_object('sub','b1000000-0000-4000-a000-000000000001','aal','aal2','amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',floor(extract(epoch from statement_timestamp())))))::text,true) \gset
select private.deny_people($q$select public.set_permissions('b1000000-0000-4000-a000-000000000004',array['structure.manage'],'{}')$q$);
select private.deny_people($q$select public.set_permission('b1000000-0000-4000-a000-000000000003','structure.manage',true)$q$);
select private.deny_people($q$select public.set_permissions('b1000000-0000-4000-a000-000000000001',array['structure.manage'],'{}')$q$);
select private.deny_people($q$select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['structure.manage','unknown'],'{}')$q$);
select private.deny_people($q$select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['structure.manage','structure.manage'],'{}')$q$);
select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['structure.manage','evaluation.manage'],'{}');
do $$ begin
 if (select count(*) from public.user_permissions where user_id='b1000000-0000-4000-a000-000000000002')<>2 then raise exception 'ASSERT: conjunto no guardado'; end if;
 if (select count(*) from public.audit_events where action='permissions.replace')<>1 then raise exception 'ASSERT: auditoría del conjunto ausente'; end if;
end $$;
-- Una vista obsoleta no puede sobrescribir cambios de otro administrador.
select private.deny_people($q$select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['contact.manage'],'{}')$q$);
select private.deny_people($q$select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['contact.manage','unknown'],array['structure.manage','evaluation.manage'])$q$);
do $$ begin
 if (select count(*) from public.user_permissions where user_id='b1000000-0000-4000-a000-000000000002')<>2 then raise exception 'ASSERT: operación fallida modificó el conjunto'; end if;
end $$;
select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['enrollment.manage'],array['evaluation.manage','structure.manage']);
select public.set_permission('b1000000-0000-4000-a000-000000000002','contact.manage',true);
select public.set_permission('b1000000-0000-4000-a000-000000000002','contact.manage',false);
select public.set_role('b1000000-0000-4000-a000-000000000002','academic_admin',false);
do $$ begin
 if exists(select 1 from public.user_permissions where user_id='b1000000-0000-4000-a000-000000000002') then raise exception 'ASSERT: permisos persistieron al quitar el rol'; end if;
end $$;
select public.set_role('b1000000-0000-4000-a000-000000000002','academic_admin',true);
select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['structure.manage'],'{}');
select public.set_permissions('b1000000-0000-4000-a000-000000000002','{}',array['structure.manage']);
select set_config('request.jwt.claims','{"sub":"b1000000-0000-4000-a000-000000000004","aal":"aal1"}',true) \gset
do $$ begin
 if (select count(*) from public.user_roles)<>1 then raise exception 'ASSERT: estudiante ve roles ajenos'; end if;
 if exists(select 1 from public.user_permissions) then raise exception 'ASSERT: estudiante ve permisos ajenos'; end if;
end $$;
select private.deny_people($q$select public.set_permissions('b1000000-0000-4000-a000-000000000002',array['structure.manage'],'{}')$q$);
reset role;
-- Tampoco una escritura directa de mantenimiento puede dejar permisos en un docente.
select private.deny_people($q$insert into public.user_permissions values('b1000000-0000-4000-a000-000000000003','structure.manage')$q$);
do $$ begin if (select count(*) from pg_catalog.pg_tables where schemaname='public' and rowsecurity)<>26 then raise exception 'ASSERT: RLS alterado'; end if; end $$;
rollback;
