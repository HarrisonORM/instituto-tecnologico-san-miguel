begin;
alter table public.uploads add column inspection_state text not null default 'reserved' check(inspection_state in ('reserved','inspecting','verified','rejected'));
alter table public.uploads add column inspected_at timestamptz;
alter table public.uploads add column sha256 text;
alter table public.uploads add column actual_bytes integer;
drop policy evidence_insert on storage.objects;
create policy evidence_insert on storage.objects for insert to authenticated with check(bucket_id='evidence' and private.active() and exists(select 1 from public.uploads u where u.path=name and u.owner_id=auth.uid() and u.version_id is null and u.inspection_state='reserved'));
drop policy evidence_delete_draft on storage.objects;
create policy evidence_delete_draft on storage.objects for delete to authenticated using(bucket_id='evidence' and private.active() and exists(select 1 from public.uploads u where u.path=name and u.owner_id=auth.uid() and u.version_id is null and u.inspection_state in ('reserved','rejected') and not exists(select 1 from public.profiles p where p.avatar_path=u.path)));
create function private.require_inspected_attachment() returns trigger language plpgsql set search_path='' as $$
begin
 if new.version_id is not null and (new.inspection_state<>'verified' or new.inspected_at is null) then raise exception 'El archivo requiere inspección antes de adjuntarse'; end if;
 return new;
end $$;
create trigger attachment_inspection before insert or update on public.uploads for each row execute function private.require_inspected_attachment();
create function public.begin_inspection(p_upload uuid,p_actor uuid) returns public.uploads language plpgsql security definer set search_path='' as $$
declare u public.uploads;
begin
 perform private.require(exists(select 1 from public.profiles where id=p_actor and state='active'));
 select * into strict u from public.uploads where id=p_upload for update;
 perform private.require(u.owner_id=p_actor and u.version_id is null and u.inspection_state in ('reserved','inspecting'));
 update public.uploads set inspection_state='inspecting' where id=u.id returning * into u;
 return u;
end $$;
create function public.finish_inspection(p_upload uuid,p_actor uuid,p_sha text,p_bytes integer) returns void language plpgsql security definer set search_path='' as $$
declare u public.uploads;
begin
 perform private.require(exists(select 1 from public.profiles where id=p_actor and state='active'));
 select * into strict u from public.uploads where id=p_upload for update;
 perform private.require(u.owner_id=p_actor and u.version_id is null and u.inspection_state='inspecting');
 if p_sha !~ '^[0-9a-f]{64}$' or p_bytes<=0 or p_bytes>u.bytes or not exists(select 1 from storage.objects where bucket_id='evidence' and name=u.path and (metadata->>'size')::bigint=p_bytes and metadata->>'mimetype'=u.mime_type) then raise exception 'Metadatos de archivo no válidos'; end if;
 update public.uploads set inspection_state='verified',inspected_at=now(),sha256=p_sha,actual_bytes=p_bytes where id=u.id;
end $$;
create function public.reject_inspection(p_upload uuid,p_actor uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.uploads set inspection_state='rejected' where id=p_upload and owner_id=p_actor and version_id is null and inspection_state='inspecting';
end $$;
create function public.discard_upload(p_upload uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.active());
 update public.uploads u set inspection_state='rejected' where u.id=p_upload and u.owner_id=auth.uid() and u.version_id is null and u.inspection_state<>'inspecting' and not exists(select 1 from public.profiles p where p.avatar_path=u.path);
 if not found then raise exception 'Archivo no descartable'; end if;
end $$;
revoke all on function private.require_inspected_attachment() from public,anon,authenticated;
revoke all on function public.begin_inspection(uuid,uuid),public.finish_inspection(uuid,uuid,text,integer),public.reject_inspection(uuid,uuid) from public,anon,authenticated;
grant execute on function public.begin_inspection(uuid,uuid),public.finish_inspection(uuid,uuid,text,integer),public.reject_inspection(uuid,uuid) to service_role;
revoke all on function public.discard_upload(uuid) from public,anon;
grant execute on function public.discard_upload(uuid) to authenticated;
commit;
