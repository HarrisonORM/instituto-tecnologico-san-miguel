# Frontend implementado y conexión preparada

Se implementó la dirección B+C elegida por el usuario: composición editorial esmeralda y fotografía de campus con profundidad. Ante «Entonces continua con todo lo que falta sin parar», el agente concretó la composición 2 como referencia de implementación. Esta es una decisión de ejecución delegada; no es una nueva aprobación explícita del usuario de ese render ni de cada detalle del resultado.

## Pantallas y componentes

- Landing con navegación, portada fotográfica animada, explorador de cinco programas, comunidad, historia, misión/visión, preguntas frecuentes y contacto con consentimiento. Cada programa tiene página e imagen propias en ES/EN.
- Páginas de programas, acceso institucional, recuperación y confirmación de contraseña. Sin registro público.
- Portal de estudiantes, docentes, administración académica y administración del sistema. Una sesión real usa sus roles devueltos por el servidor; cambiar una URL no concede roles.
- Vista previa independiente con 47 identidades ficticias. Comparte el estado durante la navegación del cliente y reinicia al recargar. Las operaciones sensibles no se ejecutan en el servidor desde esa vista.
- Preferencias globales ES/EN, Claro/Oscuro/Sistema y reducción de movimiento. Solo las preferencias se guardan en localStorage; las sesiones institucionales y los archivos de muestra permanecen en memoria.
- Estados de carga, vacío, error y confirmación, formularios y tablas adaptables. Su accesibilidad y comportamiento necesitan la revisión pendiente.

## Operaciones conectadas por código

El portal utiliza src/client/api.ts y los contratos del backend para publicar tareas por grupos/personas, entregar archivos, consultar y autorizar versiones, comentar, calificar y consultar historial. Administración dispone de estructura, matrículas, categorías, cierre, identidad, cuentas, permisos, estados, MFA y solicitudes de baja con dos administradores. Esto describe la conexión escrita, no recorridos reales ya aprobados.

Los errores de Supabase no convierten la sesión real en datos de demostración. Se descartan respuestas cuando cambia la sesión y no se muestran datos cargados para otro usuario. La autorización definitiva debe permanecer en servidor, RLS y Storage y todavía requiere pruebas.

## Recursos visuales

Manrope se sirve localmente con licencia OFL incluida. Las cuatro fotografías son ilustraciones fotográficas generadas para el proyecto, no imágenes de una universidad real. Se conservan prompts y procedencia. Las versiones WebP de campus, comunidad y ambos programas suman aproximadamente 1,1 MB; no se cargó un video de portada ni una API de imágenes de pago.

La placa de campus original mide 1911 × 823. No se amplió artificialmente ni se declaró superada la antigua exigencia de 1,5 veces el tamaño del comp. La implementación sigue una ruta guiada por código, manteniendo el comp como referencia visual, con revisión de acabado pendiente.

## Contacto y traducciones

Migración 017 y POST /api/contact preparan recepción privada con consentimiento, honeypot y límites transaccionales por huella de correo y global. CONTACT_RATE_LIMIT_SECRET se queda en el servidor. La lectura y el marcado requieren contact.manage y verificación administrativa. El canal no envía respuestas externas automáticamente.

Migración 018 añade versiones ES/EN revisadas de tareas, comentarios, programas, materias y categorías. Cada traducción se vincula a la huella del original: si cambia, deja de mostrarse hasta revisión. Los permisos siguen el recurso original. No traduce adjuntos ni usa servicios externos. Migración 019 registra la revisión de consultas de contacto.

## Revisión y sistema documentado

Se tomaron capturas de escritorio/móvil y se revisaron de forma independiente. Dos hallazgos materiales (aviso de ficción y contraste de misión/visión) se corrigieron y se puntuaron Resolved. El veredicto ship se limita a esa lista, sin convertirlo en aprobación global o de Supabase. DESIGN.md y .impeccable/design.json recogen los tokens y reglas extraídos del código. No canonizan como mínimos los auxiliares densos de 9–11 px. VALIDACION-PENDIENTE.md conserva resultados y límites abiertos.
