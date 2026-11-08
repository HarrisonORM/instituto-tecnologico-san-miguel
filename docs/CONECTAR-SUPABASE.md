# Conectar la aplicación con Supabase

Guía del 7 de noviembre de 2026. Proyecto existente: `instituto-tecnologico-san-miguel`. El presupuesto sigue en cero. No hace falta desplegar en Vercel para conectar la aplicación que ejecutas en este computador.

## 1. Completar la primera conexión

1. En VS Code, abre **la carpeta del proyecto** `C:\Programacion\instituto_tecnologico_san_miguel`.
2. Abre `.env.local`, al mismo nivel que `package.json`. Está excluido de Git. Si no aparece, usa Ctrl+P y escribe su nombre.
3. En Supabase, selecciona **instituto-tecnologico-san-miguel**. En **Connect** o **Settings → API Keys**, copia la clave **Publishable**. Comienza por `sb_publishable_`. No copies una clave Secret en este campo. [Tipos de claves y ubicación oficial](https://supabase.com/docs/guides/getting-started/api-keys).
4. Pégala después de `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` y guarda. La URL del proyecto ya está configurada. No pegues ninguna clave en el chat ni en capturas.
5. En la terminal de VS Code ejecuta:

```powershell
npm.cmd run check:supabase
```

Este comando solo consulta la configuración pública de acceso: no crea usuarios, no carga datos y no envía correo. El resultado esperado es conexión correcta y registro público deshabilitado. Si dice que falta configuración, revisa que guardaste el archivo y que la terminal esté en la carpeta del proyecto.

Si indica registro público habilitado, desactiva **Allow new users to sign up** en la configuración de Authentication y vuelve a ejecutar el comando. El requisito del proyecto es que las cuentas las cree personal autorizado. [Configuración oficial de Auth](https://supabase.com/docs/guides/auth/general-configuration).

**Este es el siguiente paso inmediato.** Puedes comunicar el resultado del comando sin incluir claves. Una comprobación correcta de Auth todavía no acredita tablas, permisos, archivos ni recuperación de contraseña.

## 2. Preparar el servidor, después de comprobar lo anterior

En este bloque solo se preparó el código; no se han aplicado cambios a la base externa. Para la conexión completa faltan:

| Elemento | Dónde se configura | Para qué sirve |
|---|---|---|
| `SUPABASE_SECRET_KEY` | Solo `.env.local` del servidor; nunca `NEXT_PUBLIC_` | Operaciones administrativas e ingreso privado de consultas. Copiar Secret de API Keys cuando preparemos esta fase. |
| `CONTACT_RATE_LIMIT_SECRET` | Solo `.env.local` | Secreto aleatorio de al menos 32 caracteres para limitar consultas sin registrar el correo como contador. No es una clave de Supabase. |
| `INSTITUTION_EMAIL_DOMAIN` | `.env.local` | Dominio acordado para las cuentas institucionales. No inventar un dominio ni enviar a destinatarios ficticios. |
| `AUTH_RECOVERY_REDIRECT_URL` | `.env.local` y lista permitida de Auth | Regreso desde invitaciones/recuperación. Para desarrollo en el puerto 3000: `http://127.0.0.1:3000/auth/confirmar`. Si usamos el 3001: `http://127.0.0.1:3001/auth/confirmar`. |

En **Authentication → URL Configuration**, la Site URL y las Redirect URLs deben corresponder al puerto que estés usando. Más adelante añadiremos el dominio gratuito publicado, sin comprar dominio. No mezclar `localhost` y `127.0.0.1` sin registrar las direcciones utilizadas. [Redirecciones oficiales](https://supabase.com/docs/guides/auth/redirect-urls).

Al cambiar variables, reinicia el servidor local. Si usas la versión compilada, vuelve a compilar antes de iniciarla. No cambies a un plan de pago para completar estos pasos.

## 3. Llevar las tablas y los permisos al proyecto dedicado

Hay **20 migraciones ordenadas** en `supabase/migrations/`. Se probaron en una base local aislada; todavía no se han ejecutado en Supabase. Antes de aplicarlas hay que revisar que el proyecto de destino sea el dedicado a este instituto y qué objetos tiene actualmente. Después se preparará una ejecución concreta y revisable de las migraciones en orden; no es necesario volver a crear el proyecto.

**No ejecutes `supabase/tests/bootstrap.sql` en Supabase.** El archivo abierto en tu editor es una preparación exclusiva de pruebas locales; simula partes de Auth y Storage. Tampoco ejecutes allí las suites de `supabase/tests/`.

La migración 020 amplía las consultas de contacto a los cinco programas. La semilla está preparada para cinco carreras con las mismas 47 cuentas, cuatro materias y seis grupos ya acordados. Las tres nuevas carreras no añaden estudiantes automáticamente. La semilla sigue deshabilitada y no se ha ejecutado remotamente.

## 4. Comprobar un recorrido real antes de publicar

Una vez aplicadas las migraciones y completada la configuración: comprobar lectura con una cuenta autorizada, denegación entre estudiantes, tarea → entrega privada → calificación, suspensión, MFA y autorización de reemplazo. Luego configurar y probar invitación y recuperación con un buzón real controlado. No enviar correo a las 47 direcciones de ejemplo.

La vista previa de `/vista-previa` usa datos en memoria; no acredita conexión a Supabase. El formulario de contacto solo muestra éxito si el servidor acepta el envío; si falta configuración conservará los datos y mostrará un error.

Vercel y la publicación llegan después de estas comprobaciones. No se han añadido servicios de pago ni se han hecho escrituras remotas en este bloque.
