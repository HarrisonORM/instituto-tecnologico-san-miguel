begin;
create table private.command_receipts(
 actor uuid not null, request_key uuid not null, operation text not null, arguments jsonb not null,
 result jsonb not null, created_at timestamptz not null default now(), primary key(actor,request_key)
);
create function public.command_once(p_key uuid,p_operation text,p_arguments jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt private.command_receipts; result jsonb; group_id uuid; student uuid;
begin
 perform private.require(private.active());
 if octet_length(p_arguments::text)>65536 or jsonb_typeof(p_arguments)<>'object' then raise exception 'Argumentos demasiado grandes o no válidos'; end if;
 -- Revalidar permisos también al devolver un recibo previo.
 case p_operation
 when 'publish_task' then
 perform private.require(private.has_role('teacher') and not exists(select 1 from jsonb_array_elements_text(p_arguments->'p_groups') g where not private.teaches(g::uuid)));
 when 'submit_work','review_work','add_comment' then
 select t.group_id,s.student_id into group_id,student from public.submissions s join public.tasks t on t.id=s.task_id where s.id=(p_arguments->>'p_submission')::uuid;
 if p_operation='review_work' then perform private.require(private.teaches(group_id));
 elsif p_operation='submit_work' then perform private.require(private.has_role('student') and student=auth.uid());
 else perform private.require(private.can_submission((p_arguments->>'p_submission')::uuid)); end if;
 when 'close_period' then perform private.require(private.permitted('period.close'));
 when 'manage_structure' then perform private.require(private.permitted(case when p_arguments->>'p_kind' in ('enrollment','teacher_assignment') then 'enrollment.manage' else 'structure.manage' end));
 else raise exception 'Operación sin recibo idempotente'; end case;
 -- Serialización breve y acotada para la demostración, no una cola distribuida.
 perform pg_advisory_xact_lock(771002);
 delete from private.command_receipts where created_at<now()-interval '24 hours';
 select * into receipt from private.command_receipts where actor=auth.uid() and request_key=p_key;
 if found then
 if receipt.operation<>p_operation or receipt.arguments<>p_arguments then raise exception 'Clave reutilizada con otro contenido'; end if;
 return receipt.result;
 end if;
 if (select count(*) from private.command_receipts)>=1000 then raise exception 'Capacidad temporal de recibos agotada'; end if;
 case p_operation
 when 'publish_task' then
 result:=to_jsonb(public.publish_task(array(select value::uuid from jsonb_array_elements_text(p_arguments->'p_groups')),
 p_arguments->>'p_title',p_arguments->>'p_description',(p_arguments->>'p_due_at')::timestamptz,p_arguments->>'p_category_name',
 case when p_arguments->'p_students' is null or p_arguments->'p_students'='null'::jsonb then null else array(select value::uuid from jsonb_array_elements_text(p_arguments->'p_students')) end));
 when 'submit_work' then result:=to_jsonb(public.submit_work((p_arguments->>'p_submission')::uuid,p_arguments->>'p_body',array(select value::uuid from jsonb_array_elements_text(coalesce(nullif(p_arguments->'p_uploads','null'::jsonb),'[]'::jsonb)))));
 when 'review_work' then
 perform public.review_work((p_arguments->>'p_submission')::uuid,p_arguments->>'p_action',(p_arguments->>'p_grade')::numeric,p_arguments->>'p_comment'); result:='null'::jsonb;
 when 'add_comment' then result:=to_jsonb(public.add_comment((p_arguments->>'p_submission')::uuid,p_arguments->>'p_body'));
 when 'close_period' then perform public.close_period((p_arguments->>'p_period')::uuid); result:='null'::jsonb;
 when 'manage_structure' then result:=to_jsonb(public.manage_structure(p_arguments->>'p_kind',p_arguments->'p_data'));
 end case;
 insert into private.command_receipts(actor,request_key,operation,arguments,result) values(auth.uid(),p_key,p_operation,p_arguments,result);
 return result;
end $$;
revoke all on function public.command_once(uuid,text,jsonb) from public,anon;
grant execute on function public.command_once(uuid,text,jsonb) to authenticated;
commit;
