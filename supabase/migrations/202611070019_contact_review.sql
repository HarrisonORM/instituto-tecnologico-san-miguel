begin;
create function public.mark_contact(p_contact uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform private.require(private.permitted('contact.manage'));
 update public.contact_inquiries set status='reviewed' where id=p_contact;
 if not found then raise exception 'Solicitud no disponible'; end if;
 perform private.log_event('contact.review','contact_inquiries',p_contact::text);
end $$;
revoke all on function public.mark_contact(uuid) from public,anon;
grant execute on function public.mark_contact(uuid) to authenticated;
commit;
