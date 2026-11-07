# Revisión del entorno

Carpeta del proyecto en VS Code: `C:\Programacion\instituto_tecnologico_san_miguel`.

El primer bloque encontró esta carpeta vacía. El segundo deja una base técnica local con herramientas instaladas en el proyecto; no requiere instalar Docker ni herramientas globales.

## Herramientas observadas

| Herramienta | Resultado | Alcance de la comprobación |
|---|---|---|
| Node.js | v22.18.0 | Versión ejecutada; satisface el mínimo de Next.js y las dependencias seleccionadas. Se revisarán los parches vigentes antes de publicar. |
| npm | 10.9.3 | Se usa npm.cmd en Windows. Dependencias directas exactas y árbol registrado en package-lock.json. |
| Git | 2.49.0.windows.1 | Repositorio local inicializado en la rama main. Punto de guardado y verificación en docs/ESTADO.md. |
| VS Code | 1.145.2 | Versión leída de su instalación local; carpeta identificada mediante su estado guardado. |
| Cliente PostgreSQL | psql 18.3 | Solo se comprobó el cliente; no acredita que exista un servidor o una conexión a Supabase. |
| Docker | No encontrado en PATH | No se comprobó un motor Docker. No es necesario para este bloque. |
| Supabase CLI | No encontrada en PATH | No se instaló ni ejecutó; se evaluará cuando corresponda. |
| Vercel CLI | No encontrada en PATH | No se instaló ni ejecutó; no es necesaria para la base local. |

Estar disponible en PATH significa que la consola puede localizar la herramienta. Una herramienta no encontrada podría existir en otro lugar; no se declara ausente de todo el computador.

## Dependencias elegidas

| Dependencia | Versión directa fijada |
|---|---|
| Next.js | 16.4.5 |
| React y React DOM | 19.3.1 |
| TypeScript | 6.0.3 |
| Tailwind CSS y su integración con PostCSS | 4.3.5 |
| PostCSS | 8.5.32 |
| ESLint | 10.14.0 |
| typescript-eslint | 8.72.1 |
| Plugin oficial de Next.js para ESLint | 16.4.5 |

package.json contiene todas las dependencias directas, incluidos los tipos. package-lock.json registra las transitivas. docs/BASE-TECNICA.md explica la compatibilidad y la excepción temporal de minimatch.

La instalación reproducible, lint, comprobación de tipos, compilación y respuesta HTTP local se han ejecutado; los resultados y sus límites están en docs/ESTADO.md. Next.js exige Node.js 20.9 como mínimo; la rama 22 instalada satisface ese requisito. La compatibilidad se contrastó con la documentación oficial y los metadatos de las versiones concretas en npm.

## Actualización de implementación

El código actual ya tiene landing y paneles. Las comprobaciones de la base técnica descritas arriba son históricas. En este bloque se observó el arranque de desarrollo y la landing en el navegador; una comprobación de tipos pasó antes de cambios posteriores y lint señaló cinco errores corregidos sin repetición. La versión final no está validada. También se localizaron binarios PostgreSQL 18, pero no se inició una base: la ejecución de pruebas locales fue rechazada por el aplazamiento vigente.

## Pendientes de otras etapas

- El usuario confirmó cuentas de Supabase y Vercel y aportó captura del proyecto instituto-tecnologico-san-miguel creado en Free, Healthy, Nano, us-east-2. La evidencia procede de su captura; el agente todavía no tiene una conexión autenticada al panel ni ha probado la aplicación contra Supabase. Plan de Vercel y acceso a GitHub siguen pendientes.
- Las condiciones gratuitas, cuotas y comportamiento publicado ante inactividad y exceso se revisaron el 7 de noviembre de 2026: docs/SERVICIOS-GRATUITOS.md. Comprobarlos en la cuenta real y probar la reactivación sigue pendiente.
- Conexión real a PostgreSQL/Supabase, autenticación, almacenamiento privado, invitaciones y recuperación.
- Envío real de correo a un destinatario controlado; todavía no está validado.
- Reglas académicas, seguridad por recurso y recorridos completos. La ruta /api/health solo comprueba el servidor local.
- Revisión de la implementación B+C elegida, en tamaños y estados reales, después de retomar la validación.

El usuario creó el proyecto externo de Supabase. Este bloque preparó su configuración local con URL y clave pendiente, sin activar servicios de pago ni instalar software global.

La etapa 3 conserva la plantilla .env.example vacía. Después de recibir la captura se creó .env.local con la URL observada y la clave vacía; Git lo ignora. check:supabase se detuvo por configuración incompleta, antes de acceder a la red. Node.js 22.18.0 admite --env-file-if-exists y el ejecutor node:test, utilizados para cargar la configuración y ejecutar nueve pruebas locales. El registro vigente está en docs/CONFIGURACION-SERVICIOS.md.

Referencias: [instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation), [versiones de Node.js](https://nodejs.org/en/about/previous-releases) y [metadatos oficiales de Next.js 16.4.5](https://registry.npmjs.org/next/16.4.5).
