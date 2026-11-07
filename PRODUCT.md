# Instituto Tecnológico de San Miguel

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Base del plan aceptado: Next.js, React, TypeScript, Tailwind CSS, PostgreSQL mediante Supabase, Supabase Auth y Storage, Zod, Git y GitHub. Pruebas previstas con Vitest, Playwright y comprobaciones de permisos en la base de datos. Publicación personal en Vercel Hobby sujeta a condiciones gratuitas. Hay implementación local de backend y una capa de cliente sin vistas; migraciones, integraciones y comportamiento siguen pendientes de ejecución y validación.

El encargo de arranque establece una aplicación Next.js modular en un solo repositorio. Separar interfaz, operaciones del servidor, validaciones, integraciones y cambios de base de datos.

Proyecto de Supabase: `instituto-tecnologico-san-miguel`, nombre confirmado por el usuario. Su captura muestra el recurso creado en Free, Healthy, región East US (Ohio), us-east-2. La conexión desde la aplicación todavía está pendiente de comprobación; el estado operativo se registra en docs/ESTADO.md.

## Users

- Visitante: consulta historia, carreras, precios y contacto; solo información pública.
- Estudiante: consulta sus materias, tareas, entregas, notas y comentarios, y sube evidencias; accede exclusivamente a su información académica.
- Docente: gestiona sus grupos, publica tareas, revisa entregas y califica; accede únicamente a las materias y grupos asignados.
- Administrativo académico: gestiona carreras, períodos, grupos, matrículas y correcciones autorizadas de datos; cada función requiere un permiso específico.
- Administrador del sistema: crea cuentas, asigna permisos, suspende, reactiva y revisa actividad; gestionar cuentas no concede automáticamente acceso a todas las notas.

La matriz fue confirmada por el usuario mediante la imagen adjunta. No ampliar permisos por conveniencia de implementación.

## Product Purpose

Desarrollar una aplicación universitaria fullstack, utilizable desde celular y computador, con una landing pública y áreas académicas protegidas. El proyecto es una demostración realista de portafolio con datos ficticios y presupuesto de cero para servicios e infraestructura.

## Operating Context

- El usuario ha usado React o desarrollado un backend, pero necesita explicaciones detalladas y pasos pequeños para seguir el proyecto.
- Cada bloque de trabajo debe indicar objetivo, explicación, pasos concretos, resultado esperado, comprobación y punto de guardado.
- Preferencia confirmada para el historial: commits con título claro y descripción detallada de cambios y comprobaciones, conforme a AGENTS.md.
- Orden actualizado por el usuario: priorizar código del backend, adelantar su implementación y aplazar las pruebas y el despliegue. Las pruebas pendientes de viabilidad siguen abiertas; no bloquean escribir código local. El diseño visual sigue sujeto a elección antes de programar pantallas. Los resultados y el siguiente paso están en docs/ESTADO.md.
- Este archivo es la fuente actual de requisitos. docs/PLAN.md contiene las etapas; docs/ESTADO.md registra el avance y docs/ENTORNO.md contiene las comprobaciones del entorno. No crear copias alternativas de los requisitos.
- El estudiante entrega evidencias y consulta resultados; el docente trabaja con varios grupos y necesita revisar tanto por tarea como por estudiante.
- El sistema administra identidades y estados de cuenta; el personal académico administra la estructura institucional según permisos explícitos.

## Capabilities and Constraints

### Reglas confirmadas

