# Estado y siguiente paso

## Bienvenida y enlace de activación preparados (8 de noviembre de 2026)

El usuario recibió una invitación de Supabase, informó que no pudo crear su contraseña y pidió correo de bienvenida del Instituto con enlace de activación. La pantalla exacta/mensaje sigue pendiente de su respuesta. Se encontró que la ruta de invitación no enviaba redirect_to; se corrige para /auth/confirmar y se comparte su validación con recuperación, mediante AUTH_RECOVERY_REDIRECT_URL existente. No se afirma que sea la única causa del fallo remoto.

Plantilla HTML de bienvenida en supabase/templates/invite.html y guía manual en CORREO-BIENVENIDA.md. El enlace transporta TokenHash en fragmento, el formulario lo captura en memoria y limpia la URL; no verifica ni consume el enlace al abrirlo, sino al enviar la contraseña. Se conservan enlaces antiguos en query y fragmentos de sesión. Se mejoran estados inicial, ausente y expirado con ES/EN y requisito de 12 caracteres; metadatos de la pantalla sin indexación ni referrer. No se quita MFA existente ni se amplían roles.

15 pruebas de invitación/interpretación y 11 de MFA contextual aprobaron sin red externa. Build, tipos y lint código 0. Se observaron en navegador local bienvenida, botón, formulario, ausencia de consumo al abrir, discrepancia de contraseñas, una verificación/una escritura al confirmar y navegación al campus. Correo sin overflow a 390/990px; error de expiración en ES/EN. Las respuestas son simuladas y no acreditan persistencia Supabase ni compatibilidad de todos los clientes de correo. Captura fallida: evidencia DOM/accesible. Detector único: dos warnings de fuentes y tres advisory de valores locales del correo; son excepciones de compatibilidad email documentadas, no cambios de tipografía global.

Siguiente paso: publicar el nuevo commit, comprobar AUTH_RECOVERY_REDIRECT_URL y URL Configuration y pegar manualmente asunto/HTML en Invite user. Una invitación ya recibida no cambia: si venció/usó, utilizar recuperación con el mismo correo, sin borrar la cuenta. No se cambió ningún servicio remoto ni se envió otro mensaje desde el agente. No hay SQL nuevo ni costes añadidos.


## Correos personales en invitaciones (8 de noviembre de 2026)

El usuario obtuvo «Correo institucional no permitido» e informó que no tiene dominio propio. El bloqueo estaba en la ruta de la aplicación: exigía INSTITUTION_EMAIL_DOMAIN y la coincidencia del destinatario, antes de preparar el trabajo o solicitar el envío a Auth. Se eliminó esa exigencia, se normaliza la dirección y se valida su formato. La variable se retira de .env.example; si quedó en Vercel, el nuevo código la ignora. No se requieren dominio comprado, migración SQL ni cambios de claves.

Acceso, recuperación e invitación dicen «Correo electrónico / Email address». Se mantiene la comprobación de sesión activa, administrador y MFA, roles admitidos, idempotencia y registro público deshabilitado. Ocho pruebas locales ejecutan la ruta y el transporte reales con fetch simulado: Gmail con variable antigua, Outlook sin variable, direcciones mal formadas, falta de sesión, permiso/MFA denegado, cuenta suspendida, rol inválido y recibo completo sin reenvío. Pasaron sin red ni lectura de .env.local. El detector único de los dos TSX modificados no produjo hallazgos; es un cambio de copy sin modificación de composición, no una nueva revisión visual.

La compilación de producción, tipos y lint terminaron con código 0. El primer lint detectó referencias Request/Response sin calificar dentro de la prueba; se corrigieron a globalThis sin cambiar configuración global. Las ocho pruebas volvieron a pasar. No se ejecutaron suites SQL porque este cambio no modifica la base.

Las dos direcciones probadas por el usuario no acreditan entrega: el error informado bloquea antes del envío. La configuración SMTP no está confirmada; sigue pendiente distinguir remitente predeterminado restringido, SMTP personalizado y resultado de una invitación completa. No se envió correo ni se cambiaron Supabase/Vercel desde el agente. Siguiente paso: publicar el commit nuevo y revisar SMTP antes de repetir las invitaciones.


## Verificación contextual preparada (8 de noviembre de 2026)

