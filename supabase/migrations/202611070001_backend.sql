-- Pendiente de aplicar y validar. No ejecutar automáticamente durante el desarrollo.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id), full_name text not null,
 document_number text unique, birth_date date, address text not null default '',
 avatar_path text, state text not null default 'active' check(state in ('active','suspended','archived')),
 created_at timestamptz not null default now()
);
create table public.user_roles (
 user_id uuid references public.profiles(id), role text check(role in ('student','teacher','academic_admin','system_admin')),
 primary key(user_id,role)
);
create table public.user_permissions (
 user_id uuid references public.profiles(id), permission text not null,
 primary key(user_id,permission)
);
create table public.programs(id uuid primary key default gen_random_uuid(), name text not null unique);
create table public.periods(
 id uuid primary key default gen_random_uuid(), name text not null unique,
 starts_on date not null, ends_on date not null, closed_at timestamptz,
 check(ends_on >= starts_on)
);
create table public.subjects(id uuid primary key default gen_random_uuid(), program_id uuid not null references public.programs, name text not null);
create table public.groups(
 id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects,
 period_id uuid not null references public.periods, name text not null,
 unique(subject_id,period_id,name)
);
create table public.teacher_groups(teacher_id uuid references public.profiles, group_id uuid references public.groups, primary key(teacher_id,group_id));
create table public.enrollments(student_id uuid references public.profiles, group_id uuid references public.groups, primary key(student_id,group_id));
create table public.categories(
 id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects,
 period_id uuid not null references public.periods, name text not null,
 weight numeric(5,2) not null check(weight > 0 and weight <= 100), unique(subject_id,period_id,name)
);
create table public.tasks(
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups,
 category_id uuid not null references public.categories, author_id uuid not null references public.profiles,
 title text not null check(length(title) between 1 and 200), description text not null default '',
 due_at timestamptz not null, created_at timestamptz not null default now()
);
create table public.submissions(
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks,
 student_id uuid not null references public.profiles, current_version integer not null default 0,
 replacement_allowed boolean not null default false,
 grade numeric check(grade between 0 and 5), graded_by uuid references public.profiles,
 graded_at timestamptz, unique(task_id,student_id)
);
create table public.submission_versions(
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.submissions,
 version integer not null check(version > 0), body text not null default '',
 submitted_at timestamptz not null default now(), late boolean not null,
 unique(submission_id,version)
);
create table public.comments(
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.submissions,
 author_id uuid not null references public.profiles, body text not null check(length(body) between 1 and 10000),
 created_at timestamptz not null default now()
);
create table public.grade_history(
 id bigint generated always as identity primary key, submission_id uuid not null references public.submissions,
 old_grade numeric, new_grade numeric not null, actor_id uuid, reason text not null, created_at timestamptz not null default now()
);
create table public.final_results(
 student_id uuid references public.profiles, group_id uuid references public.groups,
 final_grade numeric(2,1) not null, passed boolean not null, closed_at timestamptz not null default now(),
 primary key(student_id,group_id)
);
create table public.notifications(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles,
 kind text not null, resource_id uuid, read_at timestamptz, created_at timestamptz not null default now()
);
create table public.audit_events(
 id bigint generated always as identity primary key, actor_id uuid, action text not null,
 entity text not null, resource_id text, created_at timestamptz not null default now()
);
create table public.deletion_requests(
 id uuid primary key default gen_random_uuid(), target_id uuid not null references public.profiles,
 requested_by uuid not null references public.profiles, approved_by uuid references public.profiles,
 state text not null default 'requested' check(state in ('requested','approved','cancelled')),
 created_at timestamptz not null default now(), check(approved_by is null or approved_by <> requested_by)
);
create table private.storage_budget(
 singleton boolean primary key default true check(singleton), reserved_bytes bigint not null default 0,
 max_bytes bigint not null default 250000000, max_file_bytes integer not null default 2000000,
 max_attachments integer not null default 3, check(reserved_bytes >= 0)
);
insert into private.storage_budget(singleton) values(true);
create table public.uploads(
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles,
 path text not null unique, mime_type text not null check(mime_type in ('application/pdf','image/jpeg','image/png')),
 bytes integer not null check(bytes > 0), version_id uuid references public.submission_versions,
 created_at timestamptz not null default now()
);

