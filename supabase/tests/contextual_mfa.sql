\set ON_ERROR_STOP on
begin;
do $$ begin if current_database()<>'itsm_test' then raise exception 'Base local requerida'; end if; end $$;
insert into auth.users(id,email) values
('a1000000-0000-4000-a000-000000000001','admin-a@example.invalid'),
('a1000000-0000-4000-a000-000000000002','admin-b@example.invalid'),
('a1000000-0000-4000-a000-000000000003','student@example.invalid'),
('a1000000-0000-4000-a000-000000000004','academic@example.invalid');
insert into public.profiles(id,full_name) select id,'Contexto '||email from auth.users;
insert into public.user_roles values
('a1000000-0000-4000-a000-000000000001','system_admin'),
('a1000000-0000-4000-a000-000000000002','system_admin'),
('a1000000-0000-4000-a000-000000000003','student'),
('a1000000-0000-4000-a000-000000000004','academic_admin');
insert into public.user_permissions values('a1000000-0000-4000-a000-000000000004','identity.manage');
create function private.reject_contextual(query text) returns void language plpgsql as $$
declare denied boolean:=false;
begin begin execute query; exception when insufficient_privilege or raise_exception then denied:=true; end;
if not denied then raise exception 'ASSERT: se permitió una escritura sin la verificación requerida'; end if;
end; $$;
grant execute on function private.reject_contextual(text) to authenticated;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-a000-000000000001","aal":"aal1"}',true) \gset
do $$ begin
 if (select count(*) from public.profiles)<>4 then raise exception 'ASSERT: administración no puede consultar cuentas con primer factor'; end if;
 if private.system_admin() then raise exception 'ASSERT: primer factor permitió escritura'; end if;
end $$;
select private.reject_contextual($q$select public.manage_account('a1000000-0000-4000-a000-000000000003','suspended')$q$);
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-a000-000000000001","aal":"aal2"}',true) \gset
select private.reject_contextual($q$select public.manage_account('a1000000-0000-4000-a000-000000000003','suspended')$q$);
select set_config('request.jwt.claims',jsonb_build_object('sub','a1000000-0000-4000-a000-000000000001','aal','aal2','amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',floor(extract(epoch from statement_timestamp()))-300)))::text,true) \gset
select private.reject_contextual($q$select public.manage_account('a1000000-0000-4000-a000-000000000003','suspended')$q$);
select set_config('request.jwt.claims',jsonb_build_object('sub','a1000000-0000-4000-a000-000000000001','aal','aal2','amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',floor(extract(epoch from statement_timestamp())))))::text,true) \gset
select public.manage_account('a1000000-0000-4000-a000-000000000003','suspended');
do $$ begin if not exists(select 1 from public.profiles where id='a1000000-0000-4000-a000-000000000003' and state='suspended') then raise exception 'ASSERT: escritura verificada no aplicada'; end if; end $$;
select public.manage_account('a1000000-0000-4000-a000-000000000003','active');
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-a000-000000000004","aal":"aal1"}',true) \gset
do $$ begin if (select count(*) from public.profiles)<>4 then raise exception 'ASSERT: permiso de consulta de identidad no conservado'; end if; end $$;
select private.reject_contextual($q$select public.correct_identity('a1000000-0000-4000-a000-000000000003','Cambio sin verificación',null,null)$q$);
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-a000-000000000003","aal":"aal1"}',true) \gset
do $$ begin if (select count(*) from public.profiles)<>1 then raise exception 'ASSERT: estudiante accede a perfiles ajenos'; end if; end $$;
select private.reject_contextual($q$select public.manage_account('a1000000-0000-4000-a000-000000000002','suspended')$q$);
-- Una marca de tiempo inválida/futura no debe convertir un token en una autorización reciente.
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-a000-000000000001","aal":"aal2","amr":[{"method":"totp","timestamp":"invalid"}]}',true) \gset
do $$ begin if private.system_admin() then raise exception 'ASSERT: fecha inválida aceptada'; end if; end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub','a1000000-0000-4000-a000-000000000001','aal','aal2','amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',floor(extract(epoch from statement_timestamp()))+300)))::text,true) \gset
do $$ begin if private.system_admin() then raise exception 'ASSERT: fecha futura aceptada'; end if; end $$;
reset role;
do $$ begin if (select count(*) from pg_catalog.pg_tables where schemaname='public' and rowsecurity)<>26 then raise exception 'ASSERT: se alteró RLS'; end if; end $$;
rollback;
