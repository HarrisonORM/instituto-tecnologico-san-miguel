# Gestión de personas y permisos

Acuerdo confirmado el 8 de noviembre de 2026. La asignación de permisos la realiza un administrador del sistema activo con verificación contextual. Esta pantalla no concede acceso automático a calificaciones.

| Perfil gestionado | Opciones |
|---|---|
| Estudiante, sin otros roles | Estado de cuenta; sus funciones académicas siguen siendo personales. Sin permisos ni roles del personal. |
| Docente | Estado y roles del personal. Tareas, revisión y calificación limitadas a sus grupos asignados. |
| Administrativo académico | Estado, seis permisos independientes y roles del personal. |
| Administrador del sistema | Estado y roles del personal; las modificaciones de su propia cuenta requieren otro administrador. |

Una cuenta con varios roles figura en cada filtro correspondiente. Los seis permisos solo aparecen cuando existe el rol académico, aunque la cuenta tenga también otro rol. El listado carga las relaciones reales `user_roles` y `user_permissions`; no deduce el rol a partir del nombre ni del filtro. Esos recursos se consultan bajo las políticas existentes y se ordenan por sus claves compuestas, porque no tienen columna id.

El directorio y el detalle de la persona seleccionada comparten una vista en escritorio y se apilan en móvil. La búsqueda combina nombre/documento y rol; ignora mayúsculas y acentos. El filtro trabaja sobre el directorio cargado, sujeto al límite existente de consulta. La tabla tiene desplazamiento propio. La invitación queda en una sección independiente.

Las seis casillas muestran las funciones y una explicación de cada una. Restablecer vuelve al conjunto guardado; Guardar permisos solo se habilita si hay cambios. Cancelar la verificación conserva las selecciones. Al guardar, el foco vuelve al nombre de la persona. Cambiar de persona o filtro con un borrador pide descartarlo. Los cambios de roles del personal siguen siendo individuales y requieren su propia verificación; se bloquean mientras hay un borrador de permisos.

## Activación

Aplicar manualmente solo `supabase/migrations/202611080022_people_permissions.sql` después de 021 y antes de publicar el frontend de este bloque. No reinstalar 001–020 ni ejecutar bootstrap.sql remoto. No hay nuevas variables de entorno.

La migración audita y retira asignaciones antiguas de permisos a cuentas sin rol académico: eran ineficaces, pero podían activarse al asignar ese rol en el futuro. No borra perfiles, cuentas, calificaciones ni historial académico. Las nuevas concesiones requieren rol académico; retirarlo limpia sus permisos. Se conserva la RPC anterior para clientes antiguos con la misma restricción.

La nueva operación `set_permissions` comprueba administrador, TOTP reciente, estado del destino, selección válida y conjunto esperado. Serializa con el bloqueo utilizado por los cambios de rol. Si otra operación cambió los permisos, rechaza todo el guardado y solicita actualizar. No se escribe directamente desde el navegador en las tablas.

Si hay un error al aplicar, la transacción revierte la actualización. Revisar el error sin borrar tablas ni desactivar RLS. Una ejecución ya completada no debe repetirse. Para una reversión posterior, preparar una migración revisada: no restaurar concesiones antiguas indiscriminadamente ni quitar la protección de verificación.

## Comprobaciones y límites

Se comprobaron localmente las 22 migraciones mediante el instalador, el rechazo de una reinstalación y cuatro suites SQL: seguridad, reglas académicas, MFA contextual y permisos de personas. Incluyen rechazo a estudiantes/docentes/administrador sin rol académico, MFA ausente, selecciones inválidas, guardado conjunto, conflicto de edición y limpieza al retirar el rol. Se conservan 26 tablas públicas con RLS.

Pruebas Node: siete casos de directorio/recursos, doce de MFA y nueve de privacidad. Tipos, lint y compilación aprobados. El recorrido local utiliza los componentes reales con respuestas simuladas: filtros por rol, controles según perfil, casillas precargadas, cancelación, restablecimiento y guardado. No acredita persistencia remota. Las capturas fallaron; la evidencia es DOM/accesible, sin aprobación visual por imagen.

El error remoto previo al consultar el autenticador no está diagnosticado con esta modificación. Si reaparece, conservar el mensaje y revisar la sesión y la respuesta de Auth; no quitar ni reinscribir el factor para eludirlo. No se enviaron correos, aplicaron migraciones remotas, cargó semilla ni desplegó desde el agente.