create index on public.enrollments(group_id,student_id);
create index on public.teacher_groups(group_id,teacher_id);
create index on public.tasks(group_id);
create index on public.submissions(student_id,task_id);
create index on public.comments(submission_id,created_at);
create index on public.notifications(user_id,created_at desc);
create index on public.uploads(owner_id);

create function private.active() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and state='active');
$$;
create function private.has_role(r text) returns boolean language sql stable security definer set search_path='' as $$
 select private.active() and exists(select 1 from public.user_roles where user_id=auth.uid() and role=r);
$$;
create function private.permitted(p text) returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role('academic_admin') and coalesce(auth.jwt()->>'aal','')='aal2'
 and exists(select 1 from public.user_permissions where user_id=auth.uid() and permission=p);
$$;
create function private.system_admin() returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role('system_admin') and coalesce(auth.jwt()->>'aal','')='aal2';
$$;
create function private.teaches(g uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role('teacher') and exists(select 1 from public.teacher_groups where teacher_id=auth.uid() and group_id=g);
$$;
create function private.enrolled(g uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.has_role('student') and exists(select 1 from public.enrollments where student_id=auth.uid() and group_id=g);
$$;
create function private.can_submission(s uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.active() and exists(select 1 from public.submissions x join public.tasks t on t.id=x.task_id
 where x.id=s and (x.student_id=auth.uid() or private.teaches(t.group_id)));
$$;
create function private.require(ok boolean) returns void language plpgsql set search_path='' as $$
 begin if ok is distinct from true then raise exception 'Operación no permitida' using errcode='42501'; end if; end;
$$;
create function private.lock_period(p uuid) returns void language plpgsql security definer set search_path='' as $$
 declare closed timestamptz;
 begin
 select closed_at into closed from public.periods where id=p for update;
 if not found then raise exception 'Período inexistente'; end if;
 if closed is not null then raise exception 'Período cerrado'; end if;
 end;
$$;
create function private.log_event(a text,e text,r text) returns void language sql security definer set search_path='' as $$
 insert into public.audit_events(actor_id,action,entity,resource_id) values(auth.uid(),a,e,r);
$$;

-- Lecturas con RLS. Ningún rol recibe escritura académica directa.
do $$ declare t text; begin
 foreach t in array array['profiles','user_roles','user_permissions','programs','periods','subjects','groups','teacher_groups','enrollments','categories','tasks','submissions','submission_versions','comments','grade_history','final_results','notifications','audit_events','deletion_requests','uploads'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
create policy profiles_read on public.profiles for select to authenticated using(private.active() and (id=auth.uid() or private.system_admin() or private.permitted('identity.manage')));
create policy roles_read on public.user_roles for select to authenticated using(private.active() and (user_id=auth.uid() or private.system_admin()));
create policy permissions_read on public.user_permissions for select to authenticated using(private.active() and (user_id=auth.uid() or private.system_admin()));
create policy programs_read on public.programs for select to authenticated using(private.active());
create policy periods_read on public.periods for select to authenticated using(private.active());
create policy subjects_read on public.subjects for select to authenticated using(private.active());
create policy groups_read on public.groups for select to authenticated using(private.teaches(id) or private.enrolled(id) or private.permitted('structure.manage'));
create policy teachers_read on public.teacher_groups for select to authenticated using(private.active() and (teacher_id=auth.uid() or private.permitted('structure.manage')));
create policy enrollments_read on public.enrollments for select to authenticated using(private.active() and (student_id=auth.uid() or private.teaches(group_id) or private.permitted('enrollment.manage')));
create policy categories_read on public.categories for select to authenticated using(private.permitted('evaluation.manage') or exists(select 1 from public.groups g where g.subject_id=categories.subject_id and g.period_id=categories.period_id));
create policy tasks_read on public.tasks for select to authenticated using(private.teaches(group_id) or (private.active() and exists(select 1 from public.submissions s where s.task_id=tasks.id and s.student_id=auth.uid())));
-- Definer evita recursión tasks/submissions en sus políticas.
create function private.owns_task(t uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.active() and exists(select 1 from public.submissions where task_id=t and student_id=auth.uid());
$$;
drop policy tasks_read on public.tasks;
create policy tasks_read on public.tasks for select to authenticated using(private.teaches(group_id) or private.owns_task(id));
create policy submissions_read on public.submissions for select to authenticated using(private.can_submission(id));
create policy versions_read on public.submission_versions for select to authenticated using(private.can_submission(submission_id));
create policy comments_read on public.comments for select to authenticated using(private.can_submission(submission_id));
create policy grades_read on public.grade_history for select to authenticated using(private.can_submission(submission_id));
create policy results_read on public.final_results for select to authenticated using(private.active() and (student_id=auth.uid() or private.teaches(group_id)));
create policy notifications_read on public.notifications for select to authenticated using(private.active() and user_id=auth.uid());
create policy audit_read on public.audit_events for select to authenticated using(private.system_admin());
create policy deletions_read on public.deletion_requests for select to authenticated using(private.system_admin());
create policy uploads_read on public.uploads for select to authenticated using(private.active() and (owner_id=auth.uid() or exists(select 1 from public.submission_versions v where v.id=uploads.version_id and private.can_submission(v.submission_id))));

create function public.update_my_profile(p_address text,p_avatar_path text default null) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.active() and length(p_address)<=500);
 -- La imagen se admite únicamente si corresponde a un objeto propio ya subido.
 if p_avatar_path is not null then
 perform private.require(exists(select 1 from public.uploads u join storage.objects o on o.name=u.path and o.bucket_id='evidence' where u.owner_id=auth.uid() and u.path=p_avatar_path and u.mime_type in ('image/jpeg','image/png')));
 end if;
 update public.profiles set address=p_address,avatar_path=p_avatar_path where id=auth.uid();
end $$;

create function public.group_roster(p_group uuid) returns table(student_id uuid,full_name text) language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.teaches(p_group) or private.permitted('enrollment.manage'));
 return query select p.id,p.full_name from public.enrollments e join public.profiles p on p.id=e.student_id where e.group_id=p_group order by p.full_name,p.id;
end $$;

create function public.manage_structure(p_kind text,p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; g public.groups;
begin
 perform private.require(private.permitted(case when p_kind in ('enrollment','teacher_assignment') then 'enrollment.manage' else 'structure.manage' end));
 case p_kind
 when 'program' then insert into public.programs(name) values(p_data->>'name') returning id into result;
 when 'period' then insert into public.periods(name,starts_on,ends_on) values(p_data->>'name',(p_data->>'starts_on')::date,(p_data->>'ends_on')::date) returning id into result;
 when 'subject' then insert into public.subjects(program_id,name) values((p_data->>'program_id')::uuid,p_data->>'name') returning id into result;
 when 'group' then
 perform private.lock_period((p_data->>'period_id')::uuid);
 insert into public.groups(subject_id,period_id,name) values((p_data->>'subject_id')::uuid,(p_data->>'period_id')::uuid,p_data->>'name') returning id into result;
 when 'enrollment','teacher_assignment' then
 select * into strict g from public.groups where id=(p_data->>'group_id')::uuid;
 perform private.lock_period(g.period_id);
 if p_kind='enrollment' then
 if exists(select 1 from public.tasks where group_id=g.id) then raise exception 'La matrícula con actividades publicadas requiere definir su aplicabilidad'; end if;
 perform private.require(exists(select 1 from public.user_roles where user_id=(p_data->>'user_id')::uuid and role='student'));
 insert into public.enrollments values((p_data->>'user_id')::uuid,g.id);
 else
 perform private.require(exists(select 1 from public.user_roles where user_id=(p_data->>'user_id')::uuid and role='teacher'));
 insert into public.teacher_groups values((p_data->>'user_id')::uuid,g.id);
 end if;
 result:=g.id;
 else raise exception 'Tipo de estructura no admitido';
 end case;
 perform private.log_event('create',p_kind,result::text); return result;
end $$;

create function public.set_evaluation(p_subject uuid,p_period uuid,p_categories jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.permitted('evaluation.manage'));
 perform private.lock_period(p_period);
 if exists(select 1 from public.tasks t join public.groups g on g.id=t.group_id where g.subject_id=p_subject and g.period_id=p_period) then
 raise exception 'Cambiar un esquema con actividades requiere una política académica todavía pendiente'; end if;
 if jsonb_typeof(p_categories)<>'array' or jsonb_array_length(p_categories)=0 or
 (select sum((x->>'weight')::numeric) from jsonb_array_elements(p_categories) x) is distinct from 100::numeric then
 raise exception 'Los pesos deben sumar 100'; end if;
 delete from public.categories where subject_id=p_subject and period_id=p_period;
 insert into public.categories(subject_id,period_id,name,weight)
 select p_subject,p_period,x->>'name',(x->>'weight')::numeric from jsonb_array_elements(p_categories) x;
 perform private.log_event('evaluation.set','subjects',p_subject::text);
end $$;

create function public.publish_task(p_groups uuid[],p_title text,p_description text,p_due_at timestamptz,p_category_name text,p_students uuid[] default null) returns uuid[] language plpgsql security definer set search_path='' as $$
declare g public.groups; c uuid; t uuid; result uuid[]:='{}';
begin
 perform private.require(private.has_role('teacher') and cardinality(p_groups)>0 and cardinality(p_groups)<=100);
 if p_students is not null then
 perform private.require(cardinality(p_students)>0 and not exists(select 1 from unnest(p_students) s where not exists(select 1 from public.enrollments e where e.student_id=s and e.group_id=any(p_groups)))); end if;
 for g in select * from public.groups where id=any(p_groups) order by period_id,id loop
 perform private.require(private.teaches(g.id)); perform private.lock_period(g.period_id);
 select id into c from public.categories where subject_id=g.subject_id and period_id=g.period_id and name=p_category_name;
 if c is null then raise exception 'Categoría inexistente'; end if;
 insert into public.tasks(group_id,category_id,author_id,title,description,due_at) values(g.id,c,auth.uid(),p_title,p_description,p_due_at) returning id into t;
 insert into public.submissions(task_id,student_id) select t,student_id from public.enrollments where group_id=g.id and (p_students is null or student_id=any(p_students));
 if not found then raise exception 'Grupo sin destinatarios'; end if;
 insert into public.notifications(user_id,kind,resource_id) select student_id,'task',t from public.submissions where task_id=t;
 result:=array_append(result,t);
 perform private.log_event('task.publish','tasks',t::text);
 end loop;
 if cardinality(result)<>(select count(distinct x) from unnest(p_groups) x) then raise exception 'Grupo inexistente'; end if;
 return result;
end $$;

create function public.submit_work(p_submission uuid,p_body text,p_uploads uuid[] default '{}') returns uuid language plpgsql security definer set search_path='' as $$
declare s public.submissions; t public.tasks; v uuid; p uuid; b private.storage_budget;
begin
 p_uploads:=coalesce(p_uploads,'{}'::uuid[]);
 select g.period_id into p from public.submissions x join public.tasks y on y.id=x.task_id join public.groups g on g.id=y.group_id where x.id=p_submission;
 perform private.lock_period(p);
 select * into strict s from public.submissions where id=p_submission for update;
 select * into strict t from public.tasks where id=s.task_id;
 perform private.require(private.has_role('student') and s.student_id=auth.uid() and private.enrolled(t.group_id));
 if s.current_version>0 and not s.replacement_allowed then raise exception 'El reemplazo requiere autorización docente'; end if;
 if length(p_body)>50000 or (length(trim(p_body))=0 and cardinality(p_uploads)=0) then raise exception 'Contenido de entrega no válido'; end if;
 select * into b from private.storage_budget where singleton;
 if cardinality(p_uploads)>b.max_attachments or cardinality(p_uploads)<>(select count(distinct x) from unnest(p_uploads) x) then raise exception 'Adjuntos no válidos'; end if;
 perform 1 from public.uploads where id=any(p_uploads) order by id for update;
 if (select count(*) from public.uploads u join storage.objects o on o.name=u.path and o.bucket_id='evidence'
 where u.id=any(p_uploads) and u.owner_id=auth.uid() and u.version_id is null and (o.metadata->>'size')::bigint<=u.bytes and o.metadata->>'mimetype'=u.mime_type)<>cardinality(p_uploads) then raise exception 'Archivo ausente o no válido'; end if;
 insert into public.submission_versions(submission_id,version,body,late) values(s.id,s.current_version+1,p_body,clock_timestamp()>t.due_at) returning id into v;
 update public.uploads set version_id=v where id=any(p_uploads);
 update public.submissions set current_version=current_version+1,replacement_allowed=false,grade=null,graded_at=null,graded_by=null where id=s.id;
 perform private.log_event('submission.confirm','submissions',s.id::text); return v;
end $$;

create function public.review_work(p_submission uuid,p_action text,p_grade numeric default null,p_comment text default null) returns void language plpgsql security definer set search_path='' as $$
declare s public.submissions; g uuid; p uuid;
begin
 select t.group_id,x.period_id into g,p from public.submissions a join public.tasks t on t.id=a.task_id join public.groups x on x.id=t.group_id where a.id=p_submission;
 perform private.require(private.teaches(g)); perform private.lock_period(p);
 select * into strict s from public.submissions where id=p_submission for update;
 if p_action='grade' then
 if s.current_version=0 then raise exception 'No hay entrega para revisar; el cierre asigna los ceros pendientes'; end if;
 if p_grade is null or p_grade<0 or p_grade>5 then raise exception 'Nota fuera de 0.0 a 5.0'; end if;
 insert into public.grade_history(submission_id,old_grade,new_grade,actor_id,reason) values(s.id,s.grade,p_grade,auth.uid(),coalesce(p_comment,'Calificación docente'));
 update public.submissions set grade=p_grade,graded_by=auth.uid(),graded_at=now() where id=s.id;
 insert into public.notifications(user_id,kind,resource_id) values(s.student_id,'grade',s.id);
 elsif p_action='authorize_replacement' then
 update public.submissions set replacement_allowed=true where id=s.id;
 else raise exception 'Acción no admitida'; end if;
 perform private.log_event(p_action,'submissions',s.id::text);
end $$;
create function public.add_comment(p_submission uuid,p_body text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; p uuid;
begin
 perform private.require(private.can_submission(p_submission));
 select g.period_id into p from public.submissions s join public.tasks t on t.id=s.task_id join public.groups g on g.id=t.group_id where s.id=p_submission;
 perform private.lock_period(p);
 insert into public.comments(submission_id,author_id,body) values(p_submission,auth.uid(),p_body) returning id into result;
 return result;
end $$;

create function public.close_period(p_period uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.permitted('period.close')); perform private.lock_period(p_period);
 if exists(select 1 from public.submissions s join public.tasks t on t.id=s.task_id join public.groups g on g.id=t.group_id where g.period_id=p_period and s.current_version>0 and s.grade is null) then raise exception 'Hay entregas pendientes de revisión'; end if;
 -- Se bloquean esquemas incompletos; no se inventa cómo distribuir categorías vacías.
 if exists(select 1 from public.groups g where g.period_id=p_period and
 ((select sum(c.weight) from public.categories c where c.period_id=p_period and c.subject_id=g.subject_id) is distinct from 100::numeric
 or exists(select 1 from public.enrollments e cross join public.categories c where e.group_id=g.id and c.subject_id=g.subject_id and c.period_id=p_period and not exists(select 1 from public.submissions s join public.tasks t on t.id=s.task_id where s.student_id=e.student_id and t.group_id=g.id and t.category_id=c.id)))) then raise exception 'Esquema incompleto o categoría sin actividades aplicables'; end if;
 insert into public.grade_history(submission_id,old_grade,new_grade,actor_id,reason)
 select s.id,s.grade,0,auth.uid(),'Cierre: no entregada' from public.submissions s join public.tasks t on t.id=s.task_id join public.groups g on g.id=t.group_id where g.period_id=p_period and s.current_version=0 and s.grade is null;
 update public.submissions s set grade=0,graded_by=auth.uid(),graded_at=now() from public.tasks t,public.groups g where s.task_id=t.id and t.group_id=g.id and g.period_id=p_period and s.current_version=0 and s.grade is null;
 insert into public.final_results(student_id,group_id,final_grade,passed)
 select student_id,group_id,round(sum(avg_grade*weight/100),1),round(sum(avg_grade*weight/100),1)>=3
 from (select s.student_id,g.id group_id,c.id,c.weight,avg(s.grade) avg_grade from public.submissions s join public.tasks t on t.id=s.task_id join public.groups g on g.id=t.group_id join public.categories c on c.id=t.category_id where g.period_id=p_period group by s.student_id,g.id,c.id,c.weight) grades group by student_id,group_id;
 update public.periods set closed_at=now() where id=p_period;
 perform private.log_event('period.close','periods',p_period::text);
end $$;

create function public.reserve_upload(p_bytes integer,p_mime text) returns public.uploads language plpgsql security definer set search_path='' as $$
declare b private.storage_budget; result public.uploads; identifier uuid:=gen_random_uuid();
begin
 perform private.require(private.active());
 select * into b from private.storage_budget where singleton for update;
 if p_bytes<=0 or p_bytes>b.max_file_bytes or b.reserved_bytes+b.max_file_bytes>b.max_bytes then raise exception 'Presupuesto de archivos agotado o tamaño no permitido'; end if;
 insert into public.uploads(id,owner_id,path,mime_type,bytes) values(identifier,auth.uid(),auth.uid()::text||'/'||identifier::text,p_mime,p_bytes) returning * into result;
 -- Reservar el máximo del bucket impide consumir más espacio declarando un tamaño falso.
 update private.storage_budget set reserved_bytes=reserved_bytes+b.max_file_bytes where singleton;
 return result;
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('evidence','evidence',false,2000000,array['application/pdf','image/jpeg','image/png']);
create policy evidence_insert on storage.objects for insert to authenticated with check(bucket_id='evidence' and private.active() and exists(select 1 from public.uploads u where u.path=name and u.owner_id=auth.uid() and u.version_id is null));
create policy evidence_read on storage.objects for select to authenticated using(bucket_id='evidence' and private.active() and exists(select 1 from public.uploads u where u.path=name));
-- Sin UPDATE/DELETE: versiones adjuntas inmutables. El mantenimiento de huérfanos se implementa por separado.

create function public.manage_account(p_user uuid,p_state text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.system_admin());
 perform pg_advisory_xact_lock(771001);
 perform private.require(p_user<>auth.uid());
 if p_state not in ('active','suspended','archived') then raise exception 'Estado no válido'; end if;
 if p_state<>'active' and exists(select 1 from public.user_roles where user_id=p_user and role='system_admin') and
 (select count(*) from public.user_roles r join public.profiles p on p.id=r.user_id where r.role='system_admin' and p.state='active')<=1 then raise exception 'No se puede deshabilitar el último administrador'; end if;
 update public.profiles set state=p_state where id=p_user;
 if not found then raise exception 'Cuenta inexistente'; end if;
 perform private.log_event('account.'||p_state,'profiles',p_user::text);
end $$;
create function public.correct_identity(p_user uuid,p_name text,p_document text,p_birth date) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.permitted('identity.manage'));
 update public.profiles set full_name=p_name,document_number=p_document,birth_date=p_birth where id=p_user;
 perform private.log_event('identity.correct','profiles',p_user::text);
end $$;
create function public.request_deletion(p_user uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform private.require(private.system_admin() and p_user<>auth.uid());
 perform 1 from public.profiles where id=p_user for update;
 if exists(select 1 from public.enrollments where student_id=p_user) or exists(select 1 from public.teacher_groups where teacher_id=p_user) or exists(select 1 from public.submissions where student_id=p_user) then raise exception 'Cuenta con historial: corresponde archivado'; end if;
 insert into public.deletion_requests(target_id,requested_by) values(p_user,auth.uid()) returning id into result;
 perform private.log_event('deletion.request','profiles',p_user::text); return result;
end $$;
create function public.approve_deletion(p_request uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.system_admin());
 update public.deletion_requests set approved_by=auth.uid(),state='approved' where id=p_request and requested_by<>auth.uid() and state='requested';
 if not found then raise exception 'Requiere otro administrador y solicitud pendiente'; end if;
 perform private.log_event('deletion.approve','deletion_requests',p_request::text);
 -- La eliminación física NO se habilita hasta implementar el ejecutor y revalidación de historial.
end $$;

-- Los helpers internos nunca son RPC públicas; revocar ejecución por defecto.
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.active(),private.has_role(text),private.permitted(text),private.system_admin(),private.teaches(uuid),private.enrolled(uuid),private.can_submission(uuid),private.owns_task(uuid) to authenticated;
revoke all on function public.update_my_profile(text,text),public.group_roster(uuid),public.manage_structure(text,jsonb),public.set_evaluation(uuid,uuid,jsonb),public.publish_task(uuid[],text,text,timestamptz,text,uuid[]),public.submit_work(uuid,text,uuid[]),public.review_work(uuid,text,numeric,text),public.add_comment(uuid,text),public.close_period(uuid),public.reserve_upload(integer,text),public.manage_account(uuid,text),public.correct_identity(uuid,text,text,date),public.request_deletion(uuid),public.approve_deletion(uuid) from public,anon;
grant execute on function public.update_my_profile(text,text),public.group_roster(uuid),public.manage_structure(text,jsonb),public.set_evaluation(uuid,uuid,jsonb),public.publish_task(uuid[],text,text,timestamptz,text,uuid[]),public.submit_work(uuid,text,uuid[]),public.review_work(uuid,text,numeric,text),public.add_comment(uuid,text),public.close_period(uuid),public.reserve_upload(integer,text),public.manage_account(uuid,text),public.correct_identity(uuid,text,text,date),public.request_deletion(uuid),public.approve_deletion(uuid) to authenticated;
commit;
