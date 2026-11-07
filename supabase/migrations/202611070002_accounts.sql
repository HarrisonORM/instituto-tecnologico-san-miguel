begin;
create function public.require_account_admin() returns void language plpgsql security definer set search_path='' as $$
begin perform private.require(private.system_admin()); end $$;
create function public.register_account(p_user uuid,p_name text,p_role text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.system_admin());
 if p_role not in ('student','teacher','academic_admin','system_admin') or length(trim(p_name))=0 or length(p_name)>200 then raise exception 'Datos no válidos'; end if;
 insert into public.profiles(id,full_name) values(p_user,p_name);
 insert into public.user_roles values(p_user,p_role);
 perform private.log_event('account.create','profiles',p_user::text);
end $$;
create function public.set_permission(p_user uuid,p_permission text,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.system_admin());
 if p_permission not in ('structure.manage','enrollment.manage','evaluation.manage','identity.manage','period.close') then raise exception 'Permiso inexistente'; end if;
 if p_enabled then insert into public.user_permissions values(p_user,p_permission) on conflict do nothing;
 else delete from public.user_permissions where user_id=p_user and permission=p_permission; end if;
 perform private.log_event('permission.change','profiles',p_user::text);
end $$;
create function public.mark_notification(p_notification uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.active());
 update public.notifications set read_at=now() where id=p_notification and user_id=auth.uid();
end $$;
revoke all on function public.require_account_admin(),public.register_account(uuid,text,text),public.set_permission(uuid,text,boolean),public.mark_notification(uuid) from public,anon;
grant execute on function public.require_account_admin(),public.register_account(uuid,text,text),public.set_permission(uuid,text,boolean),public.mark_notification(uuid) to authenticated;
commit;
