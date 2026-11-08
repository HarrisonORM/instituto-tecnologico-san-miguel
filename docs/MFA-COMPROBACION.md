# Comprobar la verificación en dos pasos

Actualización del 8 de noviembre: el usuario confirmó factor verified y verificación completada en su sesión. El formulario permanente descrito abajo se sustituye en el nuevo código por una confirmación contextual. Para activarla, seguir VERIFICACION-CONTEXTUAL.md; requiere la migración 021 antes de publicar. Los apartados siguientes conservan la explicación histórica y la lectura limitada de factores.

## Qué se corrigió

La recarga posterior a verificar el código desmontaba el panel de seguridad y perdía su confirmación. El panel ahora permanece durante la carga. Una respuesta de aceptación muestra el éxito inmediatamente; si falla la consulta posterior, conserva esa confirmación y muestra una advertencia distinta de un rechazo del código. No se modifican permisos, roles, RLS ni la exigencia de MFA.

## Comprobar el autenticador registrado

Desde el SQL Editor del proyecto dedicado, el propietario puede ejecutar únicamente esta lectura, sustituyendo TU_UID por el identificador de su propia cuenta:

```sql
select factor_type as tipo, status as estado
from auth.mfa_factors
where user_id = 'TU_UID'::uuid;
```

- verified: el factor ya fue verificado. Usar el autenticador existente para nuevas sesiones.
- unverified: la inscripción sigue pendiente.
- Sin filas: esa cuenta no tiene factores registrados.

Esta lectura no muestra secretos ni verifica que una sesión actual tenga aal2. Cada sesión administrativa debe completar su desafío con el autenticador existente. No borrar ni volver a inscribir factores por ausencia de un mensaje. No compartir QR, clave manual, códigos ni tokens.

Referencia: https://supabase.com/docs/guides/auth/auth-mfa

## Comprobación local del arreglo

Lint, build de producción y nueve pruebas de privacidad correctos. Se observaron tres escenarios con los componentes reales y respuestas simuladas: éxito conservado al actualizar, rechazo sin éxito, y éxito seguido de una advertencia por fallo de consulta. En móvil390×844 el mensaje quedó dentro del viewport y sin desbordamiento; también se probó escritorio990×720. Las capturas automáticas fallaron; no se afirma revisión visual por imágenes ni una suite E2E automatizada.

Para reproducir localmente: npm.cmd run qa:mfa, abrir http://127.0.0.1:3103, entrar a Seguridad, Configurar autenticador y usar el código sintético 000000. El banner identifica expresamente la simulación. /?case=reject y /?case=refresh-error seleccionan los otros casos. Solo para un navegador de pruebas a la vez, en 127.0.0.1; no usa .env.local, Supabase ni identidades reales. No desplegar este servidor de pruebas. Detenerlo con Ctrl+C. Las imágenes/enlaces/enrutamiento de Next se sustituyen por adaptadores simples; el comportamiento de Portal, Providers y SecurityPanel es el del código real, no una certificación de integración con Next/Supabase remoto.

No se introdujeron dependencias ni servicios. Para publicar el arreglo debe subirse el commit a la rama de producción y Vercel debe desplegar esa revisión. Un Redeploy de código anterior no incorpora cambios locales. No se ha hecho push ni despliegue desde este bloque.