El usuario confirmó factor verified y el mensaje de verificación completada en su sesión. Después solicitó retirar el formulario permanente de Seguridad. Se implementó un diálogo compartido que identifica acción/destino, explica consecuencias, admite Cancelar/Escape y retiene el formulario. Seguridad conserva estado/configuración inicial. Cambio y recuperación de contraseña piden autenticador si existe un factor verificado. Las lecturas privilegiadas se separan de las escrituras protegidas, sin ampliar roles ni acceso a notas. Se conserva por ahora la cobertura administrativa anterior; no se recibió respuesta a la pregunta opcional sobre limitarla.

La migración 021 exige aal2 y TOTP reciente (90 segundos) para operaciones ya protegidas y mantiene 26 tablas públicas con RLS. Es una ventana de frescura, no un permiso de un solo uso vinculado a una operación. No modifica factores ni usuarios. Debe aplicarla el propietario después de 001–020 y antes de publicar el frontend nuevo. No reinstalar la base ni ejecutar bootstrap.sql remoto.

Comprobaciones locales: 21 migraciones mediante instalador transaccional, rechazo de reinstalación y tres suites SQL (seguridad, académica, MFA contextual), código 0. Once pruebas del cliente y nueve pruebas de privacidad aprobadas. Lint, tipos y compilación finales terminaron con código 0 después del cambio de foco. El instalador del primer administrador también se comprobó con 21 migraciones; no se creó otra cuenta remota.

Navegador local con respuestas sintéticas: código inválido y Cancelar no escriben; código válido archiva; cancelar durante verificación mantiene cero escrituras incluso después de aceptarse el código; fallo al consultar factores no ofrece configurar otro; recuperación con factor exige código, Escape retiene contraseña y la aceptación produce una escritura y navegación al campus. El foco inicial llega al código y, tras Cancelar, vuelve a Guardar estado. Escritorio 990×760 y móvil 390×844 sin overflow observado; las capturas fallaron, por lo que hay evidencia DOM/accesible, sin aprobación visual por imagen ni suite E2E automatizada. El detector único produjo 59 avisos de deriva en CSS, incluidos valores locales intencionales del nuevo componente documentados en DESIGN.md; no se reparó ni canonizó la deriva histórica.

Siguiente paso: seguir docs/VERIFICACION-CONTEXTUAL.md para aplicar únicamente 021 y publicar el commit. Todo este bloque es local: sin push, despliegue, correos ni escrituras Supabase. La entrega real de correo, recuperación asistida y recorrido conectado por roles siguen pendientes. Antes de una semilla remota, adaptar su rechazo de cuentas ajenas a la etiqueta sintética para conservar el administrador propio.

Los apartados siguientes describen bloques anteriores; sus pendientes de MFA se actualizan con la confirmación del usuario indicada arriba.


## Confirmación MFA conservada durante la recarga

El usuario confirmó el alta del primer administrador y después informó que no apareció el mensaje de verificación. Se encontró un defecto local: refreshUser cambiaba el usuario y la carga sustituía SecurityPanel por skeletons, desmontándolo y perdiendo el estado del mensaje. Se corrigió su montaje para que permanezca en la vista Seguridad; el éxito se muestra al aceptar el código y una recarga posterior fallida se distingue de un código rechazado. El QR/clave manual se retiran al aceptar el código. No se alteran RLS, roles, MFA ni endpoints de autenticación.

Lint y build de producción terminaron con código 0; nueve pruebas de privacidad aprobaron. Los componentes reales se probaron en un servidor HTTP local con respuestas sintéticas (sin .env.local ni Supabase): aceptación y persistencia después de Actualizar; rechazo sin éxito; aceptación seguida de fallo de consulta con aviso específico. En escritorio DOM990×720 y móvil390×844 se observó la confirmación; en móvil su posición fue713–766px, dentro de844px, sin desbordamiento. No se lograron capturas automáticas: la evidencia es accesible/DOM y no una aprobación visual por imágenes. El detector manual del único TSX modificado no produjo hallazgos. Las pruebas de navegador son escenarios observados, no una suite E2E automatizada. Reproducción controlada: npm.cmd run qa:mfa; es exclusivamente un servidor local de datos simulados.

El cambio está en el equipo, sin push ni despliegue. El estado remoto de MFA sigue pendiente: se preparó una consulta de solo lectura limitada al UID propio del usuario, que devuelve únicamente tipo/estado y nunca QR, secretos, códigos o tokens. Un factor verified no demuestra aal2 de la sesión de navegador actual. Pasos en MFA-COMPROBACION.md. No se deben reenrolar ni eliminar factores solo por ausencia del mensaje.


