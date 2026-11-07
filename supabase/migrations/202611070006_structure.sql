begin;
alter table public.programs add column archived_at timestamptz;
alter table public.subjects add column archived_at timestamptz;
alter table public.groups add column archived_at timestamptz;

create function public.edit_structure(p_kind text,p_id uuid,p_data jsonb) returns void language plpgsql security definer set search_path='' as $$
declare period uuid;
begin
 perform private.require(private.permitted('structure.manage'));
 if jsonb_typeof(p_data)<>'object' or exists(select 1 from jsonb_object_keys(p_data) k where k not in ('name','starts_on','ends_on')) then raise exception 'Campos no admitidos'; end if;
 case p_kind
 when 'program' then update public.programs set name=coalesce(p_data->>'name',name) where id=p_id;
 when 'subject' then update public.subjects set name=coalesce(p_data->>'name',name) where id=p_id;
 when 'group' then
 select period_id into strict period from public.groups where id=p_id;
 perform private.lock_period(period);
 update public.groups set name=coalesce(p_data->>'name',name) where id=p_id;
 when 'period' then
 perform private.lock_period(p_id);
 if exists(select 1 from public.groups where period_id=p_id) and (p_data ? 'starts_on' or p_data ? 'ends_on') then raise exception 'Cambiar fechas con grupos requiere política académica'; end if;
 update public.periods set name=coalesce(p_data->>'name',name),starts_on=coalesce((p_data->>'starts_on')::date,starts_on),ends_on=coalesce((p_data->>'ends_on')::date,ends_on) where id=p_id;
 else raise exception 'Tipo no admitido'; end case;
 if not found then raise exception 'Recurso inexistente'; end if;
 perform private.log_event('structure.edit',p_kind,p_id::text);
end $$;

create function public.retire_structure(p_kind text,p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare period uuid;
begin
 perform private.require(private.permitted('structure.manage'));
 case p_kind
 when 'program' then
 if exists(select 1 from public.subjects where program_id=p_id and archived_at is null) then raise exception 'Retirar primero sus materias'; end if;
 update public.programs set archived_at=now() where id=p_id;
 when 'subject' then
 if exists(select 1 from public.groups where subject_id=p_id and archived_at is null) then raise exception 'Retirar primero sus grupos'; end if;
 update public.subjects set archived_at=now() where id=p_id;
 when 'group' then
 select period_id into strict period from public.groups where id=p_id;
 perform private.lock_period(period);
 update public.groups set archived_at=now() where id=p_id;
 else raise exception 'Tipo no admitido'; end case;
 if not found then raise exception 'Recurso inexistente'; end if;
 perform private.log_event('structure.retire',p_kind,p_id::text);
end $$;

create function public.remove_assignment(p_group uuid,p_user uuid,p_kind text) returns void language plpgsql security definer set search_path='' as $$
declare period uuid;
begin
 perform private.require(private.permitted('enrollment.manage'));
 select period_id into strict period from public.groups where id=p_group;
 perform private.lock_period(period);
 if p_kind='enrollment' then
 if exists(select 1 from public.submissions s join public.tasks t on t.id=s.task_id where t.group_id=p_group and s.student_id=p_user) then raise exception 'Matrícula con historial: requiere procedimiento de retiro académico'; end if;
 delete from public.enrollments where group_id=p_group and student_id=p_user;
 elsif p_kind='teacher_assignment' then
 if exists(select 1 from public.tasks where group_id=p_group) then raise exception 'Reasignación con actividades requiere política de continuidad'; end if;
 delete from public.teacher_groups where group_id=p_group and teacher_id=p_user;
 else raise exception 'Tipo no admitido'; end if;
 perform private.log_event('assignment.remove',p_kind,p_group::text);
end $$;

create function public.cancel_deletion(p_request uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.system_admin());
 update public.deletion_requests set state='cancelled' where id=p_request and state in ('requested','approved');
 if not found then raise exception 'Solicitud no cancelable'; end if;
 perform private.log_event('deletion.cancel','deletion_requests',p_request::text);
end $$;

create function public.notification_count() returns bigint language sql stable security definer set search_path='' as $$
 select count(*) from public.notifications where user_id=auth.uid() and private.active() and read_at is null;
$$;
revoke all on function public.edit_structure(text,uuid,jsonb),public.retire_structure(text,uuid),public.remove_assignment(uuid,uuid,text),public.cancel_deletion(uuid),public.notification_count() from public,anon;
grant execute on function public.edit_structure(text,uuid,jsonb),public.retire_structure(text,uuid),public.remove_assignment(uuid,uuid,text),public.cancel_deletion(uuid),public.notification_count() to authenticated;
commit;
