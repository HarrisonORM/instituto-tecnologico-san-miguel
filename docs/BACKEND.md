# Backend: implementación local pendiente de validar

Por decisión del usuario se adelanta el backend y se aplaza la ejecución de pruebas y el despliegue. El bloque original escribió código sin aplicar SQL a Supabase ni enviar invitaciones. Los resultados parciales del avance de frontend posterior están registrados en docs/ESTADO.md; no acreditan el conjunto. No se declara el backend completo ni listo para producción.

La ampliación original comprende migraciones 006 a 016, ejecución coordinada de eliminación, conciliación, inspección de archivos, idempotencia, modelos de lectura y herramientas operativas. El contrato adicional y sus límites están en [Backend y operaciones](BACKEND-OPERACIONES.md). Los [recorridos](RECORRIDOS.md) preparan el frontend sin elegir una dirección visual.

## Ampliación de frontend y servicios privados

El conjunto actual tiene 19 migraciones, sin aplicar. Las 017 a 019 preparan contacto privado, traducciones revisadas y marcado auditado de contactos. Se añadieron mfa-list, validación de contraseña de 12 a 128 caracteres y consumo de presupuesto de lectura para RPC de consulta. El frontend institucional utiliza tokens Bearer solo en memoria, enlaces de activación/recuperación y los contratos existentes. Ver docs/FRONTEND-IMPLEMENTADO.md y docs/VALIDACION-PENDIENTE.md para resultados parciales y límites actuales; el aplazamiento de pruebas continúa.

## Estructura

- `supabase/migrations/202611070001_backend.sql`: estructura académica, RLS, funciones transaccionales y almacenamiento.
- `202611070002_accounts.sql`: aprovisionamiento, permisos específicos y notificaciones leídas.
- `202611070003_upload_lifecycle.sql`: eliminación de borradores y liberación de reservas.
- `202611070004_academic_support.sql`: carrera del perfil, solicitudes de identidad, roles, calendario y rúbricas.
- `202611070005_invitation_jobs.sql`: registro persistente de intentos de invitación y rechazo de reenvíos con la misma clave de idempotencia.
- `supabase/fixtures/accounts.json`: 47 identidades ficticias preparadas, sin contraseñas y sin crear usuarios de Auth ni enviar correo.
- `supabase/bootstrap-admin.sql`: alta manual del primer administrador por el propietario, mediante variables psql. Nunca promociona automáticamente al primer usuario registrado.
- `src/server/backend.ts`: acceso REST a Supabase, validación del usuario ante Auth y estado activo, límites de cuerpo, respuestas y catálogo de operaciones permitido.
- `src/app/api/`: rutas de autenticación, operaciones académicas, invitaciones y archivos privados.

Las migraciones se aplicarían en orden numérico sobre un proyecto dedicado después de la revisión y validación aplazadas. Son una primera versión no aplicada; no son idempotentes ni una actualización de un esquema existente. Cada archivo contiene su transacción. La migración crea un bucket llamado evidence y tablas nuevas: revisar conflictos antes de ejecutarla.

## Contrato HTTP

Las rutas protegidas reciben `Authorization: Bearer <access_token>`. El token se valida consultando Auth; no se confía en un JWT simplemente decodificado. Las consultas posteriores conservan el token del usuario para aplicar RLS. Los módulos académicos no utilizan la clave administrativa.

Las respuestas JSON utilizan `{ "data": ... }` o `{ "error": "..." }` y Cache-Control: no-store. Los mensajes internos de PostgreSQL se ocultan, salvo excepciones de negocio explícitas de las funciones. No se registran contraseñas ni tokens.

GET /api/me devuelve el perfil propio y sus roles y permisos actuales, usando RLS. No asigna roles a partir de metadatos editables de Auth.

### Autenticación: POST /api/auth/{action}

| Acción | Campos JSON | Finalidad |
|---|---|---|
| login | email, password | Iniciar sesión y comprobar perfil activo. |
| refresh | refresh_token | Renovar y volver a comprobar el estado de la cuenta. |
| recover | email | Solicitar correo de recuperación con retorno definido por el servidor. |
| verify | token_hash, type | Canjear verificación de invite, recovery o email. |
| password | password | Cambiar contraseña de una sesión activa. |
| logout | objeto vacío | Cerrar la sesión en Auth. |
| mfa-list | objeto vacío | Enumerar factores propios sin revelar secretos. |
| mfa-enroll | objeto vacío | Inscribir factor TOTP. |
| mfa-challenge | factor_id | Pedir desafío TOTP. |
| mfa-verify | factor_id, challenge_id, code | Verificarlo y obtener los nuevos tokens que debe conservar el cliente. |