## Publicación observada y primera cuenta Auth creada

La dirección pública es https://instituto-tecnologico-san-miguel.vercel.app. El agente observó la landing y la respuesta `{"status":"ok","service":"instituto-san-miguel"}` en `/api/health`; eso no acredita todavía acceso a datos, cuentas o archivos. En esa observación la portada conservaba la animación anterior de 22 segundos. Un Redeploy de un commit anterior no incorpora el commit local de movimiento por sí solo.

El usuario informó que añadió las URL de autenticación en Supabase y cambió las claves. Se le indicó configurar `AUTH_RECOVERY_REDIRECT_URL` para Production en Vercel y ejecutar Redeploy; no se inspeccionaron variables ni credenciales remotas. Posteriormente confirmó que creó su cuenta Auth propia. Esto es confirmación del usuario, no una lectura autenticada del directorio por el agente.

Se preparó `supabase/bootstrap-admin-dashboard.sql` y la guía `docs/PRIMER-ADMINISTRADOR.md`. La plantilla permite al propietario vincular únicamente el primer perfil/rol de sistema con comprobaciones y auditoría. La ejecución remota y MFA siguen pendientes. No se ha creado un administrador desde el agente ni se envió correo.

Validación de la plantilla en una base local nueva con las 20 migraciones: marcadores y cuenta inexistente rechazados; perfil previo no elevado; primer perfil/rol/enlace Auth y auditoría creados; repetición rechazada; 26 tablas con RLS y helper administrativo falso para `aal1`/verdadero para `aal2`. El primer intento local encontró una restricción de conexión del entorno de ejecución; se detuvo su proceso propio y la ejecución permitida posterior terminó con código 0. No se conectó al servicio remoto ni se inspeccionaron claves. Prueba reproducible en `scripts/test-first-admin.ps1`; la inscripción real del autenticador sigue pendiente.

Antes de cargar la semilla debe adaptarse su rechazo actual de cuentas ajenas a la etiqueta sintética: las cuentas administrativas propias deben conservarse. No ejecutar la carga existente tras crear estos perfiles sin resolver primero esa compatibilidad.

## Movimiento de portada corregido localmente

El usuario informó que la imagen principal no se movía. Se hizo más perceptible el acercamiento de la fotografía: ciclo alterno de 18 segundos, escala 1.03–1.12 y desplazamiento horizontal de ±0.7 %. Se conserva la composición B+C y la misma fotografía; no se agregan vídeo, dependencias ni servicios.

La preferencia del dispositivo determina el comportamiento inicial. «Activar movimiento» y «Pausar movimiento» guardan una elección explícita que sobrevive a la recarga. Una pausa antigua se conserva; el antiguo valor false sigue la preferencia del dispositivo. El efecto se pausa fuera de pantalla y cuando se oculta la pestaña. Esta última ruta está implementada, pero no se simuló una ocultación real durante la comprobación.

Verificado localmente: 13 pruebas de preferencias y arranque previo a React, lint y compilación de producción con código 0. En navegador se observó cambio de transformación al reproducir, transformación estable al pausar, persistencia tras recargar y pausa al salir del hero. Capturas de escritorio 990×720 y móvil 390×844; sin desbordamiento horizontal también a 1440 px. Evidencia en `.impeccable/review/motion-*`. La comprobación corresponde al equipo local; no se hizo push ni despliegue.

Revisión independiente completada: conservó la composición y señaló dos ajustes documentales. Ambos se puntuaron resolved con disposition: ship al alcance de esas correcciones; no equivale a aprobación global de seguridad o integración. DESIGN.md y su sidecar reflejan el comportamiento actual.

Siguiente bloque de integración: confirmar URL pública final y sustitución/revocación de la Secret expuesta anteriormente, configurar retornos de autenticación y preparar las primeras cuentas administrativas con MFA. Después comprobar docente → tarea → entrega privada del estudiante → calificación. Las cuentas y cambios remotos requieren ejecución controlada; no se crean desde esta corrección visual.

## GitHub preparado y guía de primera publicación

El usuario informó que la instalación SQL terminó bien, que completó Secret y que creó/subió el repositorio GitHub. No aportó la fila final de instalación; queda como confirmación del usuario, sin una lectura remota adicional del agente.

