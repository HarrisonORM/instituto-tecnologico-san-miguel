-- Aplicar después de 021. Permisos académicos por rol y guardado conjunto.
begin;
set local lock_timeout='10s';
set local statement_timeout='60s';

-- Revocar asignaciones antiguas que no tenían efecto por carecer del rol académico.
-- Se conservan cuentas, historial y auditoría; la revocación queda registrada.
insert into public.audit_events(actor_id,action,entity,resource_id)
select distinct null::uuid,'permission.remove_ineligible','profiles',p.user_id::text
from public.user_permissions p
where not exists(select 1 from public.user_roles r where r.user_id=p.user_id and r.role='academic_admin');
delete from public.user_permissions p
where not exists(select 1 from public.user_roles r where r.user_id=p.user_id and r.role='academic_admin');

create function private.guard_permission_role() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform private.require(exists(select 1 from public.user_roles where user_id=new.user_id and role='academic_admin'));
 return new;
end $$;
create trigger permission_role before insert or update on public.user_permissions
for each row execute function private.guard_permission_role();

create function private.remove_academic_permissions() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.role='academic_admin' and not exists(select 1 from public.user_roles where user_id=old.user_id and role='academic_admin') then
   delete from public.user_permissions where user_id=old.user_id;
   perform private.log_event('permission.clear_on_role_removal','profiles',old.user_id::text);
 end if;
 return old;
end $$;
create trigger academic_role_permissions after delete on public.user_roles
for each row execute function private.remove_academic_permissions();

create function public.set_permissions(p_user uuid,p_permissions text[],p_expected text[]) returns void language plpgsql security definer set search_path='' as $$
declare current_permissions text[]; expected_permissions text[]; target_state text;
 allowed text[]:=array['structure.manage','enrollment.manage','evaluation.manage','period.close','identity.manage','contact.manage'];
begin
 perform private.require(private.system_admin());
 perform pg_advisory_xact_lock(771001);
 select state into strict target_state from public.profiles where id=p_user for update;
 perform private.require(target_state<>'deleting' and exists(select 1 from public.user_roles where user_id=p_user and role='academic_admin'));
 if p_permissions is null or p_expected is null or cardinality(p_permissions)>6 or cardinality(p_expected)>6
 or array_position(p_permissions,null) is not null or array_position(p_expected,null) is not null
 or exists(select 1 from unnest(p_permissions||p_expected) value where not value=any(allowed))
 or cardinality(p_permissions)<>(select count(distinct value) from unnest(p_permissions) value)
 or cardinality(p_expected)<>(select count(distinct value) from unnest(p_expected) value) then
   raise exception 'Selección de permisos no válida';
 end if;
 select coalesce(array_agg(permission order by permission),'{}'::text[]) into current_permissions from public.user_permissions where user_id=p_user;
 select coalesce(array_agg(value order by value),'{}'::text[]) into expected_permissions from unnest(p_expected) value;
 if current_permissions is distinct from expected_permissions then raise exception 'Los permisos cambiaron. Actualiza antes de guardar.'; end if;
 delete from public.user_permissions where user_id=p_user and not permission=any(p_permissions);
 insert into public.user_permissions(user_id,permission) select p_user,value from unnest(p_permissions) value on conflict do nothing;
 perform private.log_event('permissions.replace','profiles',p_user::text);
end $$;

-- Conservar la RPC anterior para clientes antiguos sin permitir concesiones a estudiantes/docentes.
create or replace function public.set_permission(p_user uuid,p_permission text,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
declare current_permissions text[]; desired text[];
begin
 perform private.require(private.system_admin());
 perform pg_advisory_xact_lock(771001);
 if p_enabled is null or p_permission is null or p_permission not in ('structure.manage','enrollment.manage','evaluation.manage','period.close','identity.manage','contact.manage') then raise exception 'Permiso no válido'; end if;
 select coalesce(array_agg(permission order by permission),'{}'::text[]) into current_permissions from public.user_permissions where user_id=p_user;
 if p_enabled then select array_agg(distinct value) into desired from unnest(current_permissions||array[p_permission]) value;
 else desired:=array_remove(current_permissions,p_permission); end if;
 perform public.set_permissions(p_user,desired,current_permissions);
end $$;

revoke all on function private.guard_permission_role(),private.remove_academic_permissions() from public,anon,authenticated;
revoke all on function public.set_permissions(uuid,text[],text[]) from public,anon;
grant execute on function public.set_permissions(uuid,text[],text[]) to authenticated;
commit;
