begin;
create or replace function private.inspect_avatar() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.avatar_path is not null then
 perform 1 from public.uploads where path=new.avatar_path and owner_id=new.id and inspection_state='verified' and mime_type in ('image/jpeg','image/png') for update;
 if not found then raise exception 'La foto requiere inspección'; end if;
 end if;
 return new;
end $$;
create or replace function public.discard_upload(p_upload uuid) returns void language plpgsql security definer set search_path='' as $$
declare u public.uploads;
begin
 perform private.require(private.active());
 select * into strict u from public.uploads where id=p_upload for update;
 perform private.require(u.owner_id=auth.uid() and u.version_id is null and u.inspection_state<>'inspecting');
 if exists(select 1 from public.profiles where avatar_path=u.path) then raise exception 'Foto de perfil en uso'; end if;
 update public.uploads set inspection_state='rejected' where id=u.id;
end $$;
commit;
