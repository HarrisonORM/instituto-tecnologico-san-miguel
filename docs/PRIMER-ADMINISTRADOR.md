# Primera cuenta administradora

La cuenta de acceso propia ya fue creada en Supabase Auth, según confirmación del usuario. Falta vincular su perfil y rol; crear el acceso no concede automáticamente privilegios académicos ni administrativos.

## Alta manual del propietario

1. Abre el proyecto `instituto-tecnologico-san-miguel` en Supabase. En **Authentication → Users**, verifica que estás viendo tu correo y copia su **UID**.
2. Abre `supabase/bootstrap-admin-dashboard.sql`. Cambia solo los valores de las dos asignaciones comentadas `target_uid_text` y `target_name`, conservando las comillas. No uses reemplazar todo: los marcadores también aparecen en las comprobaciones. Si el nombre contiene una comilla simple, duplícala dentro de la cadena SQL.
3. En **SQL Editor → New query**, pega TODO el archivo personalizado. Confirma el proyecto y ejecútalo completo.
4. Espera una fila con tu nombre, `system_admin` y `active`. Si se detiene, revisa el mensaje; no borres registros ni cambies permisos para sortearlo.
5. Abre https://instituto-tecnologico-san-miguel.vercel.app/acceso e inicia sesión. El siguiente paso será configurar MFA desde **Seguridad**; ese recorrido conectado aún debe comprobarse.

Este archivo es exclusivo para el primer administrador. Comprueba cuenta Auth, ausencia de administradores previos y ausencia de perfil previo para esa identidad. Crea perfil, rol y auditoría en una transacción. No cambia RLS, no envía correo ni desactiva MFA. La identificación de la cuenta propia corresponde al propietario que verifica el correo antes de copiar el UID. No hay una RPC de bootstrap pública.

`supabase/bootstrap-admin.sql` conserva su uso con variables psql. `supabase/tests/bootstrap.sql` es exclusivamente para bases locales aisladas; ninguno de esos dos archivos se pega como sustituto de este procedimiento en el panel.

La creación remota la realiza el usuario desde su panel. No compartir contraseña, claves, QR ni códigos de autenticación. El rol del sistema no concede acceso automático a las calificaciones.

## Comprobación local

`scripts/test-first-admin.ps1` crea un clúster nuevo en `work`, aplica las 20 migraciones y comprueba: marcadores sin completar, cuenta Auth inexistente, rechazo de un perfil previo, alta con enlace Auth/perfil/rol y auditoría, rechazo de repetición, 26 tablas con RLS y exigencia de `aal2` en el helper administrativo. Solo escucha en 127.0.0.1 y detiene su servidor al finalizar. No utiliza `.env.local`, Supabase ni credenciales reales. La comprobación local de claims no equivale a haber inscrito y verificado un autenticador real.

## Antes de cargar datos de ejemplo

La semilla actual rechaza cuentas y perfiles ajenos a su etiqueta sintética. Antes de cargar las 47 identidades habrá que adaptar y comprobar un procedimiento que conserve estas cuentas propias. No ejecutar la semilla mientras esa compatibilidad siga pendiente.