Se comprobó el remoto local `https://github.com/HarrisonORM/instituto-tecnologico-san-miguel.git`, repositorio sin cambios pendientes al iniciar este bloque, y `.env.local` ignorado/no versionado actualmente. La revisión de variables solo informó presencia: URL, Publishable y Secret configurados; dominio institucional, retorno de recuperación y secreto de contacto pendientes. No se imprimieron valores ni se autenticó la clave Secret contra Supabase.

Guía lista: [Publicar en Vercel](PUBLICAR-VERCEL.md). Configuración propuesta: Hobby personal, Next.js, raíz del repositorio, rama main, Node 22.x, npm run build y variables para Production. Sin Vercel conectado al agente, no se configuraron permisos de GitHub, variables remotas ni despliegue. Falta observar una URL pública en Ready y comprobarla.

El usuario pidió conocer lo que falta del plan inicial. Inventario en [Pendientes hasta la entrega](PENDIENTES-HASTA-ENTREGA.md). Sigue pendiente completar el promedio provisional ponderado del servidor: la migración 011 devuelve `pending_academic_policy`; el promedio de muestra no lo sustituye. También falta confirmar el mecanismo suficiente de traducción académica y el alcance de adjuntos, además de cuentas reales controladas, MFA, correo, archivos, copias/restauración y PWA comprobados.

Comprobación del bloque: revisión de configuración, código relevante, enlaces oficiales y coherencia documental; sin cambios de aplicación ni nuevas pruebas de compilación necesarias. No se hizo push ni despliegue desde el agente.

---

## Auth confirmado por el usuario e instalador preparado

El usuario compartió una comprobación correcta de Auth con el registro público desactivado y una captura sin tablas en public. Es evidencia aportada por el usuario; no se leyeron claves ni se hizo una consulta remota adicional.

Se preparó scripts/prepare-database.mjs: concatena las veinte migraciones en una sola transacción, conserva sus bloques internos y sus hashes, y excluye bootstrap, pruebas, cuentas y secretos. La instalación se detiene si ya encuentra objetos de la aplicación.

Verificación local ejecutada: scripts/test-database.ps1 -InstallBundle terminó con código 0, creó 26 tablas públicas con RLS y un depósito privado, rechazó repetir la instalación y aprobó ambas suites SQL. Lint código 0. No se ha instalado en Supabase ni se han enviado correos.

Siguiente paso: el usuario puede revisar y ejecutar el archivo completo en SQL Editor del proyecto dedicado; guía en [Instalar la base](INSTALAR-BASE.md). Esperar su resultado antes de afirmar que existen tablas remotas.

---

## Ajustes de catálogo, presentación y privacidad por rol

7 de noviembre de 2026. Selector de tema unificado, cabecera móvil compacta y cinco programas con fotografía y páginas ES/EN. Contacto acepta los cinco programas en servidor y migración 020; semilla preparada para cinco carreras, sin añadir personas, materias ni grupos. No se ejecutó remotamente.

Se retiraron de toda la interfaz los avisos que llamaban ficticia a la institución y los selectores globales de rol/persona. La vista previa conserva una cuenta de ejemplo fija por rol. El estudiante no recibe directorio ni asignaciones de docentes y solo ve sus materias, entregas y resultados. Docentes tienen sus grupos; la navegación y formularios administrativos se restringen por permisos. La sesión institucional sigue usando el rol devuelto por el servidor, sin confiar en parámetros de URL.

Comprobado sobre este bloque: lint y tipos código 0, compilación Webpack código 0, nueve pruebas locales de proyección/permisos y seis pruebas HTTP aprobadas. Las 20 migraciones y ambas suites SQL pasan en base local aislada. La suite de seguridad ahora prueba el rechazo de listados a estudiantes que comparten grupo y de grupos ajenos a un docente. Recorridos visuales en 390, 1040, 1440 y 1896 píxeles, ES/EN, Claro/Oscuro/Sistema y persistencia al recargar. Capturas reales de viewport, no páginas completas ni prueba física de teléfono.

La compilación con permisos normales falló al crear archivos locales. Una revisión automática se detuvo temporalmente por su límite de uso; después se completó la compilación autorizada con código 0. No queda ese bloqueo activo.

La revisión fresca pidió corregir la alineación vertical del panel de sistema. Se aplicó margin:0 auto, se recompiló y se recapturaron sistema/estudiante. El revisor puntuó Resolved ese único hallazgo y retornó ship limitado a esa corrección. DESIGN.md y su sidecar se actualizaron conservando el mundo B+C; detalle en .impeccable/review/roles-and-catalog-review.md. No es una aprobación de integraciones ni de seguridad exhaustiva.

