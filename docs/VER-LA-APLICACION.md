# Ver el avance local

La aplicación tiene una landing y paneles implementados. Ya pasó comprobaciones locales, pero todavía no está publicada ni validada contra los servicios reales. La vista previa funciona con datos ficticios en memoria y no necesita una cuenta de Supabase.

## Paso 1: abrir el proyecto

En VS Code, abre `C:\Programacion\instituto_tecnologico_san_miguel`. En Terminal > Nueva terminal, ejecuta:

```powershell
npm.cmd run dev
```

Mantén la terminal abierta. Si ya hay un servidor de este proyecto funcionando, utiliza su dirección; no cierres otros procesos para liberar un puerto. La dirección habitual es http://127.0.0.1:3000.

## Ver la compilación comprobada

En este bloque quedó ejecutándose en http://127.0.0.1:3001. Si está detenida, en otra terminal del proyecto ejecuta npm.cmd run build y, cuando termine correctamente, npm.cmd run start -- --port 3001. Para pruebas HTTP utiliza npm.cmd run test:local-http con ese servidor abierto. El puerto 3000 se conserva para desarrollo; no es necesario cerrar procesos ajenos.

## Paso 2: elegir qué ver

| Dirección | Contenido |
|---|---|
| `/` | Presentación, explorador de programas, comunidad, historia, misión, visión, preguntas y contacto. |
| `/programas/software` y `/programas/redes` | Presentación de cada programa. |
| `/acceso` | Acceso institucional y enlaces a la vista previa. |
| `/vista-previa` | Selector de los cuatro paneles con información ficticia. |
| `/vista-previa?rol=student` | Materias, entregas, notas y perfil del estudiante ficticio. |
| `/vista-previa?rol=teacher` | Grupos, estudiantes, tareas, revisión, calificación y reemplazos. |
| `/vista-previa?rol=academic_admin` | Estructura, matrículas, porcentajes y correcciones de identidad. |
| `/vista-previa?rol=system_admin` | Cuentas, permisos, estados y auditoría. |
| `/privacidad` | Tratamiento de preferencias, sesión y datos de ejemplo. |

Los enlaces de las tarjetas de programas son la referencia para su dirección exacta. El selector superior del panel permite cambiar de rol y de persona ficticia entre las 47 identidades preparadas. Estos selectores no alteran permisos de ninguna cuenta institucional.

## Paso 3: entender lo que estás viendo

- Los cambios de la vista previa permanecen en memoria durante la navegación dentro de la aplicación. Recargar la página reinicia los datos. No se envían correos ni archivos a Supabase.
- La vista previa permite explorar publicación, entrega, revisión y consulta entre personas ficticias. Es una simulación de interfaz y no demuestra que las políticas de seguridad reales funcionen.
- El cierre de períodos y la eliminación definitiva no se ejecutan en la simulación. Los mensajes indican esa limitación.
- ES/EN y Claro/Oscuro/Sistema son preferencias del dispositivo. La portada permite pausar el movimiento; Seguridad también ofrece reducirlo.
- Las versiones académicas traducidas requieren contenido revisado. Si falta una versión, se conserva el original. Los adjuntos no se traducen automáticamente.
- El acceso institucional usa el backend real. Si faltan claves o migraciones, presenta el error correspondiente y no reemplaza información privada por ejemplos.
- El formulario público no confirma recepción si su canal privado no está configurado. No representa un servicio de admisiones real.

## Verla en el celular

El servidor está restringido a este computador. `127.0.0.1` en el celular apunta al propio celular, por lo que no abrirá esta web. Para revisar tamaños ahora puedes estrechar la ventana del navegador. El acceso real desde otro dispositivo se preparará con una dirección de red local controlada o con el despliegue gratuito, cuando se retomen esas fases.

## Qué falta para la versión conectada

Completar la configuración privada, validar y aplicar las migraciones al proyecto dedicado, preparar las cuentas ficticias y comprobar acceso, archivos, invitación y recuperación con destinatarios controlados. La revisión visual y las pruebas locales ya tienen resultados; aún faltan integración real, cobertura adicional, copia/restauración y despliegue. El detalle está en ESTADO.md y VALIDACION-PENDIENTE.md.
