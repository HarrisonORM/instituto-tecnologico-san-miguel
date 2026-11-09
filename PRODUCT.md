# Instituto Tecnológico de San Miguel

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Base del plan aceptado: Next.js, React, TypeScript, Tailwind CSS, PostgreSQL mediante Supabase, Supabase Auth y Storage, Zod, Git y GitHub. Pruebas previstas con Vitest, Playwright y comprobaciones de permisos en la base de datos. Publicación personal en Vercel Hobby sujeta a condiciones gratuitas. Hay implementación local de backend, cliente, landing y paneles por rol; las 23 migraciones y escenarios SQL se comprobaron localmente; integración real y recorridos completos contra Supabase siguen pendientes.

El encargo de arranque establece una aplicación Next.js modular en un solo repositorio. Separar interfaz, operaciones del servidor, validaciones, integraciones y cambios de base de datos.

Proyecto de Supabase: `instituto-tecnologico-san-miguel`, nombre confirmado por el usuario. Su captura muestra el recurso creado en Free, Healthy, región East US (Ohio), us-east-2. El usuario compartió la comprobación correcta de Auth con registro público desactivado; datos, archivos y correo siguen pendientes; el estado operativo se registra en docs/ESTADO.md.

## Users

- Visitante: consulta historia, carreras, precios y contacto; solo información pública.
- Estudiante: consulta sus materias, tareas, entregas, notas y comentarios, y sube evidencias; accede exclusivamente a su información académica.
- Docente: gestiona sus grupos, publica tareas, revisa entregas y califica; accede únicamente a las materias y grupos asignados.
- Administrativo académico: gestiona carreras, períodos, grupos, matrículas y correcciones autorizadas de datos; cada función requiere un permiso específico.
- Administrador del sistema: crea cuentas, asigna permisos, suspende, reactiva y revisa actividad; gestionar cuentas no concede automáticamente acceso a todas las notas.

La matriz fue confirmada por el usuario mediante la imagen adjunta. No ampliar permisos por conveniencia de implementación.

### Gestión de personas confirmada (8 de noviembre de 2026)

- Conservar la separación por rol, confirmada expresamente por el usuario: los seis permisos de estructura, matrículas, evaluación, cierre, identidad y contacto corresponden exclusivamente al administrativo académico. El docente conserva tareas, entregas y calificaciones de sus grupos asignados.
- Corrección posterior del usuario: cada persona tiene un único rol. Cambiarlo sustituye el anterior; no se acumulan roles. Los conflictos antiguos requieren una decisión explícita antes de activar la restricción; no elegir uno automáticamente.
- Mientras exista un conflicto antiguo, la pantalla explica la corrección previa a cargo del propietario y no ofrece guardar el rol ni solicita MFA para ese intento. Una actualización pendiente no se presenta como un problema del autenticador.
- Al gestionar un estudiante no aparecen controles de roles del personal ni permisos académicos. El personal utiliza un selector de rol único; los seis permisos específicos siguen siendo casillas exclusivas del administrativo académico.
- El administrador del sistema filtra el directorio por estudiante, docente, administrativo académico o administrador del sistema, combinándolo con búsqueda por nombre o documento.
- Cada permiso académico tiene su propia casilla, precargada con el valor guardado. El conjunto se guarda de forma atómica con una sola verificación contextual. Cancelar conserva el borrador; una edición desactualizada se rechaza para evitar sobrescribir cambios ajenos.
- Quitar el rol académico retira sus permisos; volver a concederlo no recupera permisos antiguos automáticamente. Las restricciones se comprueban en la base, además de la interfaz.
- El usuario rechazó la división permanente del directorio y el detalle en dos mitades por resultar estrecha. Directorio, ficha e invitación se presentan como vistas separadas a todo el ancho disponible. Volver conserva búsqueda/filtro y devuelve el foco; los encabezados usan tamaños fijos de interfaz, conservando el estilo B+C.

## Product Purpose

Desarrollar una aplicación universitaria fullstack, utilizable desde celular y computador, con una landing pública y áreas académicas protegidas. El proyecto es una demostración realista de portafolio con datos ficticios y presupuesto de cero para servicios e infraestructura.

## Operating Context

- El usuario ha usado React o desarrollado un backend, pero necesita explicaciones detalladas y pasos pequeños para seguir el proyecto.
- Cada bloque de trabajo debe indicar objetivo, explicación, pasos concretos, resultado esperado, comprobación y punto de guardado.
- Preferencia confirmada para el historial: commits con título claro y descripción detallada de cambios y comprobaciones, conforme a AGENTS.md.
- Orden actualizado: después de adelantar backend y frontend, el usuario autorizó expresamente retomar la validación local. No incluye escrituras en Supabase, correo ni despliegue. La dirección B+C ya está elegida; los resultados y el siguiente paso están en docs/ESTADO.md.
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

