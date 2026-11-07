begin;
create or replace function public.reserve_upload(p_bytes integer,p_mime text) returns public.uploads language plpgsql security definer set search_path='' as $$
declare b private.storage_budget; result public.uploads; identifier uuid:=gen_random_uuid();
begin
 perform private.require(private.active());
 select * into b from private.storage_budget where singleton for update;
 if p_bytes<=0 or p_bytes>b.max_file_bytes or b.reserved_bytes+b.max_file_bytes>b.max_bytes then raise exception 'Presupuesto de archivos agotado o tamaño no permitido'; end if;
 insert into public.uploads(id,owner_id,path,mime_type,bytes,reserved_bytes) values(identifier,auth.uid(),auth.uid()::text||'/'||identifier::text,p_mime,p_bytes,b.max_file_bytes) returning * into result;
 update private.storage_budget set reserved_bytes=reserved_bytes+b.max_file_bytes where singleton;
 return result;
end $$;
create or replace function public.release_upload(p_upload uuid) returns void language plpgsql security definer set search_path='' as $$
declare u public.uploads; b private.storage_budget;
begin
 perform private.require(private.active());
 select * into b from private.storage_budget where singleton for update;
 select * into strict u from public.uploads where id=p_upload for update;
 perform private.require(u.owner_id=auth.uid() and u.version_id is null and u.inspection_state<>'inspecting');
 if exists(select 1 from storage.objects where bucket_id='evidence' and name=u.path) or exists(select 1 from public.profiles where avatar_path=u.path) then raise exception 'Primero retirar el archivo no vinculado'; end if;
 delete from public.uploads where id=u.id;
 update private.storage_budget set reserved_bytes=greatest(0,reserved_bytes-u.reserved_bytes) where singleton;
end $$;
create function public.reconcile_storage_budget() returns jsonb language plpgsql security definer set search_path='' as $$
declare reserved bigint; untracked bigint;
begin
 perform private.require(private.system_admin());
 perform 1 from private.storage_budget where singleton for update;
 select coalesce(sum(reserved_bytes),0) into reserved from public.uploads;
 select coalesce(sum((o.metadata->>'size')::bigint),0) into untracked from storage.objects o where o.bucket_id='evidence' and not exists(select 1 from public.uploads u where u.path=o.name);
 update private.storage_budget set reserved_bytes=reserved+untracked where singleton;
 perform private.log_event('storage.reconcile','storage_budget','singleton');
 return jsonb_build_object('reserved',reserved,'untracked',untracked,'total',reserved+untracked);
end $$;
create function public.operational_snapshot() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare b private.storage_budget;
begin
 perform private.require(private.system_admin());
 select * into b from private.storage_budget where singleton;
 return jsonb_build_object('database_bytes',pg_database_size(current_database()),'reserved_storage_bytes',b.reserved_bytes,'storage_budget_bytes',b.max_bytes,
 'pending_uploads',(select count(*) from public.uploads where version_id is null),'pending_inspections',(select count(*) from public.uploads where inspection_state='inspecting'),
 'pending_invitations',(select count(*) from public.invitation_jobs where status='dispatching'),'pending_deletions',(select count(*) from public.deletion_requests where state='executing'));
end $$;
revoke all on function public.reconcile_storage_budget(),public.operational_snapshot() from public,anon;
grant execute on function public.reconcile_storage_budget(),public.operational_snapshot() to authenticated;
commit;
