# Base técnica local

Esta etapa prepara un único proyecto Next.js. La identidad visual y las pantallas se elegirán en su etapa; la ruta de comprobación permite verificar el servidor mientras tanto.

## Archivos y responsabilidades

| Ubicación | Responsabilidad |
|---|---|
| package.json | Dependencias directas con versiones exactas y comandos del proyecto. |
| package-lock.json | Árbol exacto de dependencias para instalaciones reproducibles con npm ci. |
| next.config.ts | Configuración del framework; no contiene secretos ni servicios conectados. |
| tsconfig.json | Comprobación estricta de tipos y alias de importación @/*. |
| next-env.d.ts | Referencias de tipos generadas por Next.js; se excluyen de Git porque cambian entre desarrollo y compilación. |
| eslint.config.mjs | Reglas actuales de JavaScript, TypeScript y Next.js. |
| postcss.config.mjs | Conexión de Tailwind CSS con el compilador de estilos. |
| src/app/layout.tsx | Estructura HTML técnica y metadatos del proyecto. |
| src/app/globals.css | Entrada de Tailwind; la identidad visual sigue pendiente. |
| src/app/api/health/route.ts | Comprobación pública y mínima del proceso de la aplicación. |
| scripts/check-supabase.mjs | Comprobación local de Auth con la configuración de .env.local; no expone una ruta web. |
| scripts/lib/supabase-probe.mjs | Validación y consulta de solo lectura, sin mostrar claves ni seguir redirecciones. |
| scripts/supabase-probe.test.mjs | Pruebas locales del comprobador con node:test y respuestas controladas. |
| docs/ | Plan, requisitos operativos y resultados observados. |

Los módulos académicos, de autorización e integración se crearán conforme se implementen sus funciones. La preparación técnica no añade permisos de usuario ni simula una conexión a Supabase.

## Comprobación del servidor

GET `/api/health` devuelve:

```json
{"status":"ok","service":"instituto-san-miguel"}
```

La respuesta usa `Cache-Control: no-store`. Confirma únicamente que el servidor puede atender esa ruta, no la disponibilidad de base de datos, almacenamiento, correo o autenticación. El estado de esas integraciones se verificará por separado.

La raíz `/` todavía no tiene una página de producto. No se debe usar esa dirección para juzgar el resultado del bloque; la comprobación prevista es `/api/health`.

## Comandos configurados

- `npm.cmd run dev`: inicia el modo de desarrollo local.
- `npm.cmd run lint`: comprueba las reglas del código.
- `npm.cmd run typecheck`: genera los tipos de rutas y comprueba TypeScript.
- `npm.cmd run build`: compila una versión optimizada.
- `npm.cmd run start`: inicia esa versión después de compilar.
- `npm.cmd run check:supabase`: carga .env.local y comprueba Auth y registro público desactivado; no valida PostgreSQL, archivos ni correo.
- `npm.cmd run test:services`: ejecuta las pruebas locales del comprobador sin servicios externos ni dependencias nuevas.

La lista describe comandos existentes. docs/ESTADO.md indica cuáles se ejecutaron y su resultado real.

## Compatibilidad y decisiones técnicas

- Se utiliza Node.js 22 para aprovechar la herramienta instalada y se fija esa rama como entorno inicial. Antes de publicar se revisarán los parches vigentes.
- Next.js y React se seleccionaron contrastando sus versiones y dependencias compatibles en el registro oficial de npm.
- TypeScript 6.0.3 está dentro del rango aceptado por typescript-eslint 8.72.1 (`>=4.8.4 <6.1.0`). TypeScript 7 se descartó para esta base por esa restricción.
- Se usa ESLint 10 con sus reglas oficiales de JavaScript, typescript-eslint y el plugin oficial de Next.js. La configuración completa eslint-config-next arrastraba plugins que exigen ESLint 9; se prefirió esta configuración modular para evitar fijar un ESLint sin soporte.
- Las reglas específicas de componentes y accesibilidad se revisarán al implementar el frontend, conservando compatibilidad entre herramientas.
- Se fija temporalmente `minimatch@10` en `11.0.5` mediante `overrides`: las herramientas de revisión todavía pedían una versión afectada por GHSA-g3hv-75wg-m249. Se revisaron los cambios de API y sus usos en ESLint y typescript-eslint; utilizan las funciones conservadas. Al actualizar esas herramientas se debe revisar si ya puede retirarse esta excepción. Las comprobaciones de compatibilidad observadas se registran en docs/ESTADO.md.
- Las dependencias se instalan localmente; no se han instalado herramientas globales ni activado servicios de pago.

Referencias: [instalación oficial de Next.js](https://nextjs.org/docs/app/getting-started/installation), [versiones de Node.js](https://nodejs.org/en/about/previous-releases), [metadatos de Next.js](https://registry.npmjs.org/next/16.4.5), [compatibilidad de typescript-eslint](https://registry.npmjs.org/typescript-eslint/8.72.1).

Excepción de dependencia: [aviso de seguridad de minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249) y [cambios oficiales de la versión 11](https://github.com/isaacs/minimatch/blob/v11.0.5/changelog.md). Esta excepción corresponde a las herramientas de desarrollo; una auditoría sin avisos no sustituye las futuras pruebas de permisos y seguridad de la aplicación.
