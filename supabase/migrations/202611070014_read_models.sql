begin;
create function public.search_roster(p_group uuid,p_search text default '',p_limit integer default 25,p_offset integer default 0) returns table(student_id uuid,full_name text,total bigint) language plpgsql stable security definer set search_path='' as $$
begin
 perform private.require(private.teaches(p_group) or private.permitted('enrollment.manage'));
 if p_limit is null or p_offset is null or p_search is null or p_limit not between 1 and 100 or p_offset<0 or p_offset>1000000 or length(p_search)>200 then raise exception 'Filtro no válido'; end if;
 return query select p.id,p.full_name,count(*) over() from public.enrollments e join public.profiles p on p.id=e.student_id where e.group_id=p_group and position(lower(p_search) in lower(p.full_name))>0 order by p.full_name,p.id limit p_limit offset p_offset;
end $$;
create function public.teacher_work_queue(p_group uuid,p_state text default 'all',p_search text default '',p_limit integer default 25,p_offset integer default 0)
returns table(submission_id uuid,student_name text,task_title text,due_at timestamptz,version integer,grade numeric,late boolean,total bigint) language plpgsql stable security definer set search_path='' as $$
begin
 perform private.require(private.teaches(p_group));
 if p_state is null or p_limit is null or p_offset is null or p_search is null or p_state not in ('all','pending','missing','graded','late') or p_limit not between 1 and 100 or p_offset<0 or p_offset>1000000 or length(p_search)>200 then raise exception 'Filtro no válido'; end if;
 return query select s.id,p.full_name,t.title,t.due_at,s.current_version,s.grade,coalesce(v.late,false),count(*) over()
 from public.submissions s join public.profiles p on p.id=s.student_id join public.tasks t on t.id=s.task_id left join public.submission_versions v on v.submission_id=s.id and v.version=s.current_version
 where t.group_id=p_group and (position(lower(p_search) in lower(p.full_name))>0 or position(lower(p_search) in lower(t.title))>0)
 and (p_state='all' or (p_state='pending' and s.current_version>0 and s.grade is null) or (p_state='missing' and s.current_version=0) or (p_state='graded' and s.grade is not null) or (p_state='late' and v.late))
 order by t.due_at,p.full_name,s.id limit p_limit offset p_offset;
end $$;
create function public.student_task_feed(p_period uuid default null,p_limit integer default 25,p_offset integer default 0)
returns table(submission_id uuid,task_id uuid,group_id uuid,subject_name text,title text,due_at timestamptz,version integer,grade numeric,late boolean,closed boolean,total bigint) language plpgsql stable security definer set search_path='' as $$
begin
 perform private.require(private.has_role('student'));
 if p_limit is null or p_offset is null or p_limit not between 1 and 100 or p_offset<0 or p_offset>1000000 then raise exception 'Paginación no válida'; end if;
 return query select s.id,t.id,g.id,subject.name,t.title,t.due_at,s.current_version,s.grade,coalesce(v.late,false),period.closed_at is not null,count(*) over()
 from public.submissions s join public.tasks t on t.id=s.task_id join public.groups g on g.id=t.group_id join public.subjects subject on subject.id=g.subject_id join public.periods period on period.id=g.period_id left join public.submission_versions v on v.submission_id=s.id and v.version=s.current_version
 where s.student_id=auth.uid() and (p_period is null or g.period_id=p_period)
 order by t.due_at,s.id limit p_limit offset p_offset;
end $$;
create function public.mark_all_notifications() returns void language plpgsql security definer set search_path='' as $$
begin perform private.require(private.active()); update public.notifications set read_at=now() where user_id=auth.uid() and read_at is null; end $$;
create function private.notify_comment() returns trigger language plpgsql security definer set search_path='' as $$
declare s public.submissions; g uuid;
begin
 select * into strict s from public.submissions where id=new.submission_id;
 select group_id into g from public.tasks where id=s.task_id;
 insert into public.notifications(user_id,kind,resource_id)
 select recipient,'comment',s.id from (select s.student_id recipient union select teacher_id from public.teacher_groups where group_id=g) targets where recipient<>new.author_id;
 return new;
end $$;
create trigger comment_notification after insert on public.comments for each row execute function private.notify_comment();
create function private.notify_period_closed() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.closed_at is null and new.closed_at is not null then
 insert into public.notifications(user_id,kind,resource_id) select distinct e.student_id,'period_closed',new.id from public.enrollments e join public.groups g on g.id=e.group_id where g.period_id=new.id;
 end if;return new;
end $$;
create trigger period_notification after update of closed_at on public.periods for each row execute function private.notify_period_closed();
revoke all on function private.notify_comment(),private.notify_period_closed() from public,anon,authenticated;
revoke all on function public.search_roster(uuid,text,integer,integer),public.teacher_work_queue(uuid,text,text,integer,integer),public.student_task_feed(uuid,integer,integer),public.mark_all_notifications() from public,anon;
grant execute on function public.search_roster(uuid,text,integer,integer),public.teacher_work_queue(uuid,text,text,integer,integer),public.student_task_feed(uuid,integer,integer),public.mark_all_notifications() to authenticated;
commit;