**Siguiente paso del usuario:** completar Publishable en `.env.local` y ejecutar `npm.cmd run check:supabase`. La URL está configurada, las demás variables siguen pendientes. Guía: [Conectar Supabase](CONECTAR-SUPABASE.md). No se migró Supabase, no se enviaron correos y no se desplegó. `supabase/tests/bootstrap.sql` es exclusivamente local.

El servidor final está en http://127.0.0.1:3001. Abre `/vista-previa?rol=student` para revisar el panel estudiantil sin lista de personas.

---

## Registro anterior

## Bloque actual: validación local y correcciones completadas

7 de noviembre de 2026. El usuario respondió «si» a retomar las pruebas locales y después pidió continuar. No autoriza escrituras en Supabase, envíos de correo ni despliegue en este bloque.

### Resultado observado

- Lint y tipos: código 0. La compilación final también completó TypeScript.
- Build: código 0 con Webpack, opción incluida en Next.js. Turbopack falló al iniciar el proceso auxiliar de CSS; se ajustó el comando, sin omitir verificaciones ni cambiar dependencias.
- Pruebas de configuración: 9 casos Node aprobados, sin red.
- Base aislada PostgreSQL: 19 migraciones aplicadas localmente y dos suites SQL aprobadas. RLS, metadatos de evidencias, suspensión, MFA, doble autorización, reemplazos y cierre.
- Reglas de nota comprobadas: categorías 60/40 con pesos iguales internos dan 3.4 en el ejemplo; 2.95 redondea a 3.0 y aprueba, 2.94 a 2.9 y no aprueba. Las no entregadas reciben cero con historial; pendientes de revisión bloquean el cierre.
- Compilación ejecutada en 127.0.0.1:3001: cinco pruebas HTTP aprobadas sobre páginas y rechazos sin sesión. No usaron credenciales ni escribieron en la base externa.
- Navegador: publicación en dos grupos, entrega tardía, comentario, nota 4.3 consultada por el estudiante, reemplazo autorizado y dos versiones conservadas, con datos ficticios en memoria. ES/EN, temas y muestras de escritorio/móvil observados.

### Correcciones guardadas

La migración 010 dejó de usar window como variable reservada. El controlador PostgreSQL local ya no espera indefinidamente al servidor descendiente. Las suites corrigen sus propios escenarios de contacto y resultados por grupo sin relajar permisos de producción.

El portal muestra grupo junto a materia, informa cuando no hay traducción revisada y permite saltar al contenido. La reducción de movimiento actúa sobre los efectos concretos. Se corrigieron el global fetch del service worker y el comando reproducible de compilación.

La revisión visual independiente señaló dos hallazgos: aviso de institución ficticia en la apertura/acceso móvil y contraste de misión/visión. Se corrigieron y ambos se puntuaron Resolved; el veredicto ship se limita a esas dos correcciones, no a toda la superficie ni a las integraciones. Evidencia y límites en .impeccable/review/finish-review.md. El detector estático informó cero hallazgos primarios y la procedencia de cinco rasters de producto/fuente no tiene faltantes. Capturas parciales, no certificación global de accesibilidad ni prueba física de celular.

### Cómo verlo

La compilación comprobada está disponible en http://127.0.0.1:3001. Los cuatro paneles ficticios se abren en /vista-previa, sin contraseña. Para iniciarla de nuevo: npm.cmd run build y después npm.cmd run start -- --port 3001. Para editar en desarrollo: npm.cmd run dev, normalmente en el puerto 3000. El servidor solo escucha en este computador; 127.0.0.1 no abre la web desde un celular externo.

### Límites y continuación

Los esquemas locales mínimos de Auth/Storage no sustituyen Supabase. No se aplicó ninguna migración remota, no se cargó la semilla remota, no se enviaron correos y no se publicó. No se activaron servicios de pago.

Faltan integración real y comprobación de credenciales/tokens/archivos, correo controlado, políticas de promedio provisional y categorías vacías, paginación completa, fallos/concurrencia, restauración y PWA. PRODUCT.md conserva las decisiones abiertas. El detalle y los comandos están en docs/VALIDACION-PENDIENTE.md y docs/VER-LA-APLICACION.md.

Puntos de guardado: 0aeda23 para migraciones/suites y 7ac0328 para interfaz, compilación y HTTP. DESIGN.md y .impeccable/design.json documentan el sistema extraído del resultado; no son una certificación de toda la aplicación. Los documentos y evidencias se guardan en un commit posterior con cuerpo detallado en español.

