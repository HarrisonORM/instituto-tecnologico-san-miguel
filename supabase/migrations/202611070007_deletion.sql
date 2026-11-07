begin;
-- Auth puede borrarse conservando una marca local hasta finalizar y auditar.
alter table public.profiles drop constraint profiles_id_fkey;
alter table public.profiles add column auth_user_id uuid unique references auth.users(id) on delete set null;
update public.profiles set auth_user_id=id;
alter table public.profiles drop constraint profiles_state_check;
alter table public.profiles add constraint profiles_state_check check(state in ('active','suspended','archived','deleting'));
alter table public.deletion_requests drop constraint deletion_requests_state_check;
alter table public.deletion_requests add constraint deletion_requests_state_check check(state in ('requested','approved','cancelled','executing','complete'));
alter table public.deletion_requests add column completed_at timestamptz;
-- Los identificadores de auditoría sobreviven al perfil; nunca se elimina la auditoría.
alter table public.deletion_requests drop constraint deletion_requests_target_id_fkey;
alter table public.deletion_requests drop constraint deletion_requests_requested_by_fkey;
alter table public.deletion_requests drop constraint deletion_requests_approved_by_fkey;
alter table public.invitation_jobs drop constraint invitation_jobs_created_by_fkey;
alter table public.identity_requests drop constraint identity_requests_resolved_by_fkey;

create function private.link_auth_identity() returns trigger language plpgsql security definer set search_path='' as $$
begin new.auth_user_id:=new.id; return new; end $$;
create trigger profile_auth_link before insert on public.profiles for each row execute function private.link_auth_identity();

create function private.has_academic_history(u uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.enrollments where student_id=u)
 or exists(select 1 from public.teacher_groups where teacher_id=u)
 or exists(select 1 from public.submissions where student_id=u or graded_by=u)
 or exists(select 1 from public.tasks where author_id=u)
 or exists(select 1 from public.comments where author_id=u)
 or exists(select 1 from public.grade_history where actor_id=u)
 or exists(select 1 from public.final_results where student_id=u);
$$;

create function private.guard_frozen_reference() returns trigger language plpgsql security definer set search_path='' as $$
declare field text; value text; frozen text;
begin
 foreach field in array tg_argv loop
 value:=to_jsonb(new)->>field;
 if value is not null then
 select state into frozen from public.profiles where id=value::uuid for key share;
 if frozen='deleting' then raise exception 'Cuenta en eliminación; no admite nuevas relaciones'; end if;
 end if;
 end loop;
 return new;
end $$;
create trigger frozen_enrollment before insert or update on public.enrollments for each row execute function private.guard_frozen_reference('student_id');
create trigger frozen_teacher before insert or update on public.teacher_groups for each row execute function private.guard_frozen_reference('teacher_id');
create trigger frozen_submission before insert or update on public.submissions for each row execute function private.guard_frozen_reference('student_id','graded_by');
create trigger frozen_task before insert or update on public.tasks for each row execute function private.guard_frozen_reference('author_id');
create trigger frozen_comment before insert or update on public.comments for each row execute function private.guard_frozen_reference('author_id');
create trigger frozen_grade before insert or update on public.grade_history for each row execute function private.guard_frozen_reference('actor_id');
create trigger frozen_result before insert or update on public.final_results for each row execute function private.guard_frozen_reference('student_id');
create trigger frozen_role before insert or update on public.user_roles for each row execute function private.guard_frozen_reference('user_id');
create trigger frozen_permission before insert or update on public.user_permissions for each row execute function private.guard_frozen_reference('user_id');
create trigger frozen_upload before insert or update on public.uploads for each row execute function private.guard_frozen_reference('owner_id');
create trigger frozen_identity before insert or update on public.identity_requests for each row execute function private.guard_frozen_reference('user_id');
create trigger frozen_notification before insert or update on public.notifications for each row execute function private.guard_frozen_reference('user_id');

