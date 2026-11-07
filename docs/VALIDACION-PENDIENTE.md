# Validación local y pendientes

Fecha: 7 de noviembre de 2026. El usuario autorizó expresamente retomar pruebas locales, sin modificar Supabase ni enviar correos. El aplazamiento y el rechazo por esa restricción son históricos. Un bloqueo temporal de la revisión automática por límite de uso se resolvió después de la hora de reintento indicada; no se eludió.

## Resultados observados

| Comprobación | Resultado y alcance |
|---|---|
| npm.cmd run lint | Código 0 tras corregir fetch en los globals del service worker. |
| npm.cmd run typecheck | Código 0. La compilación final también ejecutó TypeScript correctamente. |
| npm.cmd run build | Código 0 con Webpack, opción oficial incluida en Next.js. Turbopack falló al iniciar un proceso de CSS, incluso fuera de la ejecución restringida; se cambió el comando de build, sin cambiar dependencias ni omitir verificaciones. |
| npm.cmd run test:services | 9 pruebas Node aprobadas, con respuestas controladas y sin red. |
| scripts/test-database.ps1 | Las 19 migraciones y security.sql / academic.sql terminaron con código 0 en un clúster nuevo. Se detuvo su propio servidor en finally. |
| Prueba HTTP local | 5 pruebas Node aprobadas contra la compilación en 127.0.0.1:3001: páginas, cuatro muestras, rechazo de lecturas/escrituras sin sesión, contacto inválido y cabeceras/métodos. No usó credenciales. |
| Recorrido de navegador | Publicar tarea en dos grupos, entrega tardía, comentario, nota 4.3 visible al estudiante, reemplazo autorizado y dos versiones conservadas. Solo datos ficticios en memoria. |
| Interfaz | Capturas de escritorio y móvil, cambio de ES/EN, temas, selector de programas, etiquetas de grupo y acceso privado. No equivale a una auditoría completa de accesibilidad. |

## Qué cubrieron las suites SQL

- Estudiante: perfil, tareas, notas, traducciones y metadatos de archivos propios; denegación de datos ajenos.
- Docente: grupo asignado, calificación, reemplazo autorizado y evidencias vinculadas. Administrar cuentas no da acceso académico.
- Suspensión de una identidad ya abierta; MFA para acciones administrativas y doble autorización de baja.
- Entrega única, marca tardía, versiones y bloqueo de cierre con entregas pendientes de revisión.
- Cierre con ceros no entregados y trazabilidad; 2.95 → 3.0 aprueba y 2.94 → 2.9 no aprueba.
- Categorías 60/40 y actividades con igual peso dentro de su categoría: ((4+2)/2)×0.6 + 4×0.4 = 3.4.
- Resultado final propio y rechazo de modificaciones después del cierre.
- Contacto: anónimo no puede saltarse el canal y el intento 61 del día se rechaza con P0429.

Auth y Storage se sustituyen por un esquema local mínimo para probar SQL/RLS. No son el servicio real. Las evidencias del escenario son metadatos; no se ha comprobado carga, inspección o descarga HTTP contra Supabase.

## Correcciones encontradas

La migración 010 usaba window, palabra reservada, como variable SQL; se cambió a window_start. El script esperaba todos los descendientes de pg_ctl mediante Start-Process -Wait; ahora espera solo al controlador, con límite de 45 segundos. Se corrigieron dos aserciones de la propia suite: presupuesto de contacto con P0429 y selección de grupo cuando un estudiante tiene dos resultados. No se relajaron permisos de producción para hacer pasar las pruebas.

La interfaz distingue originales de traducciones disponibles, muestra grupo junto a materia, añade salto al contenido en portales y limita la reducción de movimiento a efectos concretos. La revisión visual pidió aviso de institución ficticia en la apertura/acceso móvil y quitar opacidad a misión/visión; ambos cambios se comprobaron sobre la compilación. Su veredicto se registra en ESTADO.md y en .impeccable/review.

## Pendientes reales

- Configurar y probar la integración con Supabase. Ninguna migración se aplicó al proyecto externo en este bloque y no se ejecutó la semilla remota.
- Comprobar activación, sesión, recuperación, MFA, archivos y permisos con identidades/tokens reales en el proyecto dedicado. Invitaciones/recuperación requieren destinatarios reales controlados y autorización de envío.
- Concretar la fórmula del promedio provisional, categorías vacías, cambios de esquema, reapertura y vigencia detallada de reemplazos. El promedio de la muestra no fija una política institucional.
- Confirmar el alcance de traducciones revisadas frente a generación automática. No hay traducción del interior de PDFs/fotos ni una API externa elegida.
- Completar paginación del portal, que actualmente carga hasta 100 registros por recurso; recorridos de fallos de archivos, concurrencia y conciliación.
- Revisar sistemáticamente teclado/lector de pantalla, todos los estados/temas y rendimiento; las capturas son vistas parciales, no pruebas físicas en un celular.
- Observar copia/restauración de base y archivos, revisar cuotas en las cuentas antes de publicar y validar instalación/actualización/offline de PWA.

La validación local no convierte el proyecto en un sistema completo ni listo para producción.