---

## Historial hasta el bloque de composiciones

## Bloque actual: composición de la dirección B+C elegida

El usuario eligió explícitamente combinar B, Campus abierto, con C, Campus en profundidad, y pidió seguir usando Impeccable para todo el diseño. La dirección está confirmada. Se interpreta como estructura editorial y títulos sans de B con profundidad fotográfica y movimiento suave de C. Falta elegir su composición exacta; no se marca como aprobado íntegramente ninguno de los renders originales por separado.

Se abrió la fase de composición y se actualizó la comparación local con tres variantes de la misma dirección B+C. Se generaron las tres imágenes y una muestra móvil de la composición 2, recomendada por claridad pero aún no elegida por el usuario. Cada imagen conserva su prompt y aprobación en false. La guía de la landing está en .impeccable/surfaces/src-app-page-tsx.md. Contexto, argumentos y límites en docs/BOCETOS-VISUALES.md; los bocetos iniciales permanecen como historial en .impeccable/mocks/decision/. Se conserva también la muestra del panel docente sencillo. No se han implementado pantallas ni se ha comprobado comportamiento del producto.

Revisión de este bloque: se inspeccionaron las composiciones y la muestra móvil, se observaron las tres imágenes cargadas en la comparación local y se recuperó el prompt exacto incorporado en cada uno de los cuatro PNG nuevos. El barrido general también señaló doce referencias del catálogo local sin metadatos de origen; pertenecen a la caché ignorada .impeccable/mocks/worlds/, no se versionan ni se usan como imágenes de la aplicación, y no se modificaron. No presentar ese barrido general como una comprobación íntegramente superada. La revisión de archivos no equivale a una validación de interfaz implementada.

El usuario aportó dos referencias de landing y una muestra esmeralda #48B292. Confirmó landing con movimiento y secciones institucionales, programas con imágenes, contacto y accesos de estudiante/docente; paneles sencillos y esmeralda; ES/EN y temas claro/oscuro/sistema en todas las vistas. Se registró en PRODUCT.md y docs/DISENO-REQUISITOS.md. No se implementaron pantallas ni se eligió unilateralmente una composición final.

Se propusieron secuencia, efectos, muestras de contraste y mejoras de experiencia. El usuario confirmó fotografía con movimiento suave y traducción también del contenido académico. Se preguntó cómo obtener esa traducción; falta resolver versiones revisadas frente a generación automática y alcance de adjuntos. La dirección B+C está decidida y se concreta mediante bocetos; la composición final aún no se ha aprobado. Las pruebas de backend y el despliegue continúan aplazados.

## Backend ampliado y capa de cliente: historial conservado

El usuario pidió priorizar código y dejar las pruebas y el despliegue para después, y después solicitó continuar sin pausas. El núcleo inicial añadió cinco migraciones; la ampliación eleva el conjunto a dieciséis. Se escribieron eliminación coordinada, conciliación, estructura editable, inspección, presupuestos, idempotencia, oferta pública, lecturas paginadas y notificaciones. No se ejecutaron pruebas, lint, typecheck, compilación, migraciones ni solicitudes externas de estas funciones. No se desplegó.

Contrato y límites en docs/BACKEND.md y docs/BACKEND-OPERACIONES.md. Se prepararon un cargador de datos ficticios, consulta privada de credenciales y copia de base y archivos, sin ejecutarlos. Las opciones sensibles siguen deshabilitadas por defecto. La capa de cliente sin vistas está en src/client y src/contracts; los recorridos y diagramas están en docs/RECORRIDOS.md. La fórmula provisional y otras políticas académicas siguen pendientes de acuerdo. Todo el código nuevo requiere validación.

La elección de dirección visual ya se resolvió con la combinación B+C. La exploración de programas sigue como acción propuesta y falta concretar la composición combinada. No se han implementado pantallas ni elegido una identidad de forma unilateral; la comprobación operativa y las herramientas de restauración siguen aplazadas.

La sección de etapa 3 y sus resultados siguientes es histórica y conserva las comprobaciones realizadas ANTES de esta petición. No acredita el código nuevo. Continuar con backend según docs/BACKEND.md; no pedir de nuevo crear el proyecto ni bloquear la escritura local por falta de claves.

Proyecto: Instituto Tecnológico de San Miguel, institución ficticia de portafolio.

Carpeta de trabajo: `C:\Programacion\instituto_tecnologico_san_miguel`.

