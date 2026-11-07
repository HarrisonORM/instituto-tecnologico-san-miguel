begin;
create policy evidence_delete_draft on storage.objects for delete to authenticated using(
 bucket_id='evidence' and private.active() and exists(
 select 1 from public.uploads u where u.path=name and u.owner_id=auth.uid() and u.version_id is null
 and not exists(select 1 from public.profiles p where p.avatar_path=u.path))
);
create function public.release_upload(p_upload uuid) returns void language plpgsql security definer set search_path='' as $$
declare u public.uploads; b private.storage_budget;
begin
 perform private.require(private.active());
 select * into b from private.storage_budget where singleton for update;
 select * into strict u from public.uploads where id=p_upload for update;
 perform private.require(u.owner_id=auth.uid() and u.version_id is null);
 if exists(select 1 from storage.objects where bucket_id='evidence' and name=u.path) or exists(select 1 from public.profiles where avatar_path=u.path) then raise exception 'Primero retirar el archivo no vinculado'; end if;
 delete from public.uploads where id=u.id;
 update private.storage_budget set reserved_bytes=reserved_bytes-b.max_file_bytes where singleton;
end $$;
revoke all on function public.release_upload(uuid) from public,anon;
grant execute on function public.release_upload(uuid) to authenticated;
commit;
