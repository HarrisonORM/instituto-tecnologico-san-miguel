-- Traducciones revisadas, con los permisos y la versión del original.
begin;
create table public.content_translations (
 id uuid primary key default gen_random_uuid(), resource_type text not null check(resource_type in ('task','comment','program','subject','category')),
 resource_id uuid not null, locale text not null check(locale in ('es','en')), fields jsonb not null,
 source_fingerprint text not null, reviewed_by uuid not null references public.profiles,
 reviewed_at timestamptz not null default now(), unique(resource_type,resource_id,locale)
);
alter table public.content_translations enable row level security;
revoke all on public.content_translations from anon,authenticated;
grant select on public.content_translations to authenticated;

create function private.translation_source(p_kind text,p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare fingerprint text; readable boolean:=false; writable boolean:=false;
begin
 if not private.active() then return null; end if;
 case p_kind
 when 'task' then select md5(t.title||chr(31)||t.description),private.teaches(t.group_id) or private.owns_task(t.id),t.author_id=auth.uid() and private.teaches(t.group_id) into fingerprint,readable,writable from public.tasks t where t.id=p_id;
 when 'comment' then select md5(c.body),private.can_submission(c.submission_id),c.author_id=auth.uid() and private.can_submission(c.submission_id) into fingerprint,readable,writable from public.comments c where c.id=p_id;
 when 'program' then select md5(p.name),true,private.permitted('structure.manage') into fingerprint,readable,writable from public.programs p where p.id=p_id;
 when 'subject' then select md5(s.name),true,private.permitted('structure.manage') into fingerprint,readable,writable from public.subjects s where s.id=p_id;
 when 'category' then select md5(c.name),private.permitted('evaluation.manage') or exists(select 1 from public.groups g where g.subject_id=c.subject_id and g.period_id=c.period_id and (private.teaches(g.id) or private.enrolled(g.id))),private.permitted('evaluation.manage') into fingerprint,readable,writable from public.categories c where c.id=p_id;
 else return null;
 end case;
 if readable is not true or fingerprint is null then return null; end if;
 return jsonb_build_object('fingerprint',fingerprint,'write',writable);
end $$;
revoke all on function private.translation_source(text,uuid) from public,anon;
grant execute on function private.translation_source(text,uuid) to authenticated;
create policy translation_read on public.content_translations for select to authenticated using(
 source_fingerprint=(private.translation_source(resource_type,resource_id)->>'fingerprint')
);
create function public.set_translation(p_kind text,p_id uuid,p_locale text,p_fields jsonb) returns void language plpgsql security definer set search_path='' as $$
declare source jsonb; key text; value text;
begin
 source:=private.translation_source(p_kind,p_id);
 perform private.require(coalesce((source->>'write')::boolean,false));
 if p_locale is null or p_locale not in ('es','en') or p_fields is null or jsonb_typeof(p_fields)<>'object' or p_fields='{}'::jsonb then raise exception 'Traducción no válida'; end if;
 for key,value in select * from jsonb_each_text(p_fields) loop
 if (p_kind='task' and key not in ('title','description')) or (p_kind='comment' and key<>'body') or (p_kind in ('program','subject','category') and key<>'name') or length(value)>10000 or length(trim(value))=0 or jsonb_typeof(p_fields->key)<>'string' then raise exception 'Campo de traducción no válido'; end if;
 if key in ('title','name') and length(value)>200 then raise exception 'Título demasiado largo'; end if;
 end loop;
 insert into public.content_translations(resource_type,resource_id,locale,fields,source_fingerprint,reviewed_by)
 values(p_kind,p_id,p_locale,p_fields,source->>'fingerprint',auth.uid())
 on conflict(resource_type,resource_id,locale) do update set fields=excluded.fields,source_fingerprint=excluded.source_fingerprint,reviewed_by=auth.uid(),reviewed_at=now();
 perform private.log_event('translation.review','content_translations',p_id::text);
end $$;
revoke all on function public.set_translation(text,uuid,text,jsonb) from public,anon;
grant execute on function public.set_translation(text,uuid,text,jsonb) to authenticated;
commit;