La etapa 1 consolidó el encargo y los acuerdos en PRODUCT.md, organizó el plan y comprobó las herramientas. La etapa 2 prepara y verifica la base técnica local. Los requisitos académicos y de acceso se conservan en PRODUCT.md, que sigue siendo la fuente actual.

## Avance de la etapa 3

- Proyecto de Supabase `instituto-tecnologico-san-miguel` creado por el usuario. La captura aportada muestra Free, Healthy, Nano y región East US (Ohio), us-east-2. Es evidencia visual, no una consulta autenticada del agente.

- Revisión pública realizada el 7 de noviembre de 2026: cuotas de Supabase Free, Vercel Hobby, pausas, restricciones, copias y viabilidad de correo gratuito. Fuentes y alcance en docs/SERVICIOS-GRATUITOS.md.
- Guía de acceso, configuración local y registro de pruebas en docs/CONFIGURACION-SERVICIOS.md.
- Plantilla .env.example conservada vacía. Se creó .env.local con la URL observada, sin sobrescribir archivos existentes; la clave publicable estaba vacía al ejecutar la comprobación. El archivo local está ignorado por Git.
- Límites internos de consumo conservados como propuestas. No se han activado controles de almacenamiento, transferencia o correo.
- Preferencia sobre commits detallados registrada en AGENTS.md y guardada en 492d130. Los commits siguientes describen cambios y verificaciones en su cuerpo.
- El usuario confirmó cuentas de Supabase y Vercel. La existencia del proyecto del instituto y su plan se observan en su captura; el acceso del agente a las cuentas y el plan de Vercel siguen pendientes de verificar.
- Se añadió check:supabase, una consulta GET de solo lectura a la configuración de Auth. Comprueba el registro público desactivado, evita redirecciones y no imprime claves. No añade dependencias ni conecta los módulos académicos.
- Consulta real de datos, archivo privado, invitación, recuperación y publicación técnica: pendientes. El siguiente paso manual está descrito en docs/CONFIGURACION-SERVICIOS.md.

La etapa 3 no está completada. El siguiente paso concreto es completar la clave Publishable en .env.local y ejecutar npm.cmd run check:supabase. La creación del proyecto ya está confirmada; las pantallas siguen esperando la elección visual de la etapa 4.

## Comprobaciones del avance de conexión

| Comprobación | Resultado observado |
|---|---|
| npm.cmd run lint | Código 0, sin avisos. |
| npm.cmd run test:services | Nueve pruebas aprobadas con respuestas controladas en memoria; ninguna consulta a Supabase. |
| npm.cmd run check:supabase | Código 1 esperado por clave publicable pendiente. Se detuvo antes de consultar la red. |
| Exclusión de .env.local | git check-ignore lo reconoce; el archivo no se incorpora al commit. |

Las pruebas locales cubren configuración incompleta, destinos y claves incorrectos, redirecciones, registro público habilitado y respuestas o errores sin filtrar la clave. No acreditan todavía el funcionamiento del servicio externo. No se modificaron los módulos web ni se repitió su compilación; el nuevo código es una herramienta local de comprobación.

## Comprobaciones del avance documental anterior

- Trece enlaces locales de README y docs comprobados: ninguno roto.
- Plantilla .env.example analizada: dos variables esperadas, ambas vacías, sin credenciales.
- .env.local, .env y .vercel/project.json excluidos de Git; .env.example disponible para versionar.
- git diff --check sin errores de espacios.
- La consulta de herramientas disponibles no confirmó una conexión utilizable de Supabase o Vercel. No se ejecutaron consultas, cargas ni envíos externos.
- Ese avance documental conservó la base técnica. El bloque de conexión posterior añade scripts locales y sus pruebas, con resultados en la sección anterior; no añade dependencias ni modifica el compilador.

El guardado de este avance se identifica por el mensaje `docs: preparar la viabilidad gratuita y la configuracion de servicios`. Su cuerpo detalla cambios, comprobaciones y pruebas pendientes. El historial se consulta con `git log -2 --format=fuller`.

## Base técnica conservada: etapa 2 completada

## Cambios realizados

- Proyecto único con Next.js, React, TypeScript estricto y Tailwind CSS.
- Versiones directas exactas y package-lock.json para instalar el mismo árbol con npm ci.
- Configuración modular de ESLint y comandos de desarrollo, tipos, compilación y arranque.
- Estructura HTML técnica y ruta GET /api/health. No hay pantallas académicas ni una landing de producto.
- Repositorio Git local en main, exclusión de dependencias, archivos generados y secretos.
- README, entorno y base técnica documentados con comandos reales y límites de lo comprobado.

