# Estado y siguiente paso

## Bloque actual: etapa 3 en curso

Proyecto: Instituto Tecnológico de San Miguel, institución ficticia de portafolio.

Carpeta de trabajo: `C:\Programacion\instituto_tecnologico_san_miguel`.

La etapa 1 consolidó el encargo y los acuerdos en PRODUCT.md, organizó el plan y comprobó las herramientas. La etapa 2 prepara y verifica la base técnica local. Los requisitos académicos y de acceso se conservan en PRODUCT.md, que sigue siendo la fuente actual.

## Avance de la etapa 3

- Revisión pública realizada el 7 de noviembre de 2026: cuotas de Supabase Free, Vercel Hobby, pausas, restricciones, copias y viabilidad de correo gratuito. Fuentes y alcance en docs/SERVICIOS-GRATUITOS.md.
- Guía de acceso, configuración local y registro de pruebas en docs/CONFIGURACION-SERVICIOS.md.
- Plantilla .env.example vacía, con URL y clave publicable; no conecta la aplicación por sí misma. No se han creado archivos locales con valores reales en este bloque.
- Límites internos de consumo conservados como propuestas. No se han activado controles de almacenamiento, transferencia o correo.
- Preferencia sobre commits detallados registrada en AGENTS.md y guardada en 492d130. Los commits siguientes describen cambios y verificaciones en su cuerpo.
- Acceso a cuentas, consulta real, archivo privado, invitación, recuperación y publicación técnica: pendientes. Las conexiones de Supabase y Vercel se ofrecieron; falta confirmación de acceso o configuración manual por el usuario.

La etapa 3 no está completada. El siguiente paso concreto es acceder a Supabase Free. Las pantallas siguen esperando la elección visual de la etapa 4.

## Comprobaciones de este avance documental

- Trece enlaces locales de README y docs comprobados: ninguno roto.
- Plantilla .env.example analizada: dos variables esperadas, ambas vacías, sin credenciales.
- .env.local, .env y .vercel/project.json excluidos de Git; .env.example disponible para versionar.
- git diff --check sin errores de espacios.
- La consulta de herramientas disponibles no confirmó una conexión utilizable de Supabase o Vercel. No se ejecutaron consultas, cargas ni envíos externos.
- No se modificó código de ejecución, dependencias ni configuración del compilador; se conservan los resultados técnicos de la etapa 2 sin declararlos repetidos en este bloque.

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

Confirmar el acceso a Supabase Free siguiendo el primer paso de docs/CONFIGURACION-SERVICIOS.md. Después se creará o seleccionará el proyecto de prueba y se comprobarán base de datos, archivo privado y correo real. La revisión pública de condiciones ya está documentada; faltan las pruebas observadas.

Los pasos que necesitan una cuenta se realizarán mediante la conexión correspondiente o con el usuario en su panel, sin pegar secretos en el chat. No se ha activado ningún servicio en esta etapa.

La etapa 4 presentará propuestas visuales. El usuario elegirá antes de implementar pantallas; no se ha decidido paleta, tipografía ni logo.