create function private.prevent_unfreeze() returns trigger language plpgsql set search_path='' as $$
begin
 if old.state='deleting' and new.state<>'deleting' then raise exception 'Eliminación en curso; requiere conciliación'; end if;
 return new;
end $$;
create trigger protect_deleting before update on public.profiles for each row execute function private.prevent_unfreeze();

create or replace function public.approve_deletion(p_request uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.system_admin());
 update public.deletion_requests set approved_by=auth.uid(),state='approved' where id=p_request and requested_by<>auth.uid() and target_id<>auth.uid() and state='requested';
 if not found then raise exception 'Requiere otro administrador ajeno a la cuenta afectada'; end if;
 perform private.log_event('deletion.approve','deletion_requests',p_request::text);
end $$;

create function public.begin_deletion(p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare r public.deletion_requests; target public.profiles;
begin
 perform private.require(private.system_admin());
 perform pg_advisory_xact_lock(771001);
 select * into strict r from public.deletion_requests where id=p_request for update;
 if r.state='complete' then return r.target_id; end if;
 perform private.require(r.target_id<>auth.uid() and r.requested_by<>r.approved_by and r.target_id<>r.approved_by and r.target_id<>r.requested_by);
 if r.state not in ('approved','executing') then raise exception 'Faltan dos autorizaciones'; end if;
 if (select count(distinct p.id) from public.profiles p join public.user_roles a on a.user_id=p.id where p.id in (r.requested_by,r.approved_by) and p.state='active' and a.role='system_admin')<>2 then raise exception 'Las autorizaciones ya no están vigentes'; end if;
 select * into strict target from public.profiles where id=r.target_id for update;
 if private.has_academic_history(target.id) then raise exception 'Cuenta con historial: corresponde archivado'; end if;
 if exists(select 1 from public.uploads where owner_id=target.id) or exists(select 1 from storage.objects where owner_id::text=target.id::text) then raise exception 'Primero conciliar los archivos de la cuenta'; end if;
 if exists(select 1 from public.user_roles where user_id=target.id and role='system_admin') and (select count(*) from public.user_roles a join public.profiles p on p.id=a.user_id where a.role='system_admin' and p.state='active')<=1 then raise exception 'Último administrador protegido'; end if;
 update public.profiles set state='deleting' where id=target.id;
 update public.deletion_requests set state='executing' where id=r.id;
 perform private.log_event('deletion.begin','profiles',target.id::text);
 return target.id;
end $$;

create function public.finish_deletion(p_request uuid) returns void language plpgsql security definer set search_path='' as $$
declare r public.deletion_requests; target public.profiles;
begin
 perform private.require(private.system_admin());
 perform pg_advisory_xact_lock(771001);
 select * into strict r from public.deletion_requests where id=p_request for update;
 if r.state='complete' then return; end if;
 perform private.require(r.state='executing');
 select * into strict target from public.profiles where id=r.target_id for update;
 perform private.require(target.state='deleting' and target.auth_user_id is null);
 if private.has_academic_history(target.id) then raise exception 'Historial detectado: conservar marca de conciliación'; end if;
 delete from public.user_permissions where user_id=target.id;
 delete from public.user_roles where user_id=target.id;
 delete from public.notifications where user_id=target.id;
 delete from public.identity_requests where user_id=target.id;
 update public.invitation_jobs set email='[eliminado]',full_name='[eliminado]' where auth_user_id=target.id;
 delete from public.profiles where id=target.id;
 update public.deletion_requests set state='complete',completed_at=now() where id=r.id;
 perform private.log_event('deletion.complete','profiles',target.id::text);
end $$;
revoke all on function private.link_auth_identity(),private.has_academic_history(uuid),private.guard_frozen_reference(),private.prevent_unfreeze() from public,anon,authenticated;
revoke all on function public.begin_deletion(uuid),public.finish_deletion(uuid) from public,anon;
grant execute on function public.begin_deletion(uuid),public.finish_deletion(uuid) to authenticated;
commit;
