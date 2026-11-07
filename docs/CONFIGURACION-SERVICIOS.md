# Configuración y pruebas de los servicios

Etapa 3 en curso. La revisión pública de [servicios gratuitos](SERVICIOS-GRATUITOS.md) se realizó el **7 de noviembre de 2026**. Esta guía prepara los pasos siguientes; no declara que ya exista una integración funcionando.

## Cuenta y capacidad confirmadas por el usuario

El usuario confirmó que ya tiene cuenta de Supabase y dos proyectos gratuitos, uno de ellos pausado. Es información proporcionada por el usuario; el agente todavía no ha inspeccionado su panel.

Los proyectos pausados no cuentan para el límite de dos proyectos gratuitos activos. Si no hay otras restricciones de la organización, debería haber capacidad para crear el del instituto. El límite considera las organizaciones donde se es propietario o administrador y puede verse afectado por otros miembros con esos roles. La disponibilidad concreta se confirma en el formulario de creación. [Facturación y proyectos gratuitos](https://supabase.com/docs/guides/platform/billing-on-supabase) y [preguntas de facturación](https://supabase.com/docs/guides/platform/billing-faq).

## Siguiente paso del usuario: crear el proyecto del instituto

1. Abrir [Supabase](https://supabase.com/dashboard) con la cuenta existente y elegir la organización **Free** adecuada.
2. Abrir la opción de nuevo proyecto y comprobar que permite crearlo en el nivel gratuito. La cuenta existente y el estado pausado ya están confirmados por el usuario; no hace falta volver a preguntarlos.
3. Seguir los campos indicados en la sección siguiente para un proyecto dedicado a la demo. Si el panel indica falta de capacidad o exige cambiar de plan, registrar el aviso y resolver esa condición antes de continuar.

El resultado esperado es un proyecto nuevo y operativo para el instituto en Free. Este paso conserva los proyectos existentes. La cuenta del proveedor es distinta de las cuentas de estudiantes que tendrá nuestra aplicación. No compartir contraseñas ni claves en el chat.

## Crear o seleccionar el proyecto de prueba

Se creará el proyecto dedicado al instituto con el nombre confirmado por el usuario: `instituto-tecnologico-san-miguel`, dentro de Free. Se comprobarán los proyectos existentes antes de crear recursos, conservando sus datos y configuración. El nombre está confirmado; la creación y conexión todavía están pendientes.

Para una creación manual:

1. Elegir la organización gratuita, pulsar la opción de nuevo proyecto y asignar el nombre.
2. Generar una contraseña de base de datos y guardarla en el gestor de contraseñas del usuario.
3. Elegir una región disponible adecuada para la audiencia de la demo y comprobar que la configuración conserva el plan gratuito.
4. Esperar a que el panel muestre el proyecto operativo. Registrar plan, región y estado observado sin guardar credenciales en Git.

Solo se seleccionará el nivel gratuito; no se activarán pruebas de planes de pago ni complementos facturables. Si la cuenta no ofrece capacidad gratuita, se resolverá esa limitación antes de crear recursos.

## Preparar la configuración local

La raíz del proyecto contiene `.env.example`, una plantilla sin valores. Si todavía no existe `.env.local`, se puede crear la copia desde la terminal del proyecto:

```powershell
if (-not (Test-Path -LiteralPath '.env.local')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
}
```

La condición conserva cualquier configuración local existente. Abrir la copia local en VS Code y completar la URL del proyecto y su **Publishable key** desde el panel de Supabase. La clave publicable empieza por `sb_publishable_`; las claves `sb_secret_` y `service_role` tienen privilegios distintos y no van en esos campos. [Claves oficiales de Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

El prefijo NEXT_PUBLIC_ permite que el navegador reciba un valor. La clave publicable identifica la aplicación; la privacidad de los datos requiere autenticación y políticas de acceso en base de datos y archivos. La plantilla no concede permisos ni establece una conexión por sí misma.

Para comprobar la exclusión del archivo local:

```powershell
git check-ignore .env.local
```

Debe mostrar `.env.local`. El archivo `.env.example` sí se conserva en Git porque no contiene valores. Las credenciales SMTP se configurarán directamente en Supabase cuando corresponda.

## Pruebas que haremos después de conectar

| Paso | Acción | Evidencia requerida |
|---|---|---|
| Datos | Crear una muestra mínima y hacer una consulta desde el entorno local. | Respuesta real y registro del acceso utilizado. |
| Privacidad | Activar políticas restrictivas para la muestra y probar accesos permitidos y denegados. | Una consulta como administrador no basta para demostrar aislamiento de usuarios. |
| Archivo | Subir un archivo pequeño de prueba a un bucket privado y recuperarlo con autorización. | Lectura permitida, acceso anónimo denegado y restricciones de carga observadas. |
| Invitación | Invitar a un destinatario real controlado por el usuario. | Mensaje recibido y activación con contraseña creada por el usuario de prueba. |
| Recuperación | Pedir recuperación de esa cuenta y cambiar su contraseña. | Mensaje recibido, enlace utilizable e ingreso con la contraseña nueva. |
| Alojamiento | Preparar la publicación técnica mínima en Vercel Hobby. | Comprobación de /api/health por HTTPS y plan gratuito observado. |

Estas pruebas se harán con recursos pequeños dedicados a viabilidad y sin información académica real. El modelo completo y su matriz de permisos se implementarán en la etapa 6. En este bloque todavía no se implementan pantallas de acceso o paneles: los ciclos de prueba deberán usar mecanismos técnicos controlados.

## Preparar el envío de correo

La opción propuesta es una cuenta gratuita de Gmail dedicada al proyecto. El usuario comprobará primero que puede habilitar verificación en dos pasos y generar una contraseña de aplicación. No hace falta comprar un dominio para probar este remitente. [Ayuda de Google](https://support.google.com/accounts/answer/185833?hl=es).

Cuando esté disponible, configurar SMTP personalizado en Supabase con `smtp.gmail.com`, puerto 465, el usuario de esa cuenta y su contraseña de aplicación; el remitente será esa misma dirección. La contraseña se introduce en el panel, sin imprimirla ni guardarla en el repositorio. [Servidor SMTP de Gmail](https://developers.google.com/workspace/gmail/imap/imap-smtp) y [SMTP de Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

Antes de probar invitación o recuperación se comprobarán los límites del proyecto y las direcciones de retorno que usarán los mecanismos técnicos. También se mantendrá desactivada la creación pública de usuarios en Auth. Enviar un mensaje sin completar el enlace solo demuestra recepción, no el ciclo de acceso completo.

El destinatario de prueba deberá estar identificado y controlado por el usuario antes de enviar mensajes. Las direcciones ficticias no recibirán correo.

## Preparar el alojamiento

Se accederá a [Vercel](https://vercel.com/login) y se comprobará **Hobby** antes de crear el proyecto. La publicación se preparará con la base existente y su ruta /api/health; las pantallas de producto esperan a la elección visual.

La prueba de alojamiento debe distinguir disponibilidad del servidor y disponibilidad de Supabase. Se anotarán dirección HTTPS, plan y respuesta observada, sin incluir secretos ni activar complementos de pago. El repositorio remoto y su acceso se resolverán en ese paso; el proyecto local todavía no tiene un remoto configurado.

## Registro de resultados

| Comprobación | Estado al 7 de noviembre de 2026 |
|---|---|
| Documentación oficial, cuotas, pausas y correo | Revisada; referencias en SERVICIOS-GRATUITOS.md. |
| Cuenta y proyectos existentes de Supabase | Usuario confirma cuenta y dos proyectos gratuitos, uno pausado. Panel y capacidad de creación todavía no inspeccionados por el agente. |
| Capacidad para el proyecto del instituto | Un espacio previsiblemente disponible por la exclusión del pausado; comprobarlo en el formulario de creación y la organización elegida. |
| Acceso a cuenta y plan de Vercel | Pendiente de conexión o confirmación del usuario. |
| Configuración local real | No hay .env.local ni .env en la carpeta al revisar este bloque; se añadió solo una plantilla vacía. |
| Proyecto externo creado por este bloque | Ninguno. |
| Consulta real y comprobación de privacidad | Pendientes. |
| Carga y descarga privada, con acceso anónimo denegado | Pendientes. |
| Remitente SMTP y destinatario controlado | Pendientes de configuración y confirmación. |
| Invitación y recuperación completas con correo recibido | Pendientes. |
| Publicación técnica HTTPS | Pendiente. |
| Copia y restauración | Procedimiento por preparar y ejecutar en sus etapas; no se han probado. |

Los pasos terminados se actualizarán con el resultado realmente observado. La etapa 3 sigue abierta mientras falten sus pruebas esenciales.
