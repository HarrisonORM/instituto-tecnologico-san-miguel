\set ON_ERROR_STOP on
do $$ begin
 if current_database()<>'itsm_test' then raise exception 'Base local requerida'; end if;
 if (select count(*) from public.user_roles where user_id='c2000000-0000-4000-a000-000000000001')<>2 then raise exception 'ASSERT: se eligió un rol automáticamente'; end if;
 if to_regprocedure('public.assign_account_role(uuid,text,text[])') is not null then raise exception 'ASSERT: 023 se aplicó parcialmente'; end if;
end $$;
-- Decisión explícita del escenario: conservar docente, sin tocar el perfil.
delete from public.user_roles where user_id='c2000000-0000-4000-a000-000000000001' and role='student';
