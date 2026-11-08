-- Verificación contextual: lecturas según rol y escrituras con TOTP reciente.
-- Aplicar después de las migraciones 001–020, antes de publicar el nuevo frontend.
-- No modifica factores Auth, cuentas ni historiales. No reduce la separación por rol.
begin;
set local lock_timeout='10s';
set local statement_timeout='60s';

create function private.read_system_admin() returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role('system_admin');
$$;
create function private.read_permitted(p text) returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role('academic_admin') and exists(select 1 from public.user_permissions where user_id=auth.uid() and permission=p);
$$;
create function private.recent_mfa() returns boolean language sql stable set search_path='' as $$
 select coalesce(auth.jwt()->>'aal','')='aal2' and exists(
   select 1 from jsonb_array_elements(case when jsonb_typeof(auth.jwt()->'amr')='array' then auth.jwt()->'amr' else '[]'::jsonb end) as entry
   where entry->>'method'='totp' and case when entry->>'timestamp' ~ '^[0-9]{1,12}$'
     then (entry->>'timestamp')::numeric between extract(epoch from statement_timestamp())-90 and extract(epoch from statement_timestamp())+5
     else false end
 );
$$;
create or replace function private.system_admin() returns boolean language sql stable security definer set search_path='' as $$
 select private.read_system_admin() and private.recent_mfa();
$$;
create or replace function private.permitted(p text) returns boolean language sql stable security definer set search_path='' as $$
 select private.read_permitted(p) and private.recent_mfa();
$$;
revoke all on function private.read_system_admin(),private.read_permitted(text),private.recent_mfa() from public,anon,authenticated;
grant execute on function private.read_system_admin(),private.read_permitted(text) to authenticated;

-- La API de cambio de contraseña comprueba también la frescura cuando hay MFA.
create function public.require_recent_verification() returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.active() and private.recent_mfa());
end;
$$;
revoke all on function public.require_recent_verification() from public,anon;
grant execute on function public.require_recent_verification() to authenticated;

-- Cambiar únicamente políticas SELECT que antes compartían el helper de escritura.
drop policy profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(private.active() and (id=auth.uid() or private.read_system_admin() or private.read_permitted('identity.manage')));
drop policy roles_read on public.user_roles;
create policy roles_read on public.user_roles for select to authenticated using(private.active() and (user_id=auth.uid() or private.read_system_admin()));
drop policy permissions_read on public.user_permissions;
create policy permissions_read on public.user_permissions for select to authenticated using(private.active() and (user_id=auth.uid() or private.read_system_admin()));
drop policy groups_read on public.groups;
create policy groups_read on public.groups for select to authenticated using(private.teaches(id) or private.enrolled(id) or private.read_permitted('structure.manage'));
drop policy teachers_read on public.teacher_groups;
create policy teachers_read on public.teacher_groups for select to authenticated using(private.active() and (teacher_id=auth.uid() or private.read_permitted('structure.manage')));
drop policy enrollments_read on public.enrollments;
create policy enrollments_read on public.enrollments for select to authenticated using(private.active() and (student_id=auth.uid() or private.teaches(group_id) or private.read_permitted('enrollment.manage')));
drop policy categories_read on public.categories;
create policy categories_read on public.categories for select to authenticated using(private.read_permitted('evaluation.manage') or exists(select 1 from public.groups g where g.subject_id=categories.subject_id and g.period_id=categories.period_id));
drop policy audit_read on public.audit_events;
create policy audit_read on public.audit_events for select to authenticated using(private.read_system_admin());
drop policy deletions_read on public.deletion_requests;
create policy deletions_read on public.deletion_requests for select to authenticated using(private.read_system_admin());
drop policy identity_requests_read on public.identity_requests;
create policy identity_requests_read on public.identity_requests for select to authenticated using(private.active() and (user_id=auth.uid() or private.read_permitted('identity.manage')));
drop policy invitation_jobs_read on public.invitation_jobs;
create policy invitation_jobs_read on public.invitation_jobs for select to authenticated using(private.read_system_admin());
drop policy contact_read on public.contact_inquiries;
create policy contact_read on public.contact_inquiries for select to authenticated using(private.read_permitted('contact.manage'));

-- Consultas RPC conservan el mismo alcance de lectura, sin exigir el código.
create or replace function public.group_roster(p_group uuid) returns table(student_id uuid,full_name text) language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.teaches(p_group) or private.read_permitted('enrollment.manage'));
 return query select p.id,p.full_name from public.enrollments e join public.profiles p on p.id=e.student_id where e.group_id=p_group order by p.full_name,p.id;
end $$;