- Las calificaciones estarán en el intervalo de 0.0 a 5.0, inclusive.
- La nota final se redondea a un decimal antes de determinar la aprobación; la nota final mínima aprobatoria es 3.0, inclusive. Ejemplos confirmados: 2.95 se convierte en 3.0 y aprueba; 2.94 se convierte en 2.9 y no aprueba. Realizar el redondeo final una sola vez y usar cálculos decimales consistentes con estos ejemplos.
- La nota final se calculará mediante porcentajes por materia y categorías de evaluación. El administrativo académico define las categorías y sus pesos, cuya suma debe ser 100 %; el rol docente no permite definirlos ni modificarlos. Las actividades de una misma categoría tienen el mismo peso entre sí. Los valores concretos de los porcentajes siguen pendientes; el ejemplo previo de 30 % / 30 % / 40 % no fue aprobado como distribución fija.
- Una nota queda visible para el estudiante inmediatamente después de que el docente la asigne y guarde. No añadir un paso independiente de publicación ni ocultarla como borrador una vez asignada.
- Durante el período se muestran las notas individuales y un promedio provisional ponderado de las actividades calificadas, claramente identificado y con las actividades pendientes separadas. No marcar aprobación o reprobación definitiva hasta el cierre.
- Al cierre, las actividades aplicables no entregadas reciben 0.0 automáticamente, con trazabilidad del proceso. Las entregas realizadas que sigan pendientes de revisión bloquean el cierre; nunca convertirlas automáticamente en cero por falta de calificación. El usuario eligió esta automatización, no la alternativa de exigir registro manual de cada cero.
- Se admiten entregas posteriores a la fecha límite. Debe quedar claramente indicado que la entrega está fuera de plazo, conservando la fecha límite y la fecha y hora de recepción.
- No hay penalización automática por entrega tardía. Mostrar el retraso sin descontar puntos automáticamente.
- Se permite una sola entrega confirmada por actividad y estudiante. Cualquier reemplazo o reentrega requiere autorización previa de un docente asignado, tanto antes como después de calificar. Conservar el historial de versiones autorizadas y sus fechas; marcar las versiones tardías. No confundir guardar un borrador con confirmar una entrega.
- Una cuenta suspendida pierde acceso a nuevas operaciones incluso si tenía una sesión abierta; se conserva su historial académico. Recuperar la contraseña no elimina la suspensión.
- El estudiante puede cambiar su dirección, foto y contraseña. Nombre, documento, fecha de nacimiento y carrera cursada quedan protegidos; las correcciones corresponden a personal autorizado y deben registrarse.
- Los docentes pueden actualizar sus datos personales permitidos, manteniendo protegidos sus datos de identidad y asignaciones institucionales.
- Las cuentas se crean mediante personal autorizado; el usuario establece su contraseña a través de activación o invitación. No habrá registro público abierto.
- El estudiante no puede consultar calificaciones, entregas ni información privada de otras personas. El docente solo accede a la información pertinente a sus materias y grupos.
- Las tareas pueden asignarse a un grupo, varios grupos del docente o estudiantes seleccionados entre sus grupos. Los destinatarios se validan en el servidor.

### Plan de seguridad y presupuesto

- Comprobar permisos, estado de cuenta y relación con cada recurso tanto en el servidor como en la base de datos y el almacenamiento.
- Utilizar almacenamiento privado, MFA con aplicación autenticadora para funciones privilegiadas, auditoría y operaciones reversibles para las bajas ordinarias.
- La baja ordinaria de usuarios con historial académico es el archivado reversible, conservando ese historial. La eliminación definitiva solo se permite para cuentas sin historial académico, con verificación adicional y autorización de dos administradores distintos. Conservar auditoría de la operación.
- Mantener el coste de los servicios en cero: planes gratuitos, subdominio gratuito y recursos con licencias gratuitas. Verificar las condiciones antes de contratar o desplegar.
- Los límites de archivo, espacio, solicitudes y correos se aplicarán en el servidor y tendrán margen respecto a las cuotas del proveedor.
- No garantizar disponibilidad permanente con servicios gratuitos. Documentar inactividad, reactivación, cuotas y restauración de copias.
- Validar temprano un envío real de invitación y recuperación sin comprar un dominio; no dar esta integración por resuelta hasta comprobarla. Las pruebas locales podrán capturar correos sin enviarlos.
- No enviar mensajes a direcciones ficticias. Usar destinatarios reales controlados para probar correo.
- La demostración aprobada tiene 40 estudiantes, 4 docentes, 1 administrativo académico y 2 administradores del sistema (47 cuentas), dos carreras ficticias —Desarrollo de Software y Redes y Telecomunicaciones—, cuatro materias, seis grupos y un período de prueba.
- Los límites internos concretos de archivos y consumo siguen siendo propuestas técnicas de planificación; deben distinguirse de las cuotas del proveedor y verificarse antes del despliegue.

### Funciones incluidas y organización

- Landing pública con historia, oferta académica, precios ilustrativos y contacto de una institución ficticia. No incluir acreditaciones, testimonios, cobros ni resultados reales inventados.
- Requisito confirmado de frontend: todas las vistas tendrán selector español/inglés y tema Claro, Oscuro o Sistema. El usuario confirmó que también quiere traducir contenido académico. El mecanismo de traducción y el alcance del interior de adjuntos quedan por concretar dentro del presupuesto de cero.
- Landing con sobre nosotros, programas e imágenes por programa, historia, misión, visión, contacto o captura de interesados y acceso directo de estudiantes y docentes. Debe tener movimiento y efectos; los paneles deben ser sencillos y reducir distracciones.
- Distinguir carrera, período, materia del catálogo y grupo/oferta de una materia en un período. Matrículas y asignaciones docentes determinan el alcance académico.
- Estudiante: navegación por materia, tareas pendientes y realizadas, evidencias y conversación privada de cada entrega. No exponer listados de notas o entregas de compañeros.
- Docente: revisar por tarea o por estudiante de una materia, con grupos ordenados, búsqueda, filtros y paginación. Selección múltiple de grupos o estudiantes y resumen de destinatarios antes de publicar.
- Distinguir borrador, entrega confirmada, retraso y estado de revisión. Conservar versiones y comprobante de entrega. La fecha de recepción se determina en el servidor.
- Calendario académico, rúbricas, bandeja de notificaciones, solicitudes de corrección de datos, historial de notas y cierre de períodos forman parte del plan. Priorizar notificaciones dentro de la aplicación para controlar los envíos de correo.
- PWA en la última etapa, después de definir qué recursos puede guardar el dispositivo y cómo proteger información académica en dispositivos compartidos.
- Copias privadas de base de datos y archivos y prueba de restauración antes de dar por terminada la demostración.
- Comprobar denegaciones mediante API y almacenamiento, además de los recorridos visibles. No considerar seguridad suficiente ocultar botones o proteger solo el inicio de sesión.

