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

## Pendientes de otras etapas

- Acceso a GitHub, Supabase y Vercel: no se ha comprobado inicio de sesión, creado proyectos ni publicado.
- Condiciones gratuitas vigentes, comportamiento al agotar cuotas, inactividad y reactivación de cada proveedor.
- Conexión real a PostgreSQL/Supabase, autenticación, almacenamiento privado, invitaciones y recuperación.
- Envío real de correo a un destinatario controlado; todavía no está validado.
- Reglas académicas, seguridad por recurso y recorridos completos. La ruta /api/health solo comprueba el servidor local.
- Elección visual del usuario antes de implementar landing, acceso y paneles.

No se han configurado claves, cuentas de pago ni servicios externos. No se ha instalado software global durante este bloque.

Referencias: [instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation), [versiones de Node.js](https://nodejs.org/en/about/previous-releases) y [metadatos oficiales de Next.js 16.4.5](https://registry.npmjs.org/next/16.4.5).
