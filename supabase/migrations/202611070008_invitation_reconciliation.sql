begin;
create or replace function public.prepare_invitation(p_key uuid,p_email text,p_name text,p_role text) returns public.invitation_jobs language plpgsql security definer set search_path='' as $$
declare job public.invitation_jobs;
begin
 perform private.require(private.system_admin());
 if p_role not in ('student','teacher','academic_admin','system_admin') then raise exception 'Rol no válido'; end if;
 insert into public.invitation_jobs(id,created_by,email,full_name,role) values(p_key,auth.uid(),p_email,p_name,p_role) on conflict(id) do nothing returning * into job;
 if not found then
 select * into strict job from public.invitation_jobs where id=p_key;
 perform private.require(job.created_by=auth.uid() and job.email=p_email and job.full_name=p_name and job.role=p_role);
 if job.status<>'complete' then raise exception 'Solicitud pendiente: conciliar antes de reenviar'; end if;
 end if;
 return job;
end $$;
-- Consulta limitada a un trabajo autorizado: no se listan usuarios globales de Auth.
create function public.invitation_target(p_key uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare job public.invitation_jobs; result uuid;
begin
 perform private.require(private.system_admin());
 select * into strict job from public.invitation_jobs where id=p_key;
 select id into result from auth.users where lower(email)=lower(job.email);
 if result is null then raise exception 'No hay cuenta Auth que conciliar; no se reenvía automáticamente'; end if;
 return result;
end $$;
create function public.reconcile_invitation(p_key uuid,p_auth_user uuid) returns void language plpgsql security definer set search_path='' as $$
declare job public.invitation_jobs; email_address text;
begin
 perform private.require(private.system_admin());
 select * into strict job from public.invitation_jobs where id=p_key for update;
 if job.status='complete' then return; end if;
 select email into strict email_address from auth.users where id=p_auth_user;
 perform private.require(lower(email_address)=lower(job.email));
 -- No adoptar perfiles existentes ni elevar sus permisos por una invitación fallida.
 if exists(select 1 from public.profiles where id=p_auth_user) then raise exception 'Existe perfil: requiere revisión de identidad y roles'; end if;
 perform public.register_account(p_auth_user,job.full_name,job.role);
 update public.invitation_jobs set auth_user_id=p_auth_user,status='complete' where id=job.id;
 perform private.log_event('invitation.reconcile','invitation_jobs',job.id::text);
end $$;
revoke all on function public.invitation_target(uuid),public.reconcile_invitation(uuid,uuid) from public,anon;
grant execute on function public.invitation_target(uuid),public.reconcile_invitation(uuid,uuid) to authenticated;
commit;
