# Verificación al confirmar una acción

El campo permanente de código se sustituye por una ventana contextual: muestra qué se cambiará y a quién, permite cancelar y pide el código del autenticador. En móvil aparece como hoja inferior. Seguridad conserva el estado del factor y su configuración inicial. No se eliminan factores existentes.

Se conserva la cobertura privilegiada anterior: cuentas, bajas, roles/permisos y operaciones académicas administrativas. Consultar el panel no pide código; cada lectura sigue limitada por rol y recurso. La pregunta opcional sobre restringirlo exclusivamente a bajas/contraseña sigue pendiente de respuesta. El administrador del sistema continúa sin acceso automático a notas.

## Activación en el proyecto existente

1. En Supabase, comprobar el proyecto `instituto-tecnologico-san-miguel`.
2. Abrir SQL Editor y pegar **solo** `supabase/migrations/202611080021_contextual_mfa.sql` completo. Requiere la instalación 001–020 existente. No reinstalarla, no ejecutar bootstrap.sql ni desactivar RLS.
3. Ejecutar una sola vez. Resultado esperado: transacción terminada sin error. Si hay error, conservarlo y revisarlo; no borrar objetos para forzar la ejecución.
4. Publicar el commit del cambio en la rama conectada a Vercel. Esperar que su despliegue de producción esté Ready; un Redeploy de un commit anterior no incorpora estos cambios.
5. Entrar al dominio estable y comprobar Seguridad: muestra estado/configuración, sin formulario permanente de código.
6. Con una cuenta de prueba apropiada, abrir Usuarios y solicitar archivado. Antes de confirmar se muestra acción/destino. Cancelar debe conservar la cuenta y el formulario. Repetir con el código actual debe completar la operación.
7. Comprobar también teclado, móvil y recuperación con una cuenta controlada. El propietario introduce sus contraseñas, QR y códigos; no enviarlos por chat.

Aplicar 021 **antes** del frontend: separa las lecturas por rol de las escrituras con verificación reciente. Esta entrega no ha sido aplicada remotamente por el agente.

## Contraseñas y pérdida del autenticador

La recuperación mantiene el enlace enviado al correo. Si existe un factor verificado, se solicita su código antes de guardar la nueva contraseña. La activación inicial sin factor conserva su flujo. El enlace de correo no sustituye un autenticador activo. Sin acceso al factor se informa de recuperación asistida; no hay eliminación automática de MFA ni procedimiento asistido completo implementado. La entrega real de correo sigue pendiente de comprobar.

## Alcance técnico y pruebas

La interfaz solicita verificación en cada acción protegida. El servidor exige aal2 y evidencia TOTP de hasta 90 segundos: esa ventana **no** es un ticket de un solo uso ligado a una acción. Se conservan permisos, comprobaciones de recurso, auditoría y doble autorización para eliminación definitiva; esta última continúa deshabilitada por defecto en servidor.

Pruebas locales: 11 escenarios del cliente; suites SQL de seguridad, reglas académicas y MFA contextual con 21 migraciones. El instalador rechaza repetirse sin borrar tablas. La comprobación de primer administrador usa el mismo esquema actualizado.

Recorridos en navegador con componentes reales y respuestas simuladas: cancelar, código inválido, aceptación, cancelación durante validación, fallo al cargar factores, Escape, foco de entrada/retorno y recuperación. No usaron credenciales reales, Supabase ni correo. Hubo mediciones DOM en escritorio y móvil; falló la captura de imágenes, así que no se acredita revisión visual completa ni integración del proveedor.

No se añaden servicios ni costes. La carga de cuentas de ejemplo, el recorrido conectado por roles, correo, archivos privados y restauración siguen en el inventario general de pendientes.
