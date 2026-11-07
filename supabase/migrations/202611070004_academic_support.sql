begin;
alter table public.profiles add column program_id uuid references public.programs;
create table public.identity_requests(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles,
 proposed jsonb not null, reason text not null check(length(reason) between 1 and 2000),
 status text not null default 'pending' check(status in ('pending','resolved','rejected')),
 resolved_by uuid references public.profiles, created_at timestamptz not null default now()
);
alter table public.identity_requests enable row level security;
revoke all on public.identity_requests from anon,authenticated;
grant select on public.identity_requests to authenticated;
create policy identity_requests_read on public.identity_requests for select to authenticated using(private.active() and (user_id=auth.uid() or private.permitted('identity.manage')));
create function public.request_identity_change(p_proposed jsonb,p_reason text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require(private.active());
 if jsonb_typeof(p_proposed)<>'object' or exists(select 1 from jsonb_object_keys(p_proposed) k where k not in ('full_name','document_number','birth_date')) then raise exception 'Campos no admitidos'; end if;
 insert into public.identity_requests(user_id,proposed,reason) values(auth.uid(),p_proposed,p_reason) returning id into result;
 return result;
end $$;
create function public.resolve_identity_request(p_request uuid,p_accept boolean) returns void language plpgsql security definer set search_path='' as $$
declare r public.identity_requests;
begin
 perform private.require(private.permitted('identity.manage'));
 select * into strict r from public.identity_requests where id=p_request and status='pending' for update;
 if p_accept then
 update public.profiles set full_name=coalesce(r.proposed->>'full_name',full_name),document_number=coalesce(r.proposed->>'document_number',document_number),birth_date=coalesce((r.proposed->>'birth_date')::date,birth_date) where id=r.user_id;
 end if;
 update public.identity_requests set status=case when p_accept then 'resolved' else 'rejected' end,resolved_by=auth.uid() where id=r.id;
 perform private.log_event('identity.request.resolve','profiles',r.user_id::text);
end $$;
create function public.assign_program(p_user uuid,p_program uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.permitted('enrollment.manage'));
 update public.profiles set program_id=p_program where id=p_user;
 perform private.log_event('program.assign','profiles',p_user::text);
end $$;
create function public.set_role(p_user uuid,p_role text,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.system_admin() and p_user<>auth.uid());
 perform pg_advisory_xact_lock(771001);
 if p_role not in ('student','teacher','academic_admin','system_admin') then raise exception 'Rol no válido'; end if;
 if p_enabled then insert into public.user_roles values(p_user,p_role) on conflict do nothing;
 else
 if p_role='system_admin' and (select count(*) from public.user_roles r join public.profiles p on p.id=r.user_id where r.role='system_admin' and p.state='active')<=1 then raise exception 'Último administrador protegido'; end if;
 delete from public.user_roles where user_id=p_user and role=p_role;
 end if;
 perform private.log_event('role.change','profiles',p_user::text);
end $$;
create table public.calendar_events(
 id uuid primary key default gen_random_uuid(), period_id uuid not null references public.periods,
 title text not null, starts_at timestamptz not null, ends_at timestamptz not null,
 check(ends_at>=starts_at)
);
alter table public.calendar_events enable row level security;
revoke all on public.calendar_events from anon,authenticated;
grant select on public.calendar_events to authenticated;
create policy calendar_read on public.calendar_events for select to authenticated using(private.active());
create function public.add_calendar_event(p_period uuid,p_title text,p_start timestamptz,p_end timestamptz) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require(private.permitted('structure.manage')); perform private.lock_period(p_period);
 insert into public.calendar_events(period_id,title,starts_at,ends_at) values(p_period,p_title,p_start,p_end) returning id into result;
 return result;
end $$;
create table public.rubrics(
 task_id uuid primary key references public.tasks, criteria jsonb not null check(jsonb_typeof(criteria)='array')
);
alter table public.rubrics enable row level security;
revoke all on public.rubrics from anon,authenticated;
grant select on public.rubrics to authenticated;
create policy rubrics_read on public.rubrics for select to authenticated using(private.owns_task(task_id) or exists(select 1 from public.tasks t where t.id=rubrics.task_id and private.teaches(t.group_id)));
create function public.set_rubric(p_task uuid,p_criteria jsonb) returns void language plpgsql security definer set search_path='' as $$
declare g uuid; p uuid;
begin
 select t.group_id,x.period_id into g,p from public.tasks t join public.groups x on x.id=t.group_id where t.id=p_task;
 perform private.require(private.teaches(g)); perform private.lock_period(p);
 if exists(select 1 from public.submissions where task_id=p_task and current_version>0) then raise exception 'Rúbrica bloqueada tras entregas'; end if;
 insert into public.rubrics values(p_task,p_criteria) on conflict(task_id) do update set criteria=excluded.criteria;
end $$;
revoke all on function public.request_identity_change(jsonb,text),public.resolve_identity_request(uuid,boolean),public.assign_program(uuid,uuid),public.set_role(uuid,text,boolean),public.add_calendar_event(uuid,text,timestamptz,timestamptz),public.set_rubric(uuid,jsonb) from public,anon;
grant execute on function public.request_identity_change(jsonb,text),public.resolve_identity_request(uuid,boolean),public.assign_program(uuid,uuid),public.set_role(uuid,text,boolean),public.add_calendar_event(uuid,text,timestamptz,timestamptz),public.set_rubric(uuid,jsonb) to authenticated;
commit;
