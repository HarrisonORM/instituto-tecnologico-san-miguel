# Configuración y pruebas de los servicios

Actualización del 8 de noviembre: no se requiere dominio de correo propio. La aplicación permite invitaciones administrativas a direcciones personales válidas; INSTITUTION_EMAIL_DOMAIN ya no se utiliza. Esa validación es independiente del remitente SMTP de Supabase. El mensaje «Correo institucional no permitido» se producía antes de registrar/enviar la invitación; corregirlo no demuestra recepción de correo. Se conserva desactivado el registro público. El SMTP y el ciclo real de invitación siguen pendientes de confirmación.

## Avance comunicado por el usuario

El usuario compartió la salida `Correcto: Auth responde y el registro público está desactivado` y una captura con cero tablas en `public`. Se registra como evidencia aportada por el usuario, sin volver a consultar ni mostrar claves. La conexión de Auth ya tiene ese resultado; datos, archivos y correo siguen pendientes de comprobación real. Se preparó y probó localmente el [instalador de las veinte migraciones](INSTALAR-BASE.md), todavía sin ejecutarlo en Supabase. Los apartados siguientes que dicen «clave pendiente» son históricos.

Guía vigente para conectar el código ya implementado: [Conectar Supabase paso a paso](CONECTAR-SUPABASE.md). La revisión local del 7 de noviembre encontró URL configurada y clave publicable aún pendiente, sin mostrar valores. Ya hay pantallas y 20 migraciones; no se han aplicado a la base externa. Los apartados históricos siguientes no acreditan integración real.

Etapa 3 en curso. La revisión pública de [servicios gratuitos](SERVICIOS-GRATUITOS.md) se realizó el **7 de noviembre de 2026**. El proyecto externo ya aparece creado en la captura aportada por el usuario; falta comprobar la conexión desde el entorno local.

## Evidencia del proyecto creado

El usuario confirmó que tiene cuentas en Supabase y Vercel y que uno de sus dos proyectos anteriores de Supabase estaba pausado. Posteriormente aportó una captura del proyecto nuevo con los siguientes datos:

| Dato | Observado en la captura |
|---|---|
| Nombre | instituto-tecnologico-san-miguel. |
| Plan de la organización | Free. |
| Estado | Healthy. |
| Región | East US (Ohio), us-east-2. |
| Tamaño de cómputo | Nano. |
| URL del proyecto | `https://smbtvfevndmpxpxxiorj.supabase.co` |

Esta es evidencia visual del panel en ese momento, no una consulta de la aplicación ni acceso autenticado del agente a la cuenta. No se necesita repetir la creación del proyecto. Las consultas, políticas, archivos y correo siguen pendientes de prueba real.

Los proyectos pausados no cuentan para el límite de dos activos; el alcance y las condiciones entre organizaciones están documentados en [facturación](https://supabase.com/docs/guides/platform/billing-on-supabase) y [preguntas de facturación](https://supabase.com/docs/guides/platform/billing-faq).

## Siguiente paso del usuario: completar la clave publicable

Se preparó `.env.local` en la raíz del proyecto con la URL observada y la clave vacía. El archivo está excluido de Git y se creó conservando cualquier archivo que ya existiera.

1. En VS Code, abrir `.env.local`, junto a package.json en la raíz del proyecto.
2. En el proyecto de Supabase, abrir **Connect** o **Settings > API Keys** y copiar la clave **Publishable**, que empieza por `sb_publishable_`.
3. Pegar solo su valor después de `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` y guardar con Ctrl+S. Conservar la URL ya preparada.
4. En la terminal de la carpeta del proyecto, ejecutar `npm.cmd run check:supabase`.

La clave se completa en el archivo local, no en el chat. [Dónde encontrar y cómo utilizar las claves](https://supabase.com/docs/guides/getting-started/api-keys).

## Qué comprueba el nuevo comando

`npm.cmd run check:supabase` carga la configuración local y hace una sola consulta GET a la configuración pública de Auth. Usa la clave en el encabezado apikey, limita el tiempo de espera a diez segundos y evita redirecciones a otros destinos. No imprime la clave ni crea usuarios, modifica datos o envía correos.

El resultado es correcto únicamente si Auth responde con su configuración y `disable_signup` es true. Si el comando indica que el registro público está habilitado, abrir Authentication, buscar **Allow new users to sign up**, desactivarlo, guardar y volver a ejecutar la comprobación. Esto conserva el requisito acordado de altas por personal autorizado. [Configuración de Auth](https://supabase.com/docs/guides/auth/general-configuration) y [contrato oficial del endpoint settings](https://github.com/supabase/auth/blob/master/openapi.yaml).

Una comprobación correcta de Auth no acredita todavía consultas a PostgreSQL, aislamiento académico, archivos privados, invitaciones ni recuperación. Tampoco conecta por sí sola los futuros módulos de la aplicación.

`npm.cmd run test:services` ejecuta nueve pruebas locales del comando, sin cuentas ni solicitudes reales. Son pruebas del manejo de configuración, destinos, claves, respuestas y errores; no sustituyen la comprobación externa.

## Preparar la configuración local

La raíz del proyecto conserva `.env.example`, una plantilla sin valores. Para una copia nueva del repositorio que todavía no tenga `.env.local`, se puede crear la copia desde la terminal del proyecto:

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

El usuario confirmó que ya tiene cuenta en [Vercel](https://vercel.com/login). Se comprobará **Hobby** antes de crear el proyecto. La publicación se preparará con la base existente y su ruta /api/health; las pantallas de producto esperan a la elección visual.

La prueba de alojamiento debe distinguir disponibilidad del servidor y disponibilidad de Supabase. Se anotarán dirección HTTPS, plan y respuesta observada, sin incluir secretos ni activar complementos de pago. El repositorio remoto y su acceso se resolverán en ese paso; el proyecto local todavía no tiene un remoto configurado.

## Registro de resultados

| Comprobación | Estado al 7 de noviembre de 2026 |
|---|---|
| Documentación oficial, cuotas, pausas y correo | Revisada; referencias en SERVICIOS-GRATUITOS.md. |
| Proyecto de Supabase | Captura del usuario confirma nombre, Free, Healthy, Nano y región us-east-2. |
| Cuenta de Vercel | Existencia confirmada por el usuario. Plan Hobby y acceso del agente pendientes de comprobar. |
| Configuración local | .env.local creado con URL; clave publicable vacía al ejecutar la comprobación. Archivo ignorado por Git. |
| Comando check:supabase | Código 1 esperado: falta la clave publicable. Se detuvo antes de consultar la red. |
| Pruebas locales del comando | Nueve aprobadas; respuestas controladas en memoria, sin probar servicios externos. |
| Consulta autenticada a configuración de Auth | Pendiente de completar la clave y ejecutar el comando. |
| Consulta real y comprobación de privacidad | Pendientes. |
| Carga y descarga privada, con acceso anónimo denegado | Pendientes. |
| Remitente SMTP y destinatario controlado | Pendientes de configuración y confirmación. |
| Invitación y recuperación completas con correo recibido | Pendientes. |
| Publicación técnica HTTPS | Pendiente. |
| Copia y restauración | Procedimiento por preparar y ejecutar en sus etapas; no se han probado. |

Los pasos terminados se actualizarán con el resultado realmente observado. La etapa 3 sigue abierta mientras falten sus pruebas esenciales.
