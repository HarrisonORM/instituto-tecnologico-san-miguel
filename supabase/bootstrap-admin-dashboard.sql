-- Instituto Tecnológico de San Miguel: primer administrador.
-- Ejecutar manualmente en el SQL Editor del proyecto dedicado:
-- instituto-tecnologico-san-miguel (smbtvfevndmpxpxxiorj).
-- La cuenta Auth propia ya debe existir. Verificar su correo antes de copiar el UID.
-- Cambiar SOLO las dos cadenas indicadas; no introducir contraseña ni claves.
-- Es una operación del propietario, no una RPC ni un registro público.
-- No ejecutar bootstrap.sql, reinstalar migraciones ni desactivar RLS.

begin;
set local lock_timeout = '10s';
set local statement_timeout = '30s';

do $first_admin$
declare
  -- 1. Copia el UID de TU cuenta desde Authentication > Users.
  target_uid_text text := 'PEGA_AQUI_TU_UID';
  -- 2. Escribe el nombre que deseas ver en tu perfil.
  target_name text := 'ESCRIBE_AQUI_TU_NOMBRE';
  target_uid uuid;
  target_email text;
begin
  if target_uid_text = 'PEGA_AQUI_TU_UID'
     or target_name = 'ESCRIBE_AQUI_TU_NOMBRE' then
    raise exception 'Primero reemplaza el UID y el nombre en las dos líneas indicadas.';
  end if;
  target_uid := trim(target_uid_text)::uuid;
  target_name := trim(target_name);
  if target_name is null or length(target_name) not between 1 and 200 then
    raise exception 'El nombre debe tener entre 1 y 200 caracteres.';
  end if;

  if to_regclass('public.profiles') is null
     or to_regclass('public.user_roles') is null
     or to_regclass('public.audit_events') is null then
    raise exception 'Falta la estructura de la aplicación. Revisa el proyecto y la instalación.';
  end if;

  -- Mismo bloqueo que las operaciones de administración de la aplicación.
  perform pg_advisory_xact_lock(771001);
  if exists(select 1 from public.user_roles where role = 'system_admin') then
    raise exception 'Ya existe un administrador. No repetir esta alta inicial; usar el procedimiento de administración.';
  end if;

  select email into target_email from auth.users where id = target_uid for update;
  if not found or coalesce(trim(target_email), '') = '' then
    raise exception 'No existe una cuenta Auth con correo para ese UID. No se creó ningún perfil.';
  end if;
  if exists(select 1 from public.profiles where id = target_uid) then
    raise exception 'Esta cuenta ya tiene un perfil. Revisar sus roles antes de conceder privilegios.';
  end if;

  insert into public.profiles(id, full_name) values(target_uid, target_name);
  insert into public.user_roles(user_id, role) values(target_uid, 'system_admin');
  -- No hay sesión de aplicación durante esta operación manual del propietario.
  insert into public.audit_events(actor_id, action, entity, resource_id)
  values(null, 'account.bootstrap.owner', 'profiles', target_uid::text);
end;
$first_admin$;

commit;

select p.full_name as nombre, r.role as rol, p.state as estado
from public.profiles p
join public.user_roles r on r.user_id = p.id
where r.role = 'system_admin';
