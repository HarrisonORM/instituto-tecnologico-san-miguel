\set ON_ERROR_STOP on
do $$ begin if current_database()<>'itsm_test' then raise exception 'Base local requerida'; end if; end $$;
insert into auth.users(id,email) values('c2000000-0000-4000-a000-000000000001','role-upgrade@example.invalid');
insert into public.profiles(id,full_name) values('c2000000-0000-4000-a000-000000000001','Conflicto local');
insert into public.user_roles values('c2000000-0000-4000-a000-000000000001','student'),('c2000000-0000-4000-a000-000000000001','teacher');