El usuario solicitó un correo de bienvenida con el nombre Instituto Tecnológico de San Miguel y un enlace para crear su propia contraseña y acceder a la plataforma. La invitación dirige a /auth/confirmar, no a la portada. El cuerpo y el asunto se personalizan en la plantilla Invite user de Supabase; el nombre/dirección del remitente y su transporte se configuran por separado. Se conserva la recepción por correo confirmada por el usuario sin dar por validada la activación real.

El usuario confirmó que no tiene dominio de correo propio. El acceso y las invitaciones aceptan direcciones personales válidas, incluidas Gmail y Outlook, sin exigir ni comprar un dominio institucional. Se retira la restricción INSTITUTION_EMAIL_DOMAIN; el alta sigue reservada al administrador activo con verificación y sin registro público. La aceptación de la dirección no acredita entrega: el transporte SMTP se configura y comprueba por separado.

Actualización confirmada el 8 de noviembre: retirar el formulario permanente de verificación de Seguridad y pedir el código en el contexto de una acción protegida, mediante ventana adaptable. Seguridad conserva el estado y la configuración inicial del autenticador. Cambiar o recuperar una contraseña de una cuenta con factor verificado solicita ese factor antes de guardar; perder el autenticador requiere recuperación asistida, sin desactivarlo automáticamente.

La implementación conserva las operaciones privilegiadas ya protegidas (cuentas, roles, permisos, correcciones y cierre, entre otras); no interpreta los ejemplos de bajas y contraseña como autorización para quitar la protección restante. La consulta del panel sigue limitada por rol/recurso sin pedir código. La pregunta opcional sobre limitar el alcance exclusivamente a bajas y contraseña sigue sin respuesta: conservar la cobertura anterior es una decisión técnica provisional, no una nueva aprobación del usuario. La frescura del código de 90 segundos en servidor es una propuesta implementada localmente; no es una autorización vinculada a una sola operación.


- Comprobar permisos, estado de cuenta y relación con cada recurso tanto en el servidor como en la base de datos y el almacenamiento.
- Utilizar almacenamiento privado, MFA con aplicación autenticadora para funciones privilegiadas, auditoría y operaciones reversibles para las bajas ordinarias.
- La baja ordinaria de usuarios con historial académico es el archivado reversible, conservando ese historial. La eliminación definitiva solo se permite para cuentas sin historial académico, con verificación adicional y autorización de dos administradores distintos. Conservar auditoría de la operación.
- Mantener el coste de los servicios en cero: planes gratuitos, subdominio gratuito y recursos con licencias gratuitas. Verificar las condiciones antes de contratar o desplegar.
- Los límites de archivo, espacio, solicitudes y correos se aplicarán en el servidor y tendrán margen respecto a las cuotas del proveedor.
- No garantizar disponibilidad permanente con servicios gratuitos. Documentar inactividad, reactivación, cuotas y restauración de copias.
- Validar temprano un envío real de invitación y recuperación sin comprar un dominio; no dar esta integración por resuelta hasta comprobarla. Las pruebas locales podrán capturar correos sin enviarlos.
- No enviar mensajes a direcciones ficticias. Usar destinatarios reales controlados para probar correo.
- La demostración aprobada tiene 40 estudiantes, 4 docentes, 1 administrativo académico y 2 administradores del sistema (47 cuentas), usuarios matriculados inicialmente en Desarrollo de Software y Redes y Telecomunicaciones, cuatro materias, seis grupos y un período de prueba.
- Los límites internos concretos de archivos y consumo siguen siendo propuestas técnicas de planificación; deben distinguirse de las cuotas del proveedor y verificarse antes del despliegue.

### Ampliación de catálogo y presentación confirmada (7 de noviembre de 2026)

- Cinco programas públicos: Desarrollo de Software, Redes y Telecomunicaciones, Auxiliar Contable, Auxiliar Administrativo y Mantenimiento y Reparación de Equipos Biomédicos. Cada uno tendrá descripción, áreas de aprendizaje e imagen propia en ES/EN.
- Las tres carreras nuevas se incluyen en contacto y en el catálogo académico preparado. Se mantienen 47 cuentas, cuatro materias y seis grupos; las carreras nuevas aún no tienen grupos ni matrículas de ejemplo.
- Corregir el selector de tema como un único control: icono, texto, flecha y contorno sobre la misma superficie, conservando Claro/Oscuro/Sistema.
- El usuario retiró los avisos persistentes de institución ficticia en la presentación. Esta decisión sustituye la recomendación anterior del revisor; no ocultar qué operaciones son de vista previa ni afirmar integraciones sin comprobar.

### Individualización confirmada de los paneles (7 de noviembre de 2026)