## Comprobaciones observadas

| Comprobación | Resultado observado |
|---|---|
| npm.cmd ci | Código de salida 0; reinstalación desde el lockfile sin conflictos de versiones. |
| Auditoría incluida en esa instalación | 170 paquetes auditados; 0 vulnerabilidades conocidas informadas en ese momento. No acredita la seguridad futura de la aplicación. |
| npm.cmd run lint | Código de salida 0 con la dependencia de revisión corregida. |
| Compatibilidad del linter | Detectó una variable TypeScript no utilizada en una entrada temporal de memoria e ignoró .next. No se añadió ese código al proyecto. |
| npm.cmd run typecheck | Código de salida 0; tipos de rutas generados y TypeScript sin errores. |
| npm.cmd run build | Código de salida 0; compilación optimizada completada. |
| npm.cmd run start | Servidor de la compilación listo en 127.0.0.1:3000. |
| GET /api/health en producción local | HTTP 200, application/json, Cache-Control: no-store y respuesta de estado ok. |
| POST /api/health en producción local | HTTP 405; la ruta no admite ese método. |
| GET / en producción local | HTTP 404 esperado: todavía no se implementa una página de producto. |
| npm.cmd run dev | Servidor de desarrollo listo; GET /api/health devolvió HTTP 200 y estado ok. |

Los dos servidores utilizados para comprobar la base se detuvieron al terminar. Para volver a verla hay que ejecutar npm.cmd run dev.

La auditoría inicial detectó una dependencia transitiva vulnerable de las herramientas de revisión. Se revisaron los cambios de API de minimatch y se fijó temporalmente 11.0.5 para los consumidores que pedían la rama 10; después se comprobaron lint, tipos, compilación e instalación reproducible. Motivo y referencias en docs/BASE-TECNICA.md. No aplicar npm audit fix --force para resolver futuras alertas sin revisar compatibilidad.

Next.js añadió a AGENTS.md un bloque administrado con la ruta de su documentación local. Se conserva junto con las instrucciones propias del proyecto.

Vitest y Playwright siguen previstos para las etapas de reglas y recorridos. No existen todavía pruebas de permisos académicos, usuarios, base de datos, archivos o correo. La respuesta de salud solo valida el proceso de la aplicación.

## Comprobación sencilla para el usuario

1. Abrir la terminal integrada de VS Code en la carpeta del proyecto.
2. Ejecutar `npm.cmd run dev` y mantener esa terminal abierta.
3. Abrir http://127.0.0.1:3000/api/health.
4. Verificar que se ve `{"status":"ok","service":"instituto-san-miguel"}`.
5. Detener el servidor con Ctrl+C en esa terminal.

Si el puerto 3000 está ocupado, leer la dirección que indique Next.js y conservar /api/health al final. No cerrar procesos ajenos para liberar un puerto.

## Punto de guardado de la etapa 2

Rama main. La base técnica quedó guardada en 9b2a581, con el mensaje `chore: preparar base tecnica local del instituto`. Para ver ese punto histórico y el estado actual:

```powershell
git show --stat --oneline 9b2a581
git status --short
```

El segundo comando debe quedar sin salida después de guardar el bloque. No se ha configurado un remoto, subido a GitHub ni publicado la aplicación.

## Cómo continuar la etapa 3

Completar la clave Publishable en .env.local desde Connect o Settings > API Keys del proyecto creado y ejecutar npm.cmd run check:supabase. Si indica registro público habilitado, desactivar Allow new users to sign up en Authentication y volver a comprobar. Después se prepararán las pruebas reales de datos, archivo privado y correo. No solicitar de nuevo el nombre, plan o región ya observados en la captura.

Los pasos que necesitan una cuenta se realizarán mediante la conexión correspondiente o con el usuario en su panel, sin pegar secretos en el chat. El proyecto de Supabase fue creado por el usuario; este bloque no ha modificado recursos externos ni enviado correos.

La etapa 4 concreta la dirección B+C y el esmeralda #48B292 confirmados. El usuario elegirá la composición combinada antes de implementar pantallas; la paleta complementaria, familias tipográficas y logo siguen en elaboración. Consultar el bloque actual al inicio de este documento y docs/DISENO-REQUISITOS.md.
