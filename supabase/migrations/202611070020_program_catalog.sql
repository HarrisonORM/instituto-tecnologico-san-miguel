-- Ampliación del catálogo solicitado. Mantiene el canal privado y sus cuotas.
begin;
alter table public.contact_inquiries drop constraint contact_inquiries_program_check;
alter table public.contact_inquiries add constraint contact_inquiries_program_check
 check(program in ('software','redes','auxiliar-contable','auxiliar-administrativo','equipos-biomedicos'));
create or replace function public.submit_contact(p_name text,p_email text,p_program text,p_message text,p_fingerprint text) returns void
language plpgsql security definer set search_path='' as $$
declare daily integer; hourly integer;
begin
 if p_name is null or length(trim(p_name)) not between 1 and 120 or p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or p_program is null or p_program not in ('software','redes','auxiliar-contable','auxiliar-administrativo','equipos-biomedicos') or p_message is null or length(trim(p_message)) not between 10 and 2000 or p_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'Datos no válidos'; end if;
 perform pg_advisory_xact_lock(771017);
 delete from private.contact_limits where window_at<now()-interval '48 hours';
 insert into private.contact_limits values('global',date_trunc('day',now()),1) on conflict(scope,window_at) do update set used=private.contact_limits.used+1 returning used into daily;
 insert into private.contact_limits values(p_fingerprint,date_trunc('hour',now()),1) on conflict(scope,window_at) do update set used=private.contact_limits.used+1 returning used into hourly;
 if daily>60 or hourly>3 then raise exception 'Demasiadas solicitudes' using errcode='P0429'; end if;
 insert into public.contact_inquiries(name,email,program,message) values(trim(p_name),lower(trim(p_email)),p_program,trim(p_message));
end $$;
commit;
