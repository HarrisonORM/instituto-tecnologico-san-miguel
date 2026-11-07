-- Ejecutar solo mediante psql conectado como propietario, DESPUÉS de las migraciones.
-- Usar variables psql admin_id y admin_name: UUID de una cuenta Auth propia ya creada.
-- No es una RPC pública. No crear administradores automáticamente al registrarse.
begin;
insert into public.profiles(id,full_name) values(:'admin_id'::uuid, :'admin_name');
insert into public.user_roles(user_id,role) values(:'admin_id'::uuid,'system_admin');
commit;
