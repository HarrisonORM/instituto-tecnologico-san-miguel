# Correo de bienvenida y creación de contraseña

Flujo previsto: el administrador invita, el destinatario recibe la bienvenida del Instituto, pulsa Crear mi contraseña, guarda una contraseña de al menos 12 caracteres y entra al campus de su rol. No se envían contraseñas por correo. La cuenta conserva sus permisos; una invitación no habilita el registro público.

## Cambios preparados en el código

La ruta de invitaciones enviaba la solicitud a Auth sin redirect_to. Se corrige para señalar explícitamente la pantalla /auth/confirmar, reutilizando AUTH_RECOVERY_REDIRECT_URL. Se valida la configuración antes de registrar el trabajo o enviar correo: HTTPS, sin credenciales, parámetros ni fragmento y con esa ruta exacta. HTTP solo se admite en localhost/127.0.0.1 para pruebas locales. No se admite un destino aportado por el navegador del administrador.

La plantilla versionada está en supabase/templates/invite.html. Usa los colores esmeralda/menta aprobados, nombre completo del Instituto y Crear mi contraseña. Su enlace usa SiteURL y TokenHash de Supabase, con el hash dentro del fragmento para que no se envíe en la petición inicial al servidor. El formulario lo conserva en memoria, limpia la URL y lo verifica mediante POST únicamente al enviar la contraseña. Conserva compatibilidad con token_hash en query y con los tokens de sesión del enlace estándar. No se guarda nada de esto en localStorage.

Esta separación evita que la visita HTTP inicial de un lector de correo consuma automáticamente la invitación; no garantiza protección frente a herramientas que ejecuten y envíen formularios completos. Los errores de enlace se muestran sin reproducir descripciones privadas de Auth. Un factor MFA existente sigue siendo obligatorio cuando corresponda.

## Configuración manual para la web existente

1. En Vercel, proyecto del Instituto → Settings → Environment Variables, comprobar para Production:

   ```text
   AUTH_RECOVERY_REDIRECT_URL=https://instituto-tecnologico-san-miguel.vercel.app/auth/confirmar
   ```

2. En Supabase, proyecto instituto-tecnologico-san-miguel → Authentication → URL Configuration, comprobar:

   - Site URL: https://instituto-tecnologico-san-miguel.vercel.app (sin ruta y sin barra final).
   - Redirect URLs: incluir exactamente https://instituto-tecnologico-san-miguel.vercel.app/auth/confirmar.

   No borrar otras direcciones de desarrollo que aún se usen. Una dirección no autorizada puede hacer que Supabase vuelva a Site URL en vez del formulario.

3. Desde la terminal del repositorio ejecutar git push origin main y esperar el despliegue del commit nuevo en Ready para Production. No basta republicar un commit anterior. No hay migración SQL nueva.

4. En Supabase → Authentication → Emails → plantilla Invite user (Invitar usuario), configurar:

   - Asunto: Bienvenido al Instituto Tecnológico de San Miguel.
   - Cuerpo: contenido completo de supabase/templates/invite.html. Abrir el archivo como código en VS Code y copiar su HTML, no el texto renderizado del navegador.

   Guardar la plantilla. No cambiar los marcadores {{ .SiteURL }} y {{ .TokenHash }} por un token real. El nombre visible del remitente es una configuración distinta del asunto/cuerpo; si ya hay SMTP personalizado, su Sender name puede ser Instituto Tecnológico de San Miguel. Un remitente con dominio comprado no es requisito de este cambio.

5. Hacer una sola invitación nueva a un correo controlado. Comprobar bienvenida, botón, formulario, guardado y entrada al perfil correcto. No compartir enlaces completos, tokens, QR ni contraseñas en el chat.

## La cuenta que ya recibió una invitación

La nueva plantilla solo afecta mensajes futuros. Si el enlace anterior expiró o ya se utilizó, no borrar la cuenta ni intentar reinstalar la base. Usar Olvidé mi contraseña con el mismo correo para generar otro enlace. Ese mensaje utiliza la plantilla de recuperación, distinta de Invite user, y regresa a la misma pantalla /auth/confirmar. La entrega y finalización reales aún deben comprobarse. Si falla al guardar, conservar el mensaje exacto y revisar perfil/aprovisionamiento antes de reenviar o conceder roles.

## Lo comprobado y sus límites

El usuario confirmó recepción de una invitación; no confirmó aún en qué pantalla falló la creación de contraseña. La falta de redirect_to es un defecto observado en código, no un diagnóstico remoto completo del fallo aportado.

Pruebas locales: 10 escenarios de invitación y 5 de interpretación de enlaces, más 11 de MFA contextual, aprobados sin servicios externos. Compilación, tipos y lint aprobaron. Navegador local: correo en 390px y 990px sin overflow; abrir el enlace no hizo verificación ni escritura; contraseña no coincidente mostró error; la confirmación válida produjo una verificación, una escritura y navegación al campus. Se vieron los errores de expiración en ES/EN. Son respuestas simuladas, no una prueba de entrega, de persistencia en Supabase ni de todos los clientes de correo.

La captura de imagen falló; se conservaron observaciones DOM/accesibles, sin afirmar aprobación visual por imágenes. El detector único produjo dos advertencias de fuente y tres avisos de valores locales de tipografía/radio en el HTML del correo. Arial/Helvetica, tablas y estilos inline son una excepción de compatibilidad de email: no sustituyen Manrope ni los componentes de la web.

No se han cambiado plantillas, variables, SMTP, factores ni cuentas remotas desde el agente. No se enviaron correos ni se hizo push/despliegue. No se añadieron servicios ni costes.

Referencias oficiales: [plantillas de Supabase](https://supabase.com/docs/guides/auth/auth-email-templates), [invitaciones y destinos permitidos](https://supabase.com/docs/guides/auth/users).
