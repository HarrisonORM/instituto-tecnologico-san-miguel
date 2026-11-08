# Conectar GitHub con Vercel, sin costes adicionales

## Punto de partida

Repositorio configurado en Git: `https://github.com/HarrisonORM/instituto-tecnologico-san-miguel.git`. El usuario informó que ya subió el proyecto. Esta revisión comprobó el remoto local, no el contenido actual del servidor GitHub. `.env.local` está ignorado y no aparece entre los archivos actualmente versionados; solo se versiona la plantilla `.env.example`.

La aplicación incluye interfaz y API en un único proyecto Next.js. Vercel ejecutará ambas; Supabase mantendrá Auth, PostgreSQL y los archivos privados. No hace falta otro servidor, AWS ni comprar un dominio para esta primera publicación.

El usuario informó que la instalación de la base terminó bien y que configuró Secret. La revisión local confirmó presencia de URL, Publishable y Secret, sin mostrar sus valores. No se ha comprobado la clave Secret contra Supabase ni se han probado cuentas reales. Publicar la primera versión no termina esas verificaciones.

## 1. Importar el repositorio

1. Entra en [Vercel](https://vercel.com/dashboard) con tu cuenta existente.
2. Selecciona tu espacio personal en el plan **Hobby**. No iniciar una prueba Pro ni contratar complementos.
3. Pulsa **Add New → Project**.
4. Conecta tu cuenta de GitHub si todavía no aparece. Autoriza el repositorio `instituto-tecnologico-san-miguel`; no hace falta conceder acceso a todos tus repositorios.
5. En **Import Git Repository**, busca ese repositorio y pulsa **Import**.

Si no aparece, revisa el acceso de la integración Vercel en GitHub y que estés usando la cuenta propietaria del repositorio. El repositorio local pertenece a `HarrisonORM`.

## 2. Revisar la configuración del proyecto

| Campo | Valor para este repositorio |
|---|---|
| Project Name | `instituto-tecnologico-san-miguel`, si está disponible. |
| Framework Preset | **Next.js**. |
| Root Directory | Raíz del repositorio, `./`; donde está `package.json`. |
| Production Branch | `main`. |
| Node.js Version | **22.x**, compatible con `engines` del proyecto. Si no aparece al importar, revisar después en Settings → Build and Deployment. |
| Install Command | Detección automática con el archivo de bloqueo; si hay que especificarlo: `npm ci`. |
| Build Command | `npm run build`. El script ya utiliza `next build --webpack`. |
| Output Directory | Dejar la configuración automática de Next.js. No configurar una exportación estática: necesitamos las rutas API. |

No usar `npm.cmd` en Vercel: ese nombre se utiliza en la terminal Windows local. No hace falta añadir `vercel.json` para esta configuración.

## 3. Añadir las variables de la primera publicación

Abre **Environment Variables** en la pantalla de importación. Para este primer despliegue configura el entorno **Production**. Copia los valores desde `.env.local`, en tu equipo, sin enviarlos al chat:

| Nombre | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | La URL ya configurada en `.env.local`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | La Publishable que comienza por `sb_publishable_`. |
| `SUPABASE_SECRET_KEY` | La Secret que comienza por `sb_secret_`. Solo servidor; marcar como sensible si la interfaz ofrece esa opción. |
| `BACKEND_ENABLE_HARD_DELETE` | `false`. Mantiene deshabilitada la ejecución de eliminación definitiva. |

Vercel no recibe automáticamente tu `.env.local` desde GitHub. Los nombres de variables deben coincidir exactamente. No añadir `NEXT_PUBLIC_` a Secret ni copiar todas las variables privadas indiscriminadamente a despliegues Preview.

Para la primera publicación, la landing y las vistas de ejemplo podrán abrirse; el acceso institucional necesitará cuentas con perfil y rol. No hay garantía de que todas las funciones conectadas estén listas por introducir estas variables.

**Aún pendientes de configuración:**

| Variable | Cuándo completarla |
|---|---|
| `AUTH_RECOVERY_REDIRECT_URL` | Después de conocer la URL definitiva; será `https://TU-DOMINIO-ASIGNADO.vercel.app/auth/confirmar`. El dominio del ejemplo se sustituye por el real. |
| `INSTITUTION_EMAIL_DOMAIN` | Antes de habilitar invitaciones, acordar el dominio permitido de los buzones controlados para pruebas; no inventar un dominio ni comprarlo para este bloque. |
| `CONTACT_RATE_LIMIT_SECRET` | Antes de habilitar contacto, generar un valor aleatorio de al menos 32 caracteres y guardarlo solo en servidor. No es una clave de Supabase. |

Sin `CONTACT_RATE_LIMIT_SECRET`, el formulario de contacto responde como no disponible; no confirma un envío inexistente. Sin la URL de retorno, recuperación informa configuración pendiente. Esas limitaciones deben resolverse antes de dar por terminada la versión pública funcional.

No trasladar a Vercel las variables de semilla, exportación o contraseñas de demostración: `DEMO_SEED_ALLOWED`, `DEMO_ACCEPT_SAMPLE_DATA`, `DEMO_SEED_PASSWORD`, `DEMO_CREDENTIAL_ACCESS`, `BACKUP_ALLOWED`, `DATABASE_URL`, etc. Son herramientas locales controladas, no configuración ordinaria del sitio público.

## 4. Publicar y comprobar

1. Revisa los datos anteriores y pulsa **Deploy** para publicar la primera versión.
2. Espera a que el estado sea **Ready**. Si falla, comparte el error de compilación, sin variables o claves.
3. Abre la dirección gratuita `vercel.app` que Vercel asigne. No se da por disponible un dominio concreto antes de observarlo.
4. Comprueba `/`, `/programas/auxiliar-contable`, `/programas/auxiliar-administrativo`, `/programas/equipos-biomedicos`, `/acceso` y `/vista-previa?rol=student`.
5. Abre `/api/health`: el resultado esperado es `{"status":"ok","service":"instituto-san-miguel"}`. Este endpoint acredita que la API responde; no acredita conexión de datos, cuentas ni archivos.
6. Abre la misma URL pública desde tu celular. A diferencia de `127.0.0.1`, la dirección de Vercel sí permite probar desde otro dispositivo.

## 5. Configurar los enlaces de Auth con la URL real

Después de observar la URL de Production:

1. En Supabase, abre **Authentication → URL Configuration**.
2. En **Site URL**, coloca el origen público real, por ejemplo `https://TU-DOMINIO-ASIGNADO.vercel.app`.
3. En **Redirect URLs**, añade la dirección exacta `https://TU-DOMINIO-ASIGNADO.vercel.app/auth/confirmar`. Conserva también las direcciones locales que realmente uses.
4. En Vercel, configura `AUTH_RECOVERY_REDIRECT_URL` con esa dirección de confirmación exacta para Production.
5. Ejecuta un **Redeploy** para aplicar las nuevas variables.

La selección del destino no demuestra que el correo llegue ni que la invitación abra la pantalla correcta: falta comprobar ambos enlaces con un buzón real controlado. El flujo de invitación del servidor también debe revisarse para usar la ruta de confirmación; no atribuirlo como resuelto solo por definir Site URL.

## 6. Actualizaciones y presupuesto

Vercel para GitHub genera despliegues con los nuevos pushes. La rama `main` será la de Production; otras ramas suelen generar Preview. Las pruebas destructivas de semilla no se ejecutan como parte del build.

Hobby es gratuito para uso personal no comercial, adecuado a este portafolio. Al superar cuotas algunas funciones pueden quedar suspendidas o limitadas; no garantiza disponibilidad permanente. Mantener el plan gratuito, vigilar **Usage**, subir archivos dentro del presupuesto del servidor y evitar automatizaciones que consuman recursos sin necesidad. Supabase tiene sus propias cuotas y pausas; publicar no las elimina.

## Estado de este bloque

Se preparó esta guía y se revisó la configuración local sin imprimir valores. No se conectó la cuenta de Vercel, no se concedieron permisos a la integración, no se publicaron variables y no se ejecutó un despliegue desde el agente. La primera URL pública y su resultado siguen pendientes.

## Fuentes oficiales revisadas

- [GitHub y despliegues automáticos](https://vercel.com/docs/git/vercel-for-github).
- [Variables de entorno y necesidad de redeploy](https://vercel.com/docs/environment-variables).
- [Versiones de Node.js disponibles](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
- [Plan Hobby y límites](https://vercel.com/docs/plans/hobby).
- [Redirecciones de Auth en Supabase](https://supabase.com/docs/guides/auth/redirect-urls).