### Propuestas técnicas aún no aprobadas ni verificadas

- Archivos PDF, JPG y PNG, hasta 2 MB por archivo y tres adjuntos por entrega, con optimización de fotografías que preserve legibilidad.
- Máximo interno propuesto de 250 MB de archivos; objetivos inferiores a 100 MB de base de datos y 1 GB por cada cuota independiente de transferencia.
- Estas cifras son márgenes iniciales y deben contrastarse con las condiciones vigentes de los proveedores. No son límites oficiales ni una garantía de disponibilidad o gasto.
- Datos ilustrativos editables para categorías, porcentajes, materias, grupos y fechas. No convertir valores de ejemplo en reglas institucionales inmutables.

### Decisiones abiertas

- Porcentajes concretos por materia y reglas de cambio del esquema de evaluación; precisión de notas individuales y fórmula detallada del promedio provisional, con su cobertura y manejo de categorías aún vacías. Las reglas de redondeo final y conversión de no entregadas a cero al cierre ya están confirmadas.
- Detalles de las autorizaciones de reemplazo de entregas: alcance y caducidad del permiso, revisión de una nota previa y comportamiento al cerrar un período.
- Nombres y contenidos concretos de las cuatro materias y los seis grupos, fechas del período de prueba y contenido institucional ficticio. Las dos carreras y las 47 cuentas ya están aprobadas.
- Límites internos y compatibilidad del servicio gratuito de correo, que solo pueden considerarse verificados después de una prueba real.
- Traducción del contenido académico confirmada como requisito: falta elegir versiones ES/EN redactadas o revisadas por el autor frente a generación automática, y definir por separado el interior de documentos e imágenes adjuntos. No hay servicio de traducción elegido ni autorización para generar costes.
- Proceso visual delegado por el usuario: Codex presentará alternativas y el usuario elegirá antes de programar las pantallas. Esta elección futura es intencional y no debe convertirse en una decisión unilateral del agente.

## Brand Commitments

- Nombre confirmado: Instituto Tecnológico de San Miguel.
- La universidad es ficticia y el contenido debe presentarse como demostración, sin afirmar acreditaciones, testimonios o resultados reales.
- El nombre se ha decidido; la identidad visual se creará durante el proyecto.
- El usuario ha elegido que Codex presente propuestas visuales y espere su elección antes de programar las pantallas.
- El frontend debe ser personalizado y coherente entre landing y paneles, con especial atención a celular y computador.
- Referencia cromática confirmada: esmeralda luminoso #48B292. El usuario aportó dos referencias de landing institucional y quiere movimiento en la imagen protagonista. Los paneles conservarán el esmeralda con menor intensidad visual.
- Medio de portada confirmado: fotografía con movimiento suave, en lugar de video de fondo.
- La paleta complementaria, tipografías, logo, composición y animaciones concretas siguen como propuestas. Requisitos y lectura de referencias en docs/DISENO-REQUISITOS.md; todavía no hay aprobación de pantallas.

## Evidence on Hand

- Encargo completo del usuario leído íntegramente al iniciar el bloque, junto con sus requisitos y decisiones previamente documentados.
- Los roles de una imagen confirmada por el usuario están transcritos en este documento. No se necesita la imagen temporal para comprender los permisos.
- La carpeta empezó vacía. Ahora contiene backend académico, administración, almacenamiento y cliente técnico sin pantallas. El proyecto de Supabase fue creado por el usuario; las migraciones nuevas no se han aplicado ni probado. La base esmeralda y las referencias están confirmadas; la composición e identidad visual completas siguen pendientes de elección. Los resultados anteriores de entorno no acreditan este código nuevo; consultar docs/ESTADO.md.
- El prompt original y los archivos exportados de la conversación sirven de referencia histórica. Este PRODUCT.md es la fuente de requisitos mantenida para continuar el desarrollo.

## Product Principles

- Privacidad por defecto y permisos comprobables por recurso.
- Realismo de los recorridos académicos con datos ficticios coherentes.
- Presupuesto de cero con una escala de demostración controlada.
- Aprendizaje guiado mediante pasos pequeños y verificables.
- Personalidad visual al servicio de la claridad y la facilidad de uso.

## Accessibility & Inclusion

La aplicación debe ser utilizable desde celular y computador. El plan incluye navegación por teclado, formularios accesibles y estados comprensibles de carga, error y confirmación; comunicar entregas tardías mediante texto y no solo mediante color.
