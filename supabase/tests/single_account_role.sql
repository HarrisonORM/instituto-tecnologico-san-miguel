\set ON_ERROR_STOP on
begin;
do $$ begin if current_database()<>'itsm_test' then raise exception 'Base local requerida'; end if; end $$;
insert into auth.users(id,email) values
 ('c1000000-0000-4000-a000-000000000001','single-admin@example.invalid'),
 ('c1000000-0000-4000-a000-000000000002','single-teacher@example.invalid'),
 ('c1000000-0000-4000-a000-000000000003','single-student@example.invalid');
insert into public.profiles(id,full_name) select id,'Rol único local' from auth.users;
insert into public.user_roles values
 ('c1000000-0000-4000-a000-000000000001','system_admin'),
 ('c1000000-0000-4000-a000-000000000002','teacher'),
 ('c1000000-0000-4000-a000-000000000003','student');
create function private.reject_role(command text) returns void language plpgsql as $$
begin
 begin execute command; exception when sqlstate '42501' or sqlstate 'P0001' then return; end;
 raise exception 'ASSERT: cambio de rol no autorizado aceptado';
end $$;
grant execute on function private.reject_role(text) to authenticated;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-a000-000000000001","aal":"aal1"}',true) \gset
select private.reject_role($q$select public.assign_account_role('c1000000-0000-4000-a000-000000000002','student',array['teacher'])$q$);
select set_config('request.jwt.claims',jsonb_build_object('sub','c1000000-0000-4000-a000-000000000001','aal','aal2','amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',floor(extract(epoch from statement_timestamp())))))::text,true) \gset
select private.reject_role($q$select public.assign_account_role('c1000000-0000-4000-a000-000000000001','student',array['system_admin'])$q$);
select private.reject_role($q$select public.assign_account_role('c1000000-0000-4000-a000-000000000002','unknown',array['teacher'])$q$);
select private.reject_role($q$select public.assign_account_role('c1000000-0000-4000-a000-000000000002','student',array['academic_admin'])$q$);
select private.reject_role($q$select public.assign_account_role('c1000000-0000-4000-a000-000000000002','student',array['teacher','student'])$q$);
select public.assign_account_role('c1000000-0000-4000-a000-000000000002','academic_admin',array['teacher']);
select public.set_permissions('c1000000-0000-4000-a000-000000000002',array['structure.manage'],'{}');
-- Un cliente antiguo sustituye, en lugar de agregar un segundo rol.
select public.set_role('c1000000-0000-4000-a000-000000000002','teacher',true);
select private.reject_role($q$select public.set_role('c1000000-0000-4000-a000-000000000002','teacher',false)$q$);
do $$ begin
 if (select count(*) from public.user_roles where user_id='c1000000-0000-4000-a000-000000000002')<>1
 or not exists(select 1 from public.user_roles where user_id='c1000000-0000-4000-a000-000000000002' and role='teacher') then raise exception 'ASSERT: no se conservó un único rol'; end if;
 if exists(select 1 from public.user_permissions where user_id='c1000000-0000-4000-a000-000000000002') then raise exception 'ASSERT: permisos académicos acumulados'; end if;
 if (select count(*) from public.profiles)<>3 then raise exception 'ASSERT: cambio de rol borró un perfil'; end if;
 if (select count(*) from public.audit_events where action like 'role.replace.%')<>2 then raise exception 'ASSERT: falta auditoría del cambio'; end if;
end $$;
select private.reject_role($q$select public.assign_account_role('c1000000-0000-4000-a000-000000000002','student',array['academic_admin'])$q$);
select set_config('request.jwt.claims','{"sub":"c1000000-0000-4000-a000-000000000003","aal":"aal1"}',true) \gset
select private.reject_role($q$select public.assign_account_role('c1000000-0000-4000-a000-000000000002','system_admin',array['teacher'])$q$);
reset role;
-- La restricción también protege frente a una escritura directa de mantenimiento.
do $$ begin
 begin insert into public.user_roles values('c1000000-0000-4000-a000-000000000002','student');
 exception when unique_violation then return; end;
 raise exception 'ASSERT: se pudo añadir un segundo rol directamente';
end $$;
do $$ begin if (select count(*) from pg_catalog.pg_tables where schemaname='public' and rowsecurity)<>26 then raise exception 'ASSERT: RLS alterado'; end if; end $$;
rollback;
