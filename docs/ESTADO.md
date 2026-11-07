# Estado y siguiente paso

## Bloque actual: etapa 2 completada

Proyecto: Instituto Tecnológico de San Miguel, institución ficticia de portafolio.

Carpeta de trabajo: `C:\Programacion\instituto_tecnologico_san_miguel`.

La etapa 1 consolidó el encargo y los acuerdos en PRODUCT.md, organizó el plan y comprobó las herramientas. La etapa 2 prepara y verifica la base técnica local. Los requisitos académicos y de acceso se conservan en PRODUCT.md, que sigue siendo la fuente actual.

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

## Punto de guardado local

Rama main. El punto de guardado de este bloque se identifica por el mensaje `chore: preparar base tecnica local del instituto`. Se puede comprobar con:

```powershell
git log -1 --oneline
git status --short
```

El segundo comando debe quedar sin salida después de guardar el bloque. No se ha configurado un remoto, subido a GitHub ni publicado la aplicación.

## Siguiente bloque: etapa 3

Comprobar la viabilidad gratuita de base de datos, autenticación, almacenamiento, correo real y alojamiento, con condiciones oficiales, cuotas y reactivación documentadas. El alcance está en docs/PLAN.md.

La revisión pública puede adelantarse sin credenciales. Los pasos que necesiten una cuenta se realizarán mediante el acceso del usuario, sin pegar secretos en el chat. No se ha activado ningún servicio en esta etapa.

La etapa 4 presentará propuestas visuales. El usuario elegirá antes de implementar pantallas; no se ha decidido paleta, tipografía ni logo.
