# Estado y siguiente paso

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
