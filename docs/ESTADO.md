# Estado y siguiente paso

## Bloque actual: implementación del backend; pruebas aplazadas

El usuario pidió priorizar código y dejar las pruebas y el despliegue para después. Este bloque añadió cinco migraciones locales, funciones PostgreSQL y RLS, rutas HTTP, autenticación con TOTP, tareas y entregas versionadas, notas y cierre, administración, archivos privados y datos ficticios de 47 cuentas. No se ejecutaron pruebas, lint, typecheck, compilación, migraciones ni solicitudes externas de estas nuevas funciones. No se desplegó.

El contrato y los pendientes concretos están en docs/BACKEND.md. Siguen sin implementar el ejecutor de eliminación física, conciliación completa de invitaciones, fórmula provisional pendiente de acuerdo, CRUD completo de estructura, análisis de archivos y controles de consumo adicionales. La primera versión necesita validación antes de considerarse operativa.

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

La etapa 4 presentará propuestas visuales. El usuario elegirá antes de implementar pantallas; no se ha decidido paleta, tipografía ni logo.