- Retirar de toda la interfaz los avisos que llamen ficticia a la institución. No alterar la naturaleza sintética de los datos de desarrollo ni inventar hechos institucionales.
- Retirar los selectores globales de rol y persona del interior de los paneles. Cada vista previa usa una cuenta de ejemplo fija para su rol; la URL `persona` ya no elige otro estudiante.
- El estudiante no tiene directorio ni selector de compañeros, ni sus perfiles, matrículas, entregas, notas, comentarios o archivos. El docente conserva únicamente el listado necesario de sus grupos asignados.
- Pestañas distintas por rol y acciones académicas visibles según permisos específicos. Las comprobaciones de servidor/base siguen siendo obligatorias; una vista previa pública no crea sesión institucional ni concede privilegios.

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
- Nombres y contenidos concretos de las cuatro materias y los seis grupos, fechas del período de prueba y contenido institucional ficticio. Las 47 cuentas y sus asignaciones iniciales se conservan. El catálogo se amplió a cinco programas por petición posterior.
- Límites internos y compatibilidad del servicio gratuito de correo, que solo pueden considerarse verificados después de una prueba real.
- Implementación provisional de traducciones: versiones ES/EN revisadas por autores o personal autorizado, con huella del original y permisos del recurso. No usa API externa ni traduce adjuntos; su suficiencia frente al alcance deseado necesita confirmación.
- Traducción del contenido académico confirmada como requisito: falta elegir versiones ES/EN redactadas o revisadas por el autor frente a generación automática, y definir por separado el interior de documentos e imágenes adjuntos. No hay servicio de traducción elegido ni autorización para generar costes.
- La dirección B+C está confirmada. Ante la delegación «Entonces continua con todo lo que falta sin parar», el agente concretó la implementación tomando la composición 2 como referencia. Falta la revisión del resultado real en escritorio y móvil; no atribuir al usuario aprobación explícita de ese render.

## Brand Commitments

- Nombre confirmado: Instituto Tecnológico de San Miguel.
- El proyecto utiliza una institución y datos ficticios. Por petición expresa del usuario del 7 de noviembre de 2026, la presentación pública y el acceso no llevan avisos de «institución ficticia» o «proyecto de portafolio». La privacidad distingue las cuentas de ejemplo del acceso institucional, sin llamar ficticia a la institución. La vista previa sigue identificada como tal. No inventar acreditaciones, testimonios, fechas, precios o resultados reales.
- El nombre se ha decidido; la identidad visual se creará durante el proyecto.
- El usuario ha elegido que Codex presente propuestas visuales y espere su elección antes de programar las pantallas.
- El frontend debe ser personalizado y coherente entre landing y paneles, con especial atención a celular y computador.
- Referencia cromática confirmada: esmeralda luminoso #48B292. El usuario aportó dos referencias de landing institucional y quiere movimiento en la imagen protagonista. Los paneles conservarán el esmeralda con menor intensidad visual.
- Medio de portada confirmado: fotografía con movimiento suave, en lugar de video de fondo.
- Dirección elegida por el usuario: combinar B (Campus abierto) con C (Campus en profundidad). Se desarrollará una propuesta que una la estructura y presencia esmeralda de B con la profundidad fotográfica de C; esa distribución concreta de elementos es la interpretación de diseño que se pondrá ante el usuario.
- Preferencia confirmada: seguir utilizando Impeccable para todo el trabajo de diseño del proyecto.
- La implementación usa Manrope local con licencia OFL, monograma ITSM, esmeralda #48B292, superficies de menta y fotografía ilustrativa con movimiento reducible. Son decisiones de ejecución dentro de B+C; falta revisión de acabado, no se convierten en preferencias expresas adicionales del usuario. Requisitos en docs/DISENO-REQUISITOS.md y alcance en docs/FRONTEND-IMPLEMENTADO.md.

## Evidence on Hand

- Encargo completo del usuario leído íntegramente al iniciar el bloque, junto con sus requisitos y decisiones previamente documentados.
- Los roles de una imagen confirmada por el usuario están transcritos en este documento. No se necesita la imagen temporal para comprender los permisos.
- La carpeta empezó vacía. Ahora contiene backend académico, administración, almacenamiento, cliente, landing y paneles, con vista previa ficticia independiente. El proyecto de Supabase fue creado por el usuario; las 20 migraciones no se han aplicado a ese servicio. La dirección B+C está confirmada y se concretó en código bajo la delegación posterior. Los resultados parciales no acreditan el conjunto actual; consultar docs/ESTADO.md.
- El prompt original y los archivos exportados de la conversación sirven de referencia histórica. Este PRODUCT.md es la fuente de requisitos mantenida para continuar el desarrollo.

## Product Principles

- Privacidad por defecto y permisos comprobables por recurso.
- Realismo de los recorridos académicos con datos ficticios coherentes.
- Presupuesto de cero con una escala de demostración controlada.
- Aprendizaje guiado mediante pasos pequeños y verificables.
- Personalidad visual al servicio de la claridad y la facilidad de uso.

## Accessibility & Inclusion

La aplicación debe ser utilizable desde celular y computador. El plan incluye navegación por teclado, formularios accesibles y estados comprensibles de carga, error y confirmación; comunicar entregas tardías mediante texto y no solo mediante color.
