begin;
create table public.invitation_jobs(
 id uuid primary key, created_by uuid not null references public.profiles,
 email text not null, full_name text not null, role text not null,
 status text not null default 'dispatching' check(status in ('dispatching','complete')),
 auth_user_id uuid, created_at timestamptz not null default now()
);
alter table public.invitation_jobs enable row level security;
revoke all on public.invitation_jobs from anon,authenticated;
grant select on public.invitation_jobs to authenticated;
create policy invitation_jobs_read on public.invitation_jobs for select to authenticated using(private.system_admin());
create function public.prepare_invitation(p_key uuid,p_email text,p_name text,p_role text) returns public.invitation_jobs language plpgsql security definer set search_path='' as $$
declare job public.invitation_jobs;
begin
 perform private.require(private.system_admin());
 if p_role not in ('student','teacher','academic_admin','system_admin') then raise exception 'Rol no válido'; end if;
 insert into public.invitation_jobs(id,created_by,email,full_name,role) values(p_key,auth.uid(),p_email,p_name,p_role) on conflict(id) do nothing returning * into job;
 if not found then
 select * into strict job from public.invitation_jobs where id=p_key;
 perform private.require(job.created_by=auth.uid() and job.email=p_email and job.full_name=p_name and job.role=p_role);
 raise exception 'Solicitud ya registrada; consultar su estado antes de reenviar';
 end if;
 perform private.log_event('invitation.prepare','invitation_jobs',job.id::text);
 return job;
end $$;
create function public.finish_invitation(p_key uuid,p_auth_user uuid) returns void language plpgsql security definer set search_path='' as $$
declare job public.invitation_jobs;
begin
 perform private.require(private.system_admin());
 select * into strict job from public.invitation_jobs where id=p_key for update;
 perform private.require(job.created_by=auth.uid() and job.status='dispatching');
 perform public.register_account(p_auth_user,job.full_name,job.role);
 update public.invitation_jobs set auth_user_id=p_auth_user,status='complete' where id=p_key;
end $$;
revoke all on function public.prepare_invitation(uuid,text,text,text),public.finish_invitation(uuid,uuid) from public,anon;
grant execute on function public.prepare_invitation(uuid,text,text,text),public.finish_invitation(uuid,uuid) to authenticated;
commit;
