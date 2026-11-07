# Instituto Tecnológico de San Miguel

Aplicación universitaria ficticia de portafolio, prevista para celular y computador, con una landing pública y áreas protegidas para estudiantes, docentes y personal autorizado.

**Estado:** landing B+C, acceso, cuatro portales y vista previa con 47 identidades ficticias implementados. Hay 19 migraciones y conexión de frontend/backend por código, pendientes de integración y validación. Las pruebas y el despliegue siguen aplazados. Ver [estado actual](docs/ESTADO.md).

## Documentos del proyecto

| Documento | Para qué sirve |
|---|---|
| [PRODUCT.md](PRODUCT.md) | Requisitos actuales y distinción entre acuerdos, propuestas y decisiones abiertas. |
| [Plan de trabajo](docs/PLAN.md) | Etapas de principio a fin y cómo comprobar que termina cada una. |
| [Estado](docs/ESTADO.md) | Avance actual, comprobaciones y siguiente bloque. |
| [Entorno](docs/ENTORNO.md) | Herramientas instaladas y verificaciones todavía pendientes. |
| [Base técnica](docs/BASE-TECNICA.md) | Estructura, comandos, compatibilidad y decisiones de dependencias. |
| [Backend](docs/BACKEND.md) | Código preparado, contrato HTTP, reglas y pendientes de implementación y validación. |
| [Operaciones del backend](docs/BACKEND-OPERACIONES.md) | Eliminación, conciliación, inspección, límites, semilla y copias preparadas. |
| [Recorridos](docs/RECORRIDOS.md) | Navegación y diagramas funcionales antes de elegir las pantallas. |
| [Servicios gratuitos](docs/SERVICIOS-GRATUITOS.md) | Cuotas verificadas en documentación oficial, pausas y presupuesto interno propuesto. |
| [Configuración de servicios](docs/CONFIGURACION-SERVICIOS.md) | Pasos pequeños para las cuentas, plantilla local y registro de pruebas pendientes. |
| [AGENTS.md](AGENTS.md) | Guía breve para continuar con un agente sin perder el contexto. |
| [Ver la aplicación](docs/VER-LA-APLICACION.md) | Direcciones locales, paneles y diferencias entre vista previa y acceso real. |
| [Frontend implementado](docs/FRONTEND-IMPLEMENTADO.md) | Pantallas, fotografías, traducciones y contacto preparados. |
| [Validación pendiente](docs/VALIDACION-PENDIENTE.md) | Restricción actual de pruebas, resultados parciales y trabajo restante. |

## Base acordada

- Next.js, React, TypeScript y Tailwind CSS, con interfaz y operaciones del servidor separadas por responsabilidades.
- PostgreSQL, autenticación y almacenamiento privado mediante Supabase.
- Un solo repositorio y presupuesto adicional de cero.
- Datos ficticios: 47 cuentas, dos carreras, cuatro materias, seis grupos y un período de prueba.
- Diseño visual elegido con el usuario antes de programar las pantallas.

## Cómo continuar

Abre esta carpeta en VS Code y revisa [el estado del proyecto](docs/ESTADO.md), que distingue los comandos configurados de las comprobaciones ya ejecutadas.

Para recorrer el avance no necesitas credenciales: abre la landing y la vista previa. El acceso institucional requiere configuración privada y migraciones que aún no se aplicaron. No ejecutar pruebas ni migraciones hasta retomar expresamente la validación; la solicitud de autorización está pendiente.

## Arranque local

Con Node.js 22 y las dependencias instaladas, abre una terminal en la carpeta del proyecto:

```powershell
Set-Location -LiteralPath 'C:\Programacion\instituto_tecnologico_san_miguel'
npm.cmd run dev
```

Abre http://127.0.0.1:3000 para la landing o http://127.0.0.1:3000/vista-previa para los paneles ficticios.

La ruta técnica http://127.0.0.1:3000/api/health conserva la respuesta prevista:

```json
{"status":"ok","service":"instituto-san-miguel"}
```

Esta ruta solo comprueba el servidor de la aplicación. No comprueba Supabase, usuarios, correo ni servicios que todavía no se han conectado. La vista previa no consulta Supabase y sus cambios se reinician al recargar. Ningún recorrido de muestra acredita por sí mismo la seguridad del backend real.

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
| `npm.cmd run check:supabase` | Consultar la configuración de Auth con la clave local y comprobar que el registro público está desactivado. |
| `npm.cmd run test:services` | Probar localmente la comprobación de conexión, sin servicios externos. |

Vitest y Playwright se añadirán cuando existan reglas y recorridos que probar. Las cuentas, integraciones y condiciones gratuitas se comprobarán en su etapa, sin introducir secretos en los documentos.
