# Validación pendiente y límites del avance

Fecha: 7 de noviembre de 2026. Este documento describe trabajo pendiente; no es un certificado de pruebas superadas.

## Autorización vigente

El usuario había aplazado pruebas, compilaciones de verificación y despliegue. La petición posterior «Entonces continua con todo lo que falta sin parar» permite avanzar con implementación, pero no revoca de forma inequívoca ese aplazamiento.

En este bloque se ejecutó una comprobación de tipos que terminó correctamente en una versión intermedia. También se ejecutó lint: señaló cinco errores no-undef. Se corrigieron los imports de URL y process y los globals del service worker señalados, pero no se repitió la comprobación. Esos resultados no acreditan la versión final, que cambió después.

La revisión automática rechazó ejecutar el script de migraciones y permisos en PostgreSQL local por el aplazamiento anterior. El script no llegó a ejecutarse. Se pidió autorización expresa para retomar pruebas locales, sin aplicar nada a Supabase ni enviar correos; su respuesta está pendiente. No volver a ejecutar verificaciones hasta recibirla. La lectura del código y el guardado Git continúan permitidos.

El servidor de desarrollo se abrió para mostrar el trabajo al usuario. Se observó la landing real cargada en el navegador. No se ha realizado un recorrido funcional completo ni una revisión visual de todos los estados y tamaños.

## Orden propuesto cuando se autoricen pruebas locales

1. Ejecutar lint y typecheck; corregir problemas reales de la versión actual.
2. Compilar y ejecutar la versión optimizada. No confundir que el servidor de desarrollo arranque con una compilación de producción aprobada.
3. Ejecutar scripts/test-database.ps1, con PostgreSQL local en PATH. Crea un clúster nuevo bajo work, escucha únicamente en loopback y detiene su propio proceso al terminar. No usa DATABASE_URL ni conecta con Supabase.
4. Las pruebas SQL preparadas en supabase/tests crean un sustituto mínimo de Auth y Storage. Comprueban aislamiento entre estudiantes, grupos docentes, reemplazos, notas, MFA, suspensión, doble autorización, cierre pendiente y contacto. Aunque pasaran, no probarían el servicio real de Auth, subida de archivos o entrega de correo.
5. Recorrer la interfaz en escritorio y móvil: publicación a varios grupos/personas, entrega tardía, autorización de reemplazo, calificación, comentarios, historial, preferencias y formularios con errores.
6. Revisar teclado, foco, lectores de pantalla, contraste, temas, movimiento reducido y estados de red lenta/fallo. Completar la revisión de acabado de Impeccable sobre capturas reales; documentar el sistema visual desde el resultado, sin atribuir aprobaciones inexistentes.

## Integración y publicación: una fase posterior

- Faltan claves y configuración local: Publishable, clave secreta de servidor, dominio institucional de demostración, retorno de recuperación y secreto de contacto. No pegar sus valores en el chat ni versionarlos.
- Hay 19 migraciones escritas, ninguna aplicada en esta fase. Revisarlas y probarlas en orden antes de tocar el proyecto dedicado.
- Las migraciones originales crean tablas y bucket nuevos. No ejecutarlas sobre un proyecto con datos ajenos ni repetir manualmente un archivo ya aplicado.
- La semilla remota de 47 cuentas es distinta de la vista previa en memoria. Permanece deshabilitada; solo admite el proyecto explícito y correos .invalid, sin enviar invitaciones. Sus materias y pesos son ejemplos, no políticas aprobadas.
- Las invitaciones y recuperación se comprobarán únicamente con destinatarios reales controlados y autorización de envío. Que la API responda no acredita que el correo haya llegado.
- Comprobar denegaciones de API y Storage con tokens reales y sesiones suspendidas. No basta ocultar elementos en pantalla.
- Preparar una copia privada y observar una restauración de base y archivos.
- Revisar condiciones gratuitas vigentes y consumo en las cuentas antes de publicar. Las cuotas internas limitan uso de la aplicación, pero no garantizan disponibilidad ni evitan por sí solas consumo en el proveedor.
- La PWA solo tiene manifiesto y un fallback público. Instalación, actualización y ausencia de datos privados en cachés aún necesitan revisión.

## Decisiones y límites funcionales pendientes

- Fórmula exacta del promedio provisional y manejo de categorías vacías. El panel real conserva la respuesta de política pendiente del backend; la vista previa identifica su promedio ilustrativo. No afirmar que el promedio ponderado final de esta función esté resuelto.
- Reglas de cambios de evaluación, reapertura y correcciones de períodos cerrados; vigencia detallada del permiso de reemplazo.
- Confirmar si las traducciones revisadas por el autor satisfacen el alcance deseado. No existe traducción automática ni traducción del interior de PDFs/fotos.
- Las pantallas conectadas cargan hasta 100 registros por recurso y avisan del límite. Falta integrar la paginación completa y los modelos de lectura del backend para escalar más allá de la muestra.
- Reintentos de carga parcialmente completada y conciliación de reservas necesitan recorridos de fallo. Una reserva sin confirmación no equivale a una entrega.
- Probar simultaneidad y doble clic antes de dar por cerrados recibos, borrados y periodos. La simulación en memoria no demuestra estas garantías.

Estos pendientes impiden declarar el sistema completo, listo para producción o desplegado.
