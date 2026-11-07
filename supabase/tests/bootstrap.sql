-- Solo para el clúster PostgreSQL local y desechable creado por test-database.ps1.
do $$ begin if current_database()<>'itsm_test' then raise exception 'Base local de pruebas requerida'; end if; end $$;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create schema storage;
create table auth.users(id uuid primary key,email text);
create function auth.uid() returns uuid language sql stable as $$ select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb) $$;
grant usage on schema public,auth,storage to anon,authenticated,service_role;
grant execute on function auth.uid(),auth.jwt() to anon,authenticated,service_role;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets,name text,owner uuid,metadata jsonb default '{}'::jsonb,unique(bucket_id,name));
alter table storage.objects enable row level security;
grant select,insert,update,delete on storage.objects to authenticated,service_role;
