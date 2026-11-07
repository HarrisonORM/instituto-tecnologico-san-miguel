# Ampliación del backend: código pendiente de validación

Se continúa por instrucción del usuario sin ejecutar pruebas, compilaciones, migraciones, cargas, copias ni despliegues. Las funciones siguientes están escritas localmente; no se han observado funcionando en Supabase.

El adaptador normaliza los resultados de fila única de reserva, inspección e invitaciones cuando PostgREST los envía como lista de una fila. Las listas y funciones escalares conservan su contrato. Se contrastó la representación con la [documentación de PostgREST](https://docs.postgrest.org/en/latest/references/api/resource_representation.html); no se ejecutaron estas funciones para comprobarlo.

## Migraciones posteriores al núcleo

| Número | Contenido |
|---|---|
| 006 | Editar estructura, retiro por archivado, retirar asignaciones sin historial y cancelar solicitudes de eliminación. |
| 007 | Eliminación coordinada, marca deleting, comprobación de historial, bloqueo de nuevas relaciones y finalización con auditoría. |
| 008 | Conciliación de invitaciones y devolución de un resultado ya completado. |
| 009 | Estado de inspección, congelación de archivos durante su lectura y exigencia de inspección antes de adjuntar. |
| 010 | Oferta pública optativa, límites del gateway y campos de semilla y reserva. |
| 011 | Contadores por rol y resultados propios de materia. |
| 012 | Recibos de idempotencia de operaciones académicas. |
| 013 | Reserva por archivo, reconciliación del presupuesto y métricas administrativas. |
| 014 | Búsqueda paginada, colas de revisión, tareas del estudiante y notificaciones. |
| 015 | Longitudes, tamaños y consistencia entre carreras, materias, grupos y categorías. |
| 016 | Bloqueos de avatar y descarte para coordinar cambios concurrentes. |

Aplicación futura: migraciones 001 a 016 en orden, después de la revisión aplazada. No se ha ejecutado ninguna. No asumir que una migración posterior corrige una instalación parcial sin comprobar qué se aplicó.

## Nuevas operaciones HTTP

POST /api/backend/{operation} incorpora:

| Operación | Parámetros |
|---|---|
| edit_structure | p_kind, p_id, p_data |
| retire_structure | p_kind, p_id |
| remove_assignment | p_group, p_user, p_kind |
| cancel_deletion | p_request |
| notification_count / mark_all_notifications | objeto vacío |
| set_public_offer | p_program, p_description, p_price_label, p_published |
| dashboard_counts | p_mode |
| my_subject_result | p_group |
| search_roster | p_group, p_search, p_limit, p_offset |
| teacher_work_queue | p_group, p_state, p_search, p_limit, p_offset |
| student_task_feed | p_period, p_limit, p_offset |
| operational_snapshot / reconcile_storage_budget | objeto vacío |
| discard_upload | p_upload |

Las búsquedas devuelven como máximo cien filas; la cola docente acepta all, pending, missing, graded y late. Los contadores por rol revalidan el rol y el recurso, sin conceder a administración de cuentas acceso al contenido de notas.

GET /api/public/catalog devuelve exclusivamente carreras publicadas y no archivadas, con descripción y precio ilustrativo. El indicador fictional_institution identifica la institución ficticia. Su respuesta pública correcta puede almacenarse cinco minutos en CDN; errores y respuestas privadas no comparten esa caché.

## Eliminación definitiva

POST /api/admin/deletions/{requestId} requiere sesión administrativa con MFA y BACKEND_ENABLE_HARD_DELETE=true. La plantilla lo deja en false. La fase inicial exige dos administradores distintos, activos y ajenos a la cuenta objetivo. Revalida historial y archivos, protege al último administrador y congela la cuenta en deleting antes de llamar a Auth.

La eliminación de Auth y la limpieza local son pasos distintos: un error conserva la solicitud executing y la cuenta congelada. Repetir la misma solicitud permite conciliar el resultado, incluido un 404 de Auth. La finalización comprueba que Auth ya eliminó su vínculo y vuelve a revisar historial. Se conservan identificadores y eventos de auditoría; los datos personales del trabajo de invitación de esa cuenta se redactan.

Las relaciones académicas nuevas con una cuenta en deleting se bloquean mediante triggers. El procedimiento no elimina cuentas con historial ni borra evidencias de entregas. No activar este ejecutor antes de revisar y validar los casos de concurrencia y recuperación.

## Invitaciones

POST /api/admin/invitations/{jobId} busca la cuenta Auth del correo de un trabajo autorizado y concilia el perfil pendiente. No adopta perfiles existentes ni reenvía automáticamente un mensaje. Las invitaciones completadas devuelven su resultado al repetir la misma clave y el mismo contenido.

Todavía se necesita una experiencia administrativa para revisar errores permanentes, cancelar una intención sin cuenta Auth y resolver manualmente identidades en conflicto. Nunca se ha enviado correo desde estos scripts durante el desarrollo.

## Archivos y presupuesto

POST /api/files/{id}/inspect lee como máximo dos millones de bytes, comprueba firmas básicas PNG/JPEG/PDF y calcula SHA-256. El estado inspecting impide sustitución o borrado por el propietario durante la inspección. Solo el servidor con clave privilegiada puede marcar verified. La entrega y el avatar requieren ese estado.

Esto no es un antivirus ni un parser completo de formatos; un archivo que supera estas firmas todavía puede contener contenido dañino. Las descargas usan attachment y nosniff. Los límites efectivos, la inspección y los rechazos deben probarse con la política de Storage real.

DELETE /api/files/{id} descarta solo un archivo propio sin vínculos, retira el objeto mediante las políticas del usuario y libera su reserva. Un fallo conserva un estado conciliable; no borra una entrega ni una foto todavía referenciada.

operational_snapshot muestra tamaño de base, presupuesto de archivos, inspecciones y trabajos pendientes. reconcile_storage_budget incluye objetos sin reserva en el presupuesto, sin borrarlos. El máximo conservador se guarda por reserva para que un cambio de configuración no altere su devolución.

## Idempotencia y solicitudes

publish_task, submit_work, review_work, add_comment, close_period y manage_structure admiten Idempotency-Key UUID. La intención y el resultado se conservan en una transacción durante 24 horas; reutilizar una clave con parámetros distintos se rechaza. El replay vuelve a comprobar permisos.

El almacén se limita a mil recibos y 65.536 bytes de argumentos por recibo. El bloqueo global es una elección sencilla para esta escala de demostración, no una solución de alta concurrencia. Estos valores son límites técnicos iniciales configurables mediante una migración, no reglas académicas.

El gateway consume límites por usuario y minuto: 120 lecturas, 30 escrituras, 15 operaciones de archivo y 10 administrativas. Son límites de las rutas de la aplicación; no sustituyen los límites del proveedor ni restringen todas las solicitudes directas a PostgREST o Storage. La privacidad sigue dependiendo de RLS y los permisos SQL, aunque se evite el gateway. Controlar abuso y transferencia global sigue siendo parte de la validación operativa pendiente.

## Cliente sin pantallas

src/contracts/academic.ts define modelos. src/client/api.ts guarda la sesión en memoria, coordina renovación y descarta respuestas de una sesión anterior. src/client/evidence.ts reserva, sube, solicita inspección y confirma la entrega con una clave de intención.

No hay persistencia de tokens en localStorage ni diseño visual aplicado. Faltan el manejo visual de cargas pendientes, confirmaciones, reautenticación, recuperación y accesibilidad. La pregunta sobre el objetivo principal de la landing está pendiente; la selección visual sigue abierta.

## Semilla y copias: comandos preparados, NO ejecutados

`npm.cmd run seed:demo` exige DEMO_SEED_ALLOWED=true, DEMO_ACCEPT_SAMPLE_DATA=true, DEMO_PROJECT_REF coincidente y DEMO_SEED_PASSWORD de al menos dieciséis caracteres. Rechaza cuentas o perfiles ajenos a su etiqueta. Las identidades usan .invalid y Auth administrativo, sin correos. Cada contraseña se deriva de forma distinta mediante HMAC; el valor de entorno actúa como secreto maestro, no como contraseña compartida.

La estructura propuesta contiene dos carreras, cuatro materias, seis grupos, un período y dos categorías 60/40, con tareas y estados variados. Los nombres, fechas y porcentajes son datos de ejemplo sujetos a aceptación para la demostración, no decisiones institucionales aprobadas. La semilla no aplica migraciones y no debe usarse en un proyecto con datos reales. No cambia contraseñas de cuentas que ya existen en una repetición.

`npm.cmd run demo:credential -- persona-01` puede mostrar una credencial ficticia únicamente al operador local si DEMO_CREDENTIAL_ACCESS=true. Es una consulta sensible deliberada; nunca ejecutarla en CI, servidor, logs públicos o chat. No se ha ejecutado durante este trabajo.

`npm.cmd run backup:project` requiere BACKUP_ALLOWED=true, BACKUP_PROJECT_REF, DATABASE_URL, clave de servidor y pg_dump disponible. Usa verify-full y el certificado raíz que configure el operador, sin poner contraseñas en argumentos. Guarda dump de public/private/auth/storage, objetos de evidence y un manifiesto con huellas en backups/, excluido de Git.

Una copia interrumpida conserva complete=false. Complete=true indica que terminaron los pasos de escritura, no que la copia se haya restaurado ni que forme una instantánea atómica con Storage. Hay que detener escrituras para una copia coherente, revisar versión y objetos administrados de Supabase y preparar la restauración en un destino aislado. No hay restauración automática ni ejecución de copias en este bloque. Los permisos de archivo de Node no sustituyen las ACL del equipo ni el cifrado de la copia.

## Pendientes materiales

- Toda ejecución y validación de SQL, tipos, APIs, RLS, concurrencia, TOTP, correo, semilla, copias y restauración.
- Fórmula provisional, matrícula tardía, cambios de evaluación y reapertura, vigencia de reemplazos y ajustes de notas al corregir: siguen pendientes de acuerdo.
- Antivirus o análisis completo, protección de abuso y egress por proveedor, conciliación de errores de operador y herramientas de restauración revisadas.
- Elección visual y pantallas, integración de correo real y despliegue cuando se retome esa fase.
