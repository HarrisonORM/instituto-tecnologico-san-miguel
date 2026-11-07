# Viabilidad de los servicios gratuitos

Revisión de documentación oficial: **7 de noviembre de 2026**, fecha de Colombia. Los proveedores pueden cambiar sus condiciones; se volverán a comprobar antes de activar o publicar y cuando aparezcan avisos de consumo.

**Estado:** revisión pública realizada; pruebas con cuentas pendientes. Los límites publicados no acreditan que exista una conexión funcionando. El registro de pruebas está en [Configuración de servicios](CONFIGURACION-SERVICIOS.md).

## Servicios del plan

| Servicio | Función | Plan que se utilizará |
|---|---|---|
| Supabase | Base de datos PostgreSQL, cuentas y archivos privados. | Free. |
| Vercel | Ejecutar la aplicación Next.js publicada. | Hobby, para esta demostración personal y no comercial. |
| Correo SMTP | Transportar los correos de invitación y recuperación de Supabase Auth. | Candidato: una cuenta gratuita de Gmail dedicada al proyecto; compatibilidad y entrega por probar. |

SMTP es el mecanismo de envío de correo. Supabase seguirá gestionando los enlaces y las operaciones de autenticación. Gmail sería únicamente el remitente; no cambia el acceso con correo y contraseña institucional de los usuarios ficticios.

Esta combinación es una opción viable sobre el papel para una demostración pequeña. La etapa termina cuando se hayan observado las pruebas, incluido el correo real. No equivale a contratar disponibilidad continua para una universidad en producción.

## Cuotas publicadas de Supabase Free

| Recurso | Incluido según el proveedor | Alcance que debemos vigilar |
|---|---|---|
| Base de datos | 500 MB por proyecto. | Datos e índices; comprobar el tamaño real del proyecto. |
| Archivos | 1 GB. | El consumo de los proyectos de la organización comparte esta cuota. |
| Transferencia sin caché | 5 GB por ciclo. | Salida de datos de los servicios de la organización. |
| Transferencia con caché | 5 GB por ciclo. | Cuota independiente; no sumarla a la anterior para presupuestar una descarga. |
| Usuarios activos | 50.000 al mes. | La demostración aprobada contiene 47 cuentas; no implica 47 correos al mes. |
| Proyectos activos | Hasta dos proyectos gratuitos; los pausados no cuentan. | Revisar las organizaciones donde se es propietario o administrador y la capacidad que ofrece el panel. |