No existe endpoint de registro público. Desactivar también Allow new users to sign up en Supabase al configurar el entorno. MFA se exige en las funciones administrativas mediante aal2. El frontend implementado conserva los tokens Bearer en memoria y procesa enlaces de activación/recuperación. No hay sesión persistida en cookies ni localStorage; recargar requiere iniciar sesión de nuevo. La integración real del correo no está validada.

### Lectura: GET /api/backend/{resource}

Recursos: profiles, programs, periods, subjects, groups, teacher_groups, enrollments, categories, tasks, submissions, submission_versions, comments, grade_history, final_results, notifications, audit_events, deletion_requests, uploads, identity_requests, calendar_events, rubrics e invitation_jobs.

Paginación: `limit` entre 1 y 100, por defecto 25; `offset` entero no negativo. Filtros de igualdad: id, group_id, task_id, submission_id, period_id, subject_id, student_id, program_id y user_id. Solo usar columnas existentes en el recurso. No se acepta una expresión SQL, selección de columnas o ruta arbitraria del cliente.

Las lecturas siguen las políticas de cada recurso. Un docente obtiene la lista mínima de nombres mediante group_roster; no recibe por ello documentos, direcciones o fechas de nacimiento de sus estudiantes. El administrador de cuentas no recibe acceso automático a entregas o notas.

### Escritura: POST /api/backend/{operation}

Los campos se envían con los nombres p_* definidos en las funciones SQL. La lista permitida también está en src/server/backend.ts; cualquier otra operación o parámetro se rechaza.

| Operación | Campos principales |
|---|---|
| update_my_profile | p_address, p_avatar_path opcional |
| group_roster | p_group |
| manage_structure | p_kind, p_data |
| set_evaluation | p_subject, p_period, p_categories |
| publish_task | p_groups, p_title, p_description, p_due_at, p_category_name, p_students opcional |
| submit_work | p_submission, p_body, p_uploads opcional |
| review_work | p_submission, p_action, p_grade y p_comment opcionales |
| add_comment | p_submission, p_body |
| close_period | p_period |
| reserve_upload | p_bytes, p_mime |
| release_upload | p_upload |
| manage_account | p_user, p_state |
| correct_identity | p_user, p_name, p_document, p_birth |
| request_deletion | p_user |
| approve_deletion | p_request |
| set_permission | p_user, p_permission, p_enabled |
| set_role | p_user, p_role, p_enabled |
| register_account | Uso interno de la ruta de invitaciones; no se expone en el proxy genérico. |
| mark_notification | p_notification |
| request_identity_change | p_proposed, p_reason |
| resolve_identity_request | p_request, p_accept |
| assign_program | p_user, p_program |
| add_calendar_event | p_period, p_title, p_start, p_end |
| set_rubric | p_task, p_criteria |

manage_structure admite program, period, subject, group, enrollment y teacher_assignment. p_data utiliza las columnas del tipo elegido. La creación de un grupo necesita subject_id, period_id y name. enrollment y teacher_assignment reciben group_id y user_id. El código bloquea matrícula después de publicar actividades hasta definir su aplicabilidad académica.

set_evaluation recibe una lista de objetos name/weight, que debe sumar exactamente 100. Las actividades posteriores bloquean cambios del esquema hasta que se defina la política de modificaciones. Cada grupo recibe su propia tarea al publicar en varios grupos, dentro de una única transacción; p_students limita los destinatarios a matriculados en esos grupos.

review_work admite grade y authorize_replacement. El reemplazo consume una autorización incluso antes de la primera calificación y conserva las versiones. Una versión nueva vuelve a quedar pendiente de revisar; la nota anterior sigue en grade_history. Las fechas se registran en el servidor y las tardías se marcan sin restar puntos.

El cierre bloquea entregas sin revisar, asigna cero a las no entregadas y calcula promedios iguales por actividad dentro de categorías ponderadas. Redondea una sola vez a un decimal y determina aprobación desde 3.0. Las categorías sin actividades aplicables bloquean el cierre: todavía no hay una política aprobada para redistribuirlas. No se implementó una fórmula provisional no acordada.

### Invitaciones: POST /api/admin/invitations

