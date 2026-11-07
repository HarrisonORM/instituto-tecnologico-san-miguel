# Plan de principio a fin

Este plan conserva el orden del encargo. PRODUCT.md contiene los requisitos y docs/ESTADO.md registra el avance; esta página no redefine reglas académicas.

Actualización expresa del usuario: se adelantan las etapas de backend (datos, acceso y operaciones académicas) y se aplazan las pruebas y el despliegue. Los criterios de validación del plan siguen pendientes; escribir código no los da por superados. Las pantallas continúan sujetas a elección visual. Alcance implementado y faltante en docs/BACKEND.md.

| Etapa | Trabajo principal | Evidencia necesaria para terminar |
|---|---|---|
| 1. Punto de partida | Leer el encargo, inspeccionar la carpeta, consolidar requisitos y revisar herramientas. | Documentación coherente, estado inicial registrado y herramientas comprobadas. |
| 2. Entorno y base técnica | Verificar versiones compatibles, preparar estructura técnica, dependencias locales y Git. | Configuración reproducible y comprobaciones técnicas mínimas documentadas, sin pantallas de producto ni servicios de pago. |
| 3. Viabilidad gratuita | Revisar condiciones oficiales y probar base de datos, autenticación, archivo privado, correo real controlado y publicación técnica mínima. | Resultados observados, cuotas y reactivación documentadas. Un correo local no sustituye la prueba de entrega externa. |
| 4. Recorridos y diseño | Definir navegación y presentar alternativas visuales para landing y paneles en celular y computador. | Elección explícita del usuario y dirección visual registrada antes de implementar pantallas. |
| 5. Base del frontend | Construir navegación, formularios, tablas, componentes y estados con datos de muestra identificados. | Recorridos comprensibles en ambos dispositivos, con teclado, carga, vacío, errores y confirmaciones. |
| 6. Datos y acceso | Crear migraciones, estructura académica, invitaciones, recuperación, MFA, perfiles, RLS y archivos privados. | Permisos permitidos y denegados comprobados por servidor, API y almacenamiento. |
| 7. Recorrido académico completo | Docente publica, estudiante entrega, docente comenta y califica, estudiante consulta. | Datos persistidos, nota visible al guardar, evidencia privada y reemplazos sujetos a autorización. |
| 8. Funciones completas | Añadir selección de varios grupos/estudiantes, esquemas de evaluación, cierre, administración, auditoría, calendario, rúbricas y notificaciones. | Cálculo académico y operaciones sensibles cumplen los acuerdos y sus pruebas. |
| 9. Revisión de calidad | Revisar seguridad, accesibilidad, rendimiento, concurrencia, límites y copias. | Comprobaciones apropiadas superadas y restauración de base de datos y archivos observada. |
| 10. Demostración publicada | Publicar la versión completa y preparar guía, capturas y accesos de prueba acotados. | Recorridos comprobados desde celular y computador, administración privada y seguimiento de consumo documentado. |
| 11. PWA | Añadir instalación y definir actualizaciones y almacenamiento en el dispositivo. | Instalación comprobada y política que proteja la información académica privada. |

## Alcance del bloque completado: etapa 2

1. Confirmar los requisitos oficiales de la versión estable de Next.js y comprobar compatibilidad con Node.js y npm instalados.
2. Definir una estructura técnica sencilla de un único repositorio y documentar las versiones elegidas.
3. Preparar el historial Git local y la base técnica con dependencias locales, sin instalar herramientas globales ni publicar en GitHub todavía.
4. Añadir y ejecutar únicamente comprobaciones que correspondan a la base técnica creada.
5. Registrar cambios, comandos reales, resultado y punto estable antes del siguiente bloque.

La preparación técnica no autoriza a inventar identidad visual, crear pantallas de producto o activar servicios externos antes de su etapa. El acceso a cuentas y la selección visual se resolverán con el usuario cuando correspondan.

## Bloque actual: implementación de B+C y validación pendiente

El usuario eligió B+C y después delegó continuar todo lo pendiente. Se implementaron landing, acceso, paneles, vista previa y conexión por código, tomando la composición 2 como referencia. La ejecución visual final y las etapas 5 a 11 no se dan por terminadas: faltan comprobaciones e integración. La restricción de pruebas no quedó revocada y se pidió autorización expresa. Estado en docs/ESTADO.md y orden de comprobación en docs/VALIDACION-PENDIENTE.md.

## Preparación histórica de etapa 3: validación pendiente

1. Revisar las condiciones gratuitas vigentes de Supabase, Vercel y la alternativa de correo, con límites y comportamiento al agotar cuotas.
2. Comprobar el acceso del usuario a las cuentas necesarias mediante los flujos de inicio de sesión correspondientes, sin introducir secretos en el chat.
3. Preparar un proyecto de prueba pequeño y privado y una configuración local sin credenciales versionadas.
4. Comprobar una consulta, un archivo privado y un envío real a un destinatario controlado. Identificar como pendiente lo que todavía no se haya probado.
5. Documentar consumo, reactivación, copias y criterios antes de preparar la publicación técnica mínima.

La revisión pública está documentada en docs/SERVICIOS-GRATUITOS.md. docs/CONFIGURACION-SERVICIOS.md contiene los pasos y el registro de pruebas. La captura del usuario muestra el proyecto creado en Free, Healthy y us-east-2. Se prepararon .env.local y check:supabase, pero la comprobación se detuvo por clave pendiente. El siguiente paso es completar la clave publicable y consultar Auth; después se probarán datos, archivo privado y correo. La etapa sigue abierta.

## Decisiones que se concretarán antes de implementar su función

- Fórmula y cobertura del promedio provisional, precisión de notas individuales y manejo de categorías sin actividades.
- Cambios del esquema de evaluación, reapertura y correcciones de períodos cerrados.
- Alcance y vigencia de autorizaciones de reemplazo, conservando entrega única e historial.
- Datos ficticios concretos y límites internos contrastados con las cuotas reales.
- Procedimiento técnico de doble autorización y recuperación administrativa.

El agente puede resolver y documentar elecciones técnicas rutinarias. Las decisiones con efectos académicos o de acceso necesitan una propuesta clara y la respuesta del usuario; no bloquean por adelantado las tareas independientes.