create or replace function public.search_roster(p_group uuid,p_search text default '',p_limit integer default 25,p_offset integer default 0) returns table(student_id uuid,full_name text,total bigint) language plpgsql stable security definer set search_path='' as $$
begin
 perform private.require(private.teaches(p_group) or private.read_permitted('enrollment.manage'));
 if p_limit is null or p_offset is null or p_search is null or p_limit not between 1 and 100 or p_offset<0 or p_offset>1000000 or length(p_search)>200 then raise exception 'Filtro no válido'; end if;
 return query select p.id,p.full_name,count(*) over() from public.enrollments e join public.profiles p on p.id=e.student_id where e.group_id=p_group and position(lower(p_search) in lower(p.full_name))>0 order by p.full_name,p.id limit p_limit offset p_offset;
end $$;

create or replace function public.dashboard_counts(p_mode text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if p_mode='student' then
 perform private.require(private.has_role('student'));
 select jsonb_build_object('assigned',count(*),'not_submitted',count(*) filter(where s.current_version=0),'awaiting_review',count(*) filter(where s.current_version>0 and s.grade is null),'graded',count(*) filter(where s.grade is not null)) into result
 from public.submissions s join public.tasks t on t.id=s.task_id join public.groups g on g.id=t.group_id join public.periods p on p.id=g.period_id where s.student_id=auth.uid() and p.closed_at is null;
 elsif p_mode='teacher' then
 perform private.require(private.has_role('teacher'));
 select jsonb_build_object('groups',count(distinct g.id),'tasks',count(distinct t.id),'awaiting_review',count(s.id) filter(where s.current_version>0 and s.grade is null)) into result from public.teacher_groups a join public.groups g on g.id=a.group_id join public.periods p on p.id=g.period_id left join public.tasks t on t.group_id=g.id left join public.submissions s on s.task_id=t.id where a.teacher_id=auth.uid() and p.closed_at is null;
 elsif p_mode='system_admin' then
 perform private.require(private.read_system_admin());
 select jsonb_build_object('active',count(*) filter(where state='active'),'suspended',count(*) filter(where state='suspended'),'archived',count(*) filter(where state='archived'),'deleting',count(*) filter(where state='deleting')) into result from public.profiles;
 elsif p_mode='academic_admin' then
 perform private.require(private.read_permitted('structure.manage'));
 select jsonb_build_object('programs',(select count(*) from public.programs where archived_at is null),'groups',(select count(*) from public.groups where archived_at is null),'open_periods',(select count(*) from public.periods where closed_at is null)) into result;
 else raise exception 'Panel no admitido'; end if;
 return result;
end $$;

create or replace function public.operational_snapshot() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare b private.storage_budget;
begin
 perform private.require(private.read_system_admin());
 select * into b from private.storage_budget where singleton;
 return jsonb_build_object('database_bytes',pg_database_size(current_database()),'reserved_storage_bytes',b.reserved_bytes,'storage_budget_bytes',b.max_bytes,
 'pending_uploads',(select count(*) from public.uploads where version_id is null),'pending_inspections',(select count(*) from public.uploads where inspection_state='inspecting'),
 'pending_invitations',(select count(*) from public.invitation_jobs where status='dispatching'),'pending_deletions',(select count(*) from public.deletion_requests where state='executing'));
end $$;

create or replace function private.translation_source(p_kind text,p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare fingerprint text; readable boolean:=false; writable boolean:=false;
begin
 if not private.active() then return null; end if;
 case p_kind
 when 'task' then select md5(t.title||chr(31)||t.description),private.teaches(t.group_id) or private.owns_task(t.id),t.author_id=auth.uid() and private.teaches(t.group_id) into fingerprint,readable,writable from public.tasks t where t.id=p_id;
 when 'comment' then select md5(c.body),private.can_submission(c.submission_id),c.author_id=auth.uid() and private.can_submission(c.submission_id) into fingerprint,readable,writable from public.comments c where c.id=p_id;
 when 'program' then select md5(p.name),true,private.permitted('structure.manage') into fingerprint,readable,writable from public.programs p where p.id=p_id;
 when 'subject' then select md5(s.name),true,private.permitted('structure.manage') into fingerprint,readable,writable from public.subjects s where s.id=p_id;
 when 'category' then select md5(c.name),private.read_permitted('evaluation.manage') or exists(select 1 from public.groups g where g.subject_id=c.subject_id and g.period_id=c.period_id and (private.teaches(g.id) or private.enrolled(g.id))),private.permitted('evaluation.manage') into fingerprint,readable,writable from public.categories c where c.id=p_id;
 else return null;
 end case;
 if readable is not true or fingerprint is null then return null; end if;
 return jsonb_build_object('fingerprint',fingerprint,'write',writable);
end $$;

commit;
