-- Canal privado de contacto. Pendiente de aplicar y validar en Supabase.
begin;
create table public.contact_inquiries (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 120),
 email text not null check(length(email)<=254), program text not null check(program in ('software','redes')),
 message text not null check(length(message) between 10 and 2000), consent_at timestamptz not null default now(),
 created_at timestamptz not null default now(), status text not null default 'new' check(status in ('new','reviewed'))
);
alter table public.contact_inquiries enable row level security;
revoke all on public.contact_inquiries from anon,authenticated;
grant select on public.contact_inquiries to authenticated;
create policy contact_read on public.contact_inquiries for select to authenticated using(private.permitted('contact.manage'));
create table private.contact_limits (scope text not null, window_at timestamptz not null, used integer not null, primary key(scope,window_at));
revoke all on private.contact_limits from public,anon,authenticated;
create function public.submit_contact(p_name text,p_email text,p_program text,p_message text,p_fingerprint text) returns void
language plpgsql security definer set search_path='' as $$
declare daily integer; hourly integer;
begin
 if p_name is null or length(trim(p_name)) not between 1 and 120 or p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or p_program not in ('software','redes') or p_message is null or length(trim(p_message)) not between 10 and 2000 or p_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'Datos no válidos'; end if;
 perform pg_advisory_xact_lock(771017);
 delete from private.contact_limits where window_at<now()-interval '48 hours';
 insert into private.contact_limits values('global',date_trunc('day',now()),1) on conflict(scope,window_at) do update set used=private.contact_limits.used+1 returning used into daily;
 insert into private.contact_limits values(p_fingerprint,date_trunc('hour',now()),1) on conflict(scope,window_at) do update set used=private.contact_limits.used+1 returning used into hourly;
 if daily>60 or hourly>3 then raise exception 'Demasiadas solicitudes' using errcode='P0429'; end if;
 insert into public.contact_inquiries(name,email,program,message) values(trim(p_name),lower(trim(p_email)),p_program,trim(p_message));
end $$;
revoke all on function public.submit_contact(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_contact(text,text,text,text,text) to service_role;

create or replace function public.set_permission(p_user uuid,p_permission text,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.system_admin());
 if p_permission not in ('structure.manage','enrollment.manage','evaluation.manage','identity.manage','period.close','contact.manage') then raise exception 'Permiso inexistente'; end if;
 if p_enabled then insert into public.user_permissions values(p_user,p_permission) on conflict do nothing;
 else delete from public.user_permissions where user_id=p_user and permission=p_permission; end if;
 perform private.log_event('permission.change','profiles',p_user::text);
end $$;
commit;
