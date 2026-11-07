begin;
create function public.dashboard_counts(p_mode text) returns jsonb language plpgsql stable security definer set search_path='' as $$
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
 perform private.require(private.system_admin());
 select jsonb_build_object('active',count(*) filter(where state='active'),'suspended',count(*) filter(where state='suspended'),'archived',count(*) filter(where state='archived'),'deleting',count(*) filter(where state='deleting')) into result from public.profiles;
 elsif p_mode='academic_admin' then
 perform private.require(private.permitted('structure.manage'));
 select jsonb_build_object('programs',(select count(*) from public.programs where archived_at is null),'groups',(select count(*) from public.groups where archived_at is null),'open_periods',(select count(*) from public.periods where closed_at is null)) into result;
 else raise exception 'Panel no admitido'; end if;
 return result;
end $$;

create function public.my_subject_result(p_group uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 perform private.require(private.enrolled(p_group));
 select jsonb_build_object('group_id',p_group,'closed',p.closed_at is not null,
 'final',(select to_jsonb(f) from public.final_results f where f.group_id=p_group and f.student_id=auth.uid()),
 'individual_grades',coalesce((select jsonb_agg(jsonb_build_object('task_id',t.id,'title',t.title,'grade',s.grade,'submitted',s.current_version>0) order by t.created_at,t.id) from public.submissions s join public.tasks t on t.id=s.task_id where s.student_id=auth.uid() and t.group_id=p_group),'[]'::jsonb),
 'provisional',jsonb_build_object('value',null,'status','pending_academic_policy')) into result from public.groups g join public.periods p on p.id=g.period_id where g.id=p_group;
 return result;
end $$;
revoke all on function public.dashboard_counts(text),public.my_subject_result(uuid) from public,anon;
grant execute on function public.dashboard_counts(text),public.my_subject_result(uuid) to authenticated;
commit;
