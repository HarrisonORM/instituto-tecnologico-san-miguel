# Instalación inicial de tablas y permisos

## Estado que compartió el usuario

- `check:supabase` respondió correctamente y confirmó el registro público desactivado. Evidencia: salida de terminal compartida por el usuario, no una nueva consulta del agente.
- La consulta de tablas en `public` terminó con cero filas. Evidencia: captura del usuario del proyecto `instituto-tecnologico-san-miguel`. Esto no significa que Auth o Storage estén vacíos; tienen sus propios esquemas.
- Las migraciones siguen pendientes de ejecución remota. No se crearon usuarios ni se enviaron correos en este bloque.

## Preparar el archivo reproducible

Desde la raíz del proyecto:

```powershell
node scripts/prepare-database.mjs
```

Genera `work/database-install/instalar-base.sql` y un manifiesto con los nombres y SHA-256 de las veinte migraciones de origen. No lee `.env`, no contiene claves y no se conecta a ningún servicio. La carpeta `work` está excluida de Git; se conserva el generador como fuente reproducible.

El archivo contiene las migraciones 001 a 020 en orden, con una sola transacción exterior. Mantiene intactos los bloques internos de las funciones SQL. Se detiene antes de crear objetos si detecta tablas en `public`, un esquema `private` existente o el depósito `evidence` preexistente. Estas protecciones no identifican el proyecto remoto por sí solas: comprobar el nombre y la referencia en el panel sigue siendo necesario.

## Ejecutarlo desde el panel, cuando decidas aplicar la instalación

Este paso **sí modifica la base de Supabase**: crea tablas, funciones, políticas de acceso y un depósito privado llamado `evidence`. No carga la semilla, no crea personas en Auth y no envía correo. No requiere un plan de pago ni un despliegue en Vercel.

1. Abre el archivo SQL generado en VS Code. Selecciona todo su contenido y cópialo.
2. En Supabase, confirma el proyecto **instituto-tecnologico-san-miguel**, referencia **smbtvfevndmpxpxxiorj**. No elegir uno de los otros proyectos de tu cuenta.
3. Abre **SQL Editor → New query** y pega el contenido completo.
4. Ejecuta **todo** el archivo, desde su `begin;` hasta el resumen final. Si el botón dice **Run selected**, la selección debe contener todo el archivo, no solo una línea o una migración.
5. El resultado esperado es una fila con:

| resultado | tablas_publicas | tablas_con_rls | archivos_privados |
|---|---|---|---|
| Instalación completada | 26 | 26 | true |

El número de tablas y el indicador de RLS describen la instalación; no sustituyen probar los permisos mediante cuentas reales controladas. PostgreSQL ejecutará la instalación en una transacción: si una instrucción de esa transacción falla, no confirma los cambios de esa ejecución. No ejecutar fragmentos separados, porque se perdería esa propiedad.

Si aparece un error, conserva y comparte el texto y la línea, sin incluir claves. No borres tablas para forzar la ejecución ni la repitas sobre una instalación completada. La protección contra repetición está comprobada localmente.

**No ejecutar `supabase/tests/bootstrap.sql` en Supabase.** Es una simulación exclusiva del entorno de pruebas local. El instalador entregado no lo incluye, ni incluye las suites de pruebas o las cuentas de ejemplo.

## Comprobación local del instalador

```powershell
./scripts/test-database.ps1 -InstallBundle
```

Resultado observado: código 0, 26 tablas públicas con RLS, depósito privado, rechazo de segunda ejecución y suites `security.sql` / `academic.sql` aprobadas. Base PostgreSQL local aislada y detenida al terminar. `npm.cmd run lint` terminó con código 0. No se probaron cambios de Supabase real mediante este comando.

## Qué sigue después de instalar

Confirmar el resumen de Supabase; completar la configuración exclusiva del servidor; preparar el primer administrador mediante un procedimiento controlado; comprobar acceso por rol y archivos privados. Invitación y recuperación necesitan después un remitente gratuito compatible y una prueba con un buzón real controlado. Las 47 cuentas de ejemplo no se cargan automáticamente.

Referencia: [SQL Editor y base de datos de Supabase](https://supabase.com/docs/guides/database/overview).