JSON: email, full_name, role. Encabezado obligatorio Idempotency-Key: UUID por intención de invitación. Requiere administrador activo con MFA y dominio institucional configurado. El servidor usa SUPABASE_SECRET_KEY para Auth y el JWT del administrador para aprovisionar el perfil. Esa clave no se expone al navegador.

El alta en Auth y en PostgreSQL no es atómica. Antes de enviar se registra invitation_jobs. Si la invitación se envía pero falla el perfil, se devuelve 409 y el usuario sin perfil no obtiene datos. Una clave ya registrada no provoca un segundo envío; un resultado ambiguo queda pendiente de conciliación y no se reintenta automáticamente. La migración 008 y la ruta administrativa de conciliación preparan ese procedimiento y la devolución del resultado completado. Ninguna invitación se envió durante este desarrollo.

### Archivos

reserve_upload prepara un identificador y ruta propios. La carga se realizaría directamente mediante la API de Storage con clave publicable y JWT; el bucket privado limita formatos y tamaño. No admite sobrescritura. submit_work vincula archivos existentes al autor y a una versión y comprueba sus metadatos.

GET /api/files/{id} vuelve a comprobar sesión y RLS y transmite un archivo verificado como descarga, sin URL pública duradera. DELETE coordina el descarte, la retirada de un borrador sin vínculos y la liberación de la reserva. Las versiones entregadas y los avatares referenciados quedan protegidos frente a ese borrado.

Los valores iniciales de capacidad son configurables en private.storage_budget: 250 MB totales, 2 MB por archivo y tres adjuntos. Son parámetros técnicos provisionales tomados de las propuestas, no nuevos acuerdos académicos. Se reserva el máximo del archivo para impedir subdeclaraciones de tamaño; esto reduce la capacidad práctica, especialmente con fotos pequeñas. Se añadieron conciliación del presupuesto y firmas básicas de contenido; todavía falta análisis completo o antivirus. Estos controles no se han validado contra Storage.

## Administración y permisos

Roles: student, teacher, academic_admin, system_admin. Permisos específicos: structure.manage, enrollment.manage, evaluation.manage, identity.manage y period.close. Requieren el rol académico y MFA. Los cambios de roles y estados protegen el último administrador y evitan que el actor modifique su propio rol o estado.

Las solicitudes de eliminación requieren dos administradores distintos con MFA. El ejecutor está escrito en la migración 007 y su ruta administrativa, pero permanece deshabilitado con BACKEND_ENABLE_HARD_DELETE=false hasta validar su procedimiento. Revalida historial, congela relaciones y coordina Auth y limpieza local conservando la auditoría. Las operaciones ordinarias siguen siendo suspender, reactivar y archivar.

## Configuración para la fase posterior

La plantilla .env.example añade SUPABASE_SECRET_KEY, INSTITUTION_EMAIL_DOMAIN y AUTH_RECOVERY_REDIRECT_URL vacíos. No se necesitan valores para escribir este código. El retorno se fija en el servidor y no se toma del cliente. El dominio se debe decidir antes de enviar invitaciones; los usuarios ficticios no reciben correo.

## Trabajo pendiente antes de considerar terminado el backend

- Aplicación y revisión de las migraciones, SQL y relaciones; pruebas de permisos positivos y negativos, concurrencia, suspensión y cierre.
- Fórmula aprobada del promedio provisional; reglas de modificaciones y reaperturas; caducidad de reemplazos y matrícula tardía.
- Validar eliminación con doble autorización, conciliación e idempotencia implementadas; completar herramientas visuales de gestión de incidencias.
- Ejecutar posteriormente bootstrap o semilla de 47 identidades, revisar sus datos propuestos, inscribir MFA y preparar recuperación administrativa.
- Validar inspección y presupuesto implementados, límites persistentes y herramientas de copia; añadir análisis completo, protección ante abuso directo y restauración revisada.
- Concretar los retiros con historial, cambios de fechas con actividad y reasignaciones que requieren política académica. Edición nominal y archivado básico ya tienen código.
- Correo real, integración del cliente, despliegue y validación funcional. El código escrito todavía no se ha ejecutado.

Referencias consultadas para la implementación: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [funciones PostgreSQL](https://supabase.com/docs/guides/database/functions), [Storage](https://supabase.com/docs/guides/storage/security/access-control) y [contrato de Auth](https://github.com/supabase/auth/blob/master/openapi.yaml). Son referencias técnicas, no resultados de pruebas de este proyecto.
