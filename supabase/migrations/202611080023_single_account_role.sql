-- Aplicar después de 022. Resolver previamente cuentas con roles duplicados.
-- No elige roles ni elimina historial para resolver conflictos antiguos.
begin;
set local lock_timeout='10s';
set local statement_timeout='60s';
select pg_advisory_xact_lock(771001);
lock table public.user_roles in share row exclusive mode;
do $$ begin
 if exists(select 1 from public.user_roles group by user_id having count(*)>1) then
   raise exception 'Hay cuentas con más de un rol. Selecciona cuál conservar en cada cuenta antes de aplicar 023.';
 end if;
end $$;
alter table public.user_roles add constraint user_roles_one_per_user unique(user_id);

create function public.assign_account_role(p_user uuid,p_role text,p_expected text[]) returns void
language plpgsql security definer set search_path='' as $$
declare current_roles text[]; expected_roles text[]; target_state text;
begin
 perform private.require(private.system_admin() and p_user<>auth.uid());
 perform pg_advisory_xact_lock(771001);
 if p_role is null or p_role not in ('student','teacher','academic_admin','system_admin')
 or p_expected is null or cardinality(p_expected)>1 or array_position(p_expected,null) is not null then
   raise exception 'Selección de rol no válida';
 end if;
 select state into strict target_state from public.profiles where id=p_user for update;
 perform private.require(target_state<>'deleting');
 select coalesce(array_agg(role order by role),'{}'::text[]) into current_roles from public.user_roles where user_id=p_user;
 select coalesce(array_agg(value order by value),'{}'::text[]) into expected_roles from unnest(p_expected) value;
 if current_roles is distinct from expected_roles then raise exception 'El rol cambió. Actualiza antes de guardar.'; end if;
 if current_roles=array[p_role] then return; end if;
 if target_state='active' and 'system_admin'=any(current_roles) and p_role<>'system_admin'
 and (select count(*) from public.user_roles r join public.profiles p on p.id=r.user_id where r.role='system_admin' and p.state='active')<=1 then
   raise exception 'No se puede cambiar el rol del último administrador activo';
 end if;
 -- Sustitución atómica: nunca añadir un segundo rol ni borrar el historial académico.
 -- El trigger de 022 retira permisos si se deja de ser administrativo académico.
 delete from public.user_roles where user_id=p_user;
 insert into public.user_roles(user_id,role) values(p_user,p_role);
 perform private.log_event('role.replace.'||p_role,'profiles',p_user::text);
end $$;

-- Un cliente antiguo tampoco puede añadir un segundo rol o dejar la cuenta sin rol.
create or replace function public.set_role(p_user uuid,p_role text,p_enabled boolean) returns void
language plpgsql security definer set search_path='' as $$
declare expected_roles text[];
begin
 perform private.require(private.system_admin() and p_user<>auth.uid());
 perform pg_advisory_xact_lock(771001);
 if p_enabled is distinct from true then raise exception 'La cuenta debe conservar un rol. Selecciona el nuevo rol para sustituir el anterior.'; end if;
 select coalesce(array_agg(role order by role),'{}'::text[]) into expected_roles from public.user_roles where user_id=p_user;
 perform public.assign_account_role(p_user,p_role,expected_roles);
end $$;
revoke all on function public.assign_account_role(uuid,text,text[]) from public,anon;
grant execute on function public.assign_account_role(uuid,text,text[]) to authenticated;
commit;
