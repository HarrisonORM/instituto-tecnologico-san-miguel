begin;
alter table public.profiles add column seed_tag text;
alter table public.programs add column published boolean not null default false;
alter table public.programs add column description text not null default '';
alter table public.programs add column price_label text not null default 'Consultar información';
alter table public.uploads add column reserved_bytes bigint not null default 2000000;

create function private.inspect_avatar() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.avatar_path is not null and not exists(select 1 from public.uploads where path=new.avatar_path and owner_id=new.id and inspection_state='verified' and mime_type in ('image/jpeg','image/png')) then raise exception 'La foto requiere inspección'; end if;
 return new;
end $$;
create trigger avatar_inspection before insert or update of avatar_path on public.profiles for each row execute function private.inspect_avatar();

create table private.api_limits(user_id uuid not null, action text not null, window_at timestamptz not null, used integer not null, primary key(user_id,action,window_at));
create function public.consume_api_budget(p_action text) returns void language plpgsql security definer set search_path='' as $$
declare maximum integer; amount integer; window timestamptz:=date_trunc('minute',clock_timestamp());
begin
 perform private.require(private.active());
 maximum:=case p_action when 'read' then 120 when 'write' then 30 when 'file' then 15 when 'admin' then 10 else 0 end;
 if maximum=0 then raise exception 'Límite no definido'; end if;
 insert into private.api_limits values(auth.uid(),p_action,window,1) on conflict(user_id,action,window_at) do update set used=private.api_limits.used+1 returning used into amount;
 if amount>maximum then raise exception 'Demasiadas solicitudes' using errcode='P0429'; end if;
 delete from private.api_limits where user_id=auth.uid() and window_at<window-interval '1 hour';
end $$;

create function public.set_public_offer(p_program uuid,p_description text,p_price_label text,p_published boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.permitted('structure.manage'));
 if length(p_description)>10000 or length(p_price_label)>200 then raise exception 'Contenido demasiado largo'; end if;
 update public.programs set description=p_description,price_label=p_price_label,published=p_published where id=p_program;
 if not found then raise exception 'Carrera inexistente'; end if;
 perform private.log_event('offer.publish','programs',p_program::text);
end $$;
create function public.academic_offer() returns table(id uuid,name text,description text,price_label text) language sql stable security definer set search_path='' as $$
 select id,name,description,price_label from public.programs where published and archived_at is null order by name,id limit 50;
$$;
revoke all on function private.inspect_avatar() from public,anon,authenticated;
revoke all on function public.consume_api_budget(text),public.set_public_offer(uuid,text,text,boolean) from public,anon;
grant execute on function public.consume_api_budget(text),public.set_public_offer(uuid,text,text,boolean) to authenticated;
revoke all on function public.academic_offer() from public;
grant execute on function public.academic_offer() to anon,authenticated;
commit;