Fuentes: [planes de Supabase](https://supabase.com/pricing), [almacenamiento](https://supabase.com/docs/guides/platform/manage-your-usage/storage-size) y [transferencia](https://supabase.com/docs/guides/platform/manage-your-usage/egress).

El usuario confirmó dos proyectos gratuitos existentes, uno pausado. Esto permite prever un espacio para el instituto, sujeto a la comprobación del panel y las restricciones de los propietarios o administradores de la organización. [Alcance del límite de proyectos](https://supabase.com/docs/guides/platform/billing-on-supabase) y [capacidad de la organización](https://supabase.com/docs/guides/platform/billing-faq).

La cuota de transferencia ya consumida no disminuye al borrar archivos. Se revisa el total de la organización, incluidos sus otros proyectos. Para esta demo se presupuestarán las descargas privadas con margen en la cuota sin caché. [Medición de transferencia](https://supabase.com/docs/guides/platform/manage-your-usage/egress).

## Qué pasa al alcanzar límites o dejar de usarlo

En Free no se cobran excedentes, pero pueden aplicarse restricciones por consumo: modo de solo lectura, pausas o respuestas de error. Los períodos de gracia no son capacidad adicional para planificar. Se mantendrá el plan gratuito y se atenderán los avisos del panel. [Control de costes](https://supabase.com/docs/guides/platform/cost-control) y [política de uso y restricciones](https://supabase.com/docs/guides/platform/billing-faq).

Supabase puede pausar un proyecto gratuito con poca actividad durante siete días. La documentación indica una ventana de un año para reanudarlo desde el panel. Antes de presentar el portafolio se comprobará que esté activo y que la aplicación pueda consultar datos. La reactivación real de este proyecto todavía no se ha probado. [Pausas y reanudación](https://supabase.com/docs/guides/platform/free-project-pausing).

La demo debe mostrar errores comprensibles ante indisponibilidad y conservar su historial. El presupuesto de cero se mantendrá reduciendo consumo y respetando los límites, con las interrupciones que pueda imponer el plan gratuito.

## Cuotas relevantes de Vercel Hobby

| Recurso | Incluido según el proveedor |
|---|---|
| Transferencia de datos rápida | 100 GB. |
| Transferencia desde origen | 10 GB. |
| Solicitudes de CDN | 1.000.000. |
| Invocaciones de funciones | 1.000.000. |
| CPU activa | 4 horas. |
| Memoria aprovisionada | 360 GB-horas. |

Son métricas distintas; una invocación no describe por sí sola su consumo de CPU o memoria. Hobby se limita al uso personal y no comercial. Al exceder una cuota, normalmente hay que esperar hasta que se libere capacidad en su ventana de uso, que puede alcanzar 30 días. [Plan Hobby](https://vercel.com/docs/plans/hobby).

Una función admite hasta 4,5 MB de cuerpo en solicitud o respuesta. Tres adjuntos de 2 MB superarían ese valor si viajaran juntos a una función. La propuesta de implementación es autorizar la operación en el servidor y subir cada archivo directamente al almacenamiento privado, con restricciones y comprobación antes de confirmar la entrega. Esa subida todavía no está implementada. [Límites de funciones](https://vercel.com/docs/functions/limitations) y [restricciones de buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets).

## Correo: limitación identificada y opción por probar

El remitente incluido de Supabase solo envía a direcciones de miembros del equipo y actualmente limita a dos correos por hora en todo el proyecto. No sirve para dar por validadas las invitaciones a cualquier dirección. Las restricciones también afectan las pruebas de recuperación. [SMTP de Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

La alternativa propuesta es una cuenta gratuita de Gmail dedicada, configurada como SMTP personalizado de Supabase. Se usarían `smtp.gmail.com`, puerto 465 con TLS y una contraseña de aplicación. Google exige verificación en dos pasos para generar esa contraseña y algunas cuentas no tienen la opción disponible. La contraseña se introduce en Supabase; no se copia al chat, a la plantilla ni al frontend. [SMTP de Gmail](https://developers.google.com/workspace/gmail/imap/imap-smtp) y [contraseñas de aplicación](https://support.google.com/accounts/answer/185833?hl=es).

Google documenta límites de envío y bloqueos temporales por exceso; no se utilizará su máximo como objetivo. Se propone comenzar con pocas pruebas manuales y, cuando exista el control en servidor, limitar los envíos de la demo, su frecuencia por cuenta y los intentos repetidos. [Límites de Gmail](https://support.google.com/mail/answer/22839?hl=es).

El remitente debe coincidir con la cuenta autorizada. Las pruebas usarán destinatarios reales controlados por el usuario. Las 47 cuentas ficticias no desencadenarán una campaña de invitaciones ni envíos a direcciones inventadas. Llegada a la bandeja, funcionamiento de los enlaces y cambio de contraseña siguen pendientes de prueba real.

Si Gmail no admite la configuración, la compatibilidad quedará pendiente y se evaluará otra alternativa gratuita antes de dar por resuelto el correo. Un mensaje capturado localmente no sustituye una entrega a un buzón externo.

## Presupuesto interno propuesto, todavía sin aplicar

Los valores siguientes son propuestas de trabajo, no decisiones académicas aprobadas ni cuotas oficiales. PRODUCT.md conserva su condición de propuestas. Deben medirse antes de convertirlos en límites del sistema.

| Elemento | Propuesta | Comportamiento que se implementaría |
|---|---|---|
| Archivo individual | Hasta 2 MB; PDF, JPG o PNG. | Restricción en almacenamiento y validación en servidor. |
| Adjuntos por entrega | Hasta tres. | Contar adjuntos y validar la autorización de la entrega. |
| Almacenamiento del proyecto | Presupuesto de 250 MB. | Reservar espacio antes de subir y contar originales, versiones, fotos y subidas temporales; denegar nuevas cargas cuando no haya espacio. |
| Base de datos | Objetivo inferior a 100 MB. | Medir datos e índices; revisar antes de generar lotes grandes. |
| Transferencia de Supabase | Objetivo inferior a 1 GB por cada cuota independiente. | Revisar el panel, paginar consultas y evitar descargas repetidas. Es un objetivo de consumo, no un corte automático ya programado. |
| Avisos operativos | Al 60 % y 80 % del presupuesto interno. | Comenzar con revisión manual; los avisos y controles futuros se probarán por separado. |

Una reserva de espacio deberá ser coherente ante subidas simultáneas. Las versiones autorizadas de una entrega también consumen espacio; el sistema conservará el historial académico al llegar a un límite. Los controles todavía no existen: documentarlos no los activa.

### Ejemplo de capacidad, no cantidad fija de tareas

Un escenario de **cuatro actividades por estudiante en total**, con 40 estudiantes y un archivo promedio de 0,5 MB por entrega, ocuparía unos **80 MB**. Una segunda versión autorizada de todas esas entregas sumaría otros 80 MB. Las fotos y archivos temporales necesitarían margen adicional.

En cambio, 40 estudiantes × cuatro materias × cuatro actividades por materia × tres archivos × 2 MB producirían **3.840 MB**. Por eso, el máximo por archivo no garantiza caber en el nivel gratuito. La semilla usará evidencias pequeñas y variadas; la cantidad de tareas real de la demo se definirá al preparar esos datos.

Los cálculos anteriores son estimaciones propias con unidades decimales. Se medirán los bytes reales y se documentará su conversión al aplicar los límites.

## Copias y presentación de la demo

El plan gratuito requiere preparar exportaciones propias. Una copia de PostgreSQL contiene los metadatos de Storage, pero no los archivos almacenados; hay que conservar ambos y probar su restauración. Se guardarán fuera de Git y fuera del almacenamiento público. [Copias de Supabase](https://supabase.com/docs/guides/platform/backups).

Antes de una presentación se revisarán el estado del proyecto, consumo de la organización y del alojamiento, acceso de prueba y descarga privada. Este documento no registra una copia o restauración ya ejecutada.

## Criterio para terminar la etapa 3

La revisión de condiciones está realizada. Faltan una consulta real, una prueba de acceso y denegación a datos y archivo privado, el ciclo controlado de invitación y recuperación, y una publicación técnica mínima del servidor. Cada resultado se anotará con fecha y alcance en [Configuración de servicios](CONFIGURACION-SERVICIOS.md), conservando la distinción entre documentación, configuración y prueba observada.
