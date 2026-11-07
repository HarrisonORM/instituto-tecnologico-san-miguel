# Instituto Tecnológico de San Miguel

Aplicación universitaria ficticia de portafolio, prevista para celular y computador, con una landing pública y áreas protegidas para estudiantes, docentes y personal autorizado.

**Estado:** base técnica local preparada y comprobada con Next.js, TypeScript, Tailwind CSS y ESLint. La comprobación inicial del servidor es `/api/health`; las pantallas de producto esperarán a la elección visual. El siguiente bloque revisará la viabilidad gratuita de los servicios.

## Documentos del proyecto

| Documento | Para qué sirve |
|---|---|
| [PRODUCT.md](PRODUCT.md) | Requisitos actuales y distinción entre acuerdos, propuestas y decisiones abiertas. |
| [Plan de trabajo](docs/PLAN.md) | Etapas de principio a fin y cómo comprobar que termina cada una. |
| [Estado](docs/ESTADO.md) | Avance actual, comprobaciones y siguiente bloque. |
| [Entorno](docs/ENTORNO.md) | Herramientas instaladas y verificaciones todavía pendientes. |
| [Base técnica](docs/BASE-TECNICA.md) | Estructura, comandos, compatibilidad y decisiones de dependencias. |
| [AGENTS.md](AGENTS.md) | Guía breve para continuar con un agente sin perder el contexto. |

## Base acordada

- Next.js, React, TypeScript y Tailwind CSS, con interfaz y operaciones del servidor separadas por responsabilidades.
- PostgreSQL, autenticación y almacenamiento privado mediante Supabase.
- Un solo repositorio y presupuesto adicional de cero.
- Datos ficticios: 47 cuentas, dos carreras, cuatro materias, seis grupos y un período de prueba.
- Diseño visual elegido con el usuario antes de programar las pantallas.

## Cómo continuar

Abre esta carpeta en VS Code y revisa [el estado del proyecto](docs/ESTADO.md), que distingue los comandos configurados de las comprobaciones ya ejecutadas.

## Arranque local

Con Node.js 22 y las dependencias instaladas, abre una terminal en la carpeta del proyecto:

```powershell
Set-Location -LiteralPath 'C:\Programacion\instituto_tecnologico_san_miguel'
npm.cmd run dev
```

Abre `http://127.0.0.1:3000/api/health`. La respuesta prevista es:

```json
{"status":"ok","service":"instituto-san-miguel"}
```

Esta ruta solo comprueba el servidor de la aplicación. No comprueba Supabase, usuarios, correo ni servicios que todavía no se han conectado. La dirección principal `/` todavía no tiene una pantalla de producto; la comprobación de este bloque utiliza expresamente `/api/health`.

Detén el servidor con Ctrl+C en la terminal que lo ejecuta. Los comandos están limitados a la dirección local del computador.

## Instalación reproducible y comprobaciones

En una copia nueva del repositorio, instala las dependencias fijadas con `npm.cmd ci`. El archivo package-lock.json registra las versiones del árbol de dependencias; debe conservarse en Git.

| Comando | Propósito |
|---|---|
| `npm.cmd run dev` | Servidor de desarrollo local. |
| `npm.cmd run lint` | Comprobar reglas de código con ESLint. |
| `npm.cmd run typecheck` | Generar tipos de rutas y comprobar TypeScript. |
| `npm.cmd run build` | Crear la versión optimizada. |
| `npm.cmd run start` | Ejecutar localmente una compilación creada con build. |

Vitest y Playwright se añadirán cuando existan reglas y recorridos que probar. Las cuentas, integraciones y condiciones gratuitas se comprobarán en su etapa, sin introducir secretos en los documentos.
