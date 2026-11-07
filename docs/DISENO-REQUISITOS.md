# Diseño: referencias del usuario y propuestas de trabajo

Documento de planificación. No es DESIGN.md ni aprobación de una composición final. No se implementan pantallas en este bloque ni se ejecutan las pruebas o despliegues aplazados.

Actualización confirmada: el usuario eligió combinar B (Campus abierto) con C (Campus en profundidad) y seguir con Impeccable para todo el diseño. La mezcla se concreta en una ronda de composición, conservando el esmeralda y la fotografía con movimiento suave. PRODUCT.md contiene el acuerdo vigente; los bocetos iniciales no se consideran aprobados individualmente.

## Confirmado por el usuario

- Color base: verde esmeralda luminoso, tomando como referencia la muestra #48B292. Evitar que la identidad se perciba como un verde excesivamente oscuro.
- Primera referencia: cabecera esmeralda, fotografía protagonista de campus, gran escala de imagen y tipografía. El usuario quiere movimiento en esa imagen de portada.
- El usuario confirmó fotografía con movimiento suave como medio de portada.
- Segunda referencia: presencia institucional, fotografía amplia y secciones editoriales. La preferencia cromática sigue siendo esmeralda; no se adopta su azul o negro como identidad.
- Landing con sobre nosotros, programas e imágenes por programa, historia, misión, visión, contacto o captura de interesados y acceso directo para estudiantes y docentes.
- Experiencia con efectos y transiciones a lo largo de la landing.
- Paneles de estudiante, docente y administración más sencillos y sin distracciones, conservando el esmeralda como base.
- Todas las vistas deben permitir español e inglés y los temas claro, oscuro y sistema/dispositivo.
- El usuario confirmó que también quiere traducir contenido académico; aún falta elegir su mecanismo y definir el alcance del contenido de los adjuntos.
- Identidad y pantallas elegidas con el usuario antes de implementarlas; servicios con cero costes adicionales.

Las dos referencias originales están en C:/Programacion/imagenes ideas universidad/ con los nombres 6a0a71127e5719d4b3ad1fbeec87cd7e.jpg y a08165b8a286cce0a3ba9c4c1380b8e0.jpg. Se analizaron como inspiración; sus marcas, textos, fotografías y afirmaciones de otras universidades no son contenido propio aprobado para publicar.

## Lectura profesional de las referencias

La primera ofrece una base más afín al instituto: luz, espacio, verde y protagonismo fotográfico. La segunda ayuda a pensar en profundidad de secciones y presencia institucional. La propuesta es desarrollar una composición propia y coherente a partir de esas preferencias, conservando legibilidad y claridad entre información pública y trabajo académico.

La landing tiene como finalidad presentar la oferta y orientar aspirantes; los paneles sirven para trabajar. Comparten identidad, pero no necesitan la misma intensidad de movimiento. Los paneles mantienen búsqueda, jerarquía, estados y acciones prioritarias visibles.

## Propuesta de secuencia de la landing

1. Portada: nombre del instituto, mensaje principal, imagen de campus con movimiento suave, acción Explorar programas propuesta y accesos Estudiantes / Docentes visibles.
2. Sobre nosotros: presentación breve, enfoque educativo y fotografía editorial de apoyo.
3. Programas: Desarrollo de Software y Redes y Telecomunicaciones, cada uno con imagen, descripción y acceso al detalle. Duración, modalidad, plan de estudios y precio ilustrativo son campos propuestos para enriquecer el detalle; sus valores no están aprobados.
4. Historia: recorrido por etapas con imagen y texto, dejando clara la institución ficticia. Las fechas e hitos específicos todavía deben redactarse y revisarse.
5. Misión y visión: dos bloques breves dentro de la narrativa institucional, con contenido pendiente de aprobación.
6. Contacto: formulario de interés y contexto del programa elegido. Propuesta de campos: nombre, correo, programa y mensaje; teléfono opcional. No pedir documento ni información académica privada.
7. Cierre: información institucional ficticia, navegación, preferencias y acceso para personal autorizado.

La acción principal Explorar programas sigue siendo una recomendación; el usuario todavía no la ha confirmado. El formulario requiere un flujo real de recepción y protección contra abuso antes de mostrarse como operativo. Su alcance, conservación y uso de datos deben concretarse; una solicitud de ejemplo no debe prometer una admisión o llamada real de una universidad ficticia.

## Movimiento propuesto, todavía no implementado

- Portada: fotografía con movimiento suave confirmada. Se propone acercamiento lento y desplazamiento discreto al recorrer la página, conservando encuadre y legibilidad. La amplitud y la composición concretas todavía se elegirán en bocetos.
- Encabezado: transición suave al desplazarse, con navegación siempre localizable y controles accesibles.
- Programas: cambios breves de imagen, subrayado y flecha en interacción, equivalentes con teclado y sin depender solo del hover.
- Historia: línea de progreso y aparición por etapas, sincronizadas con la lectura.
- Secciones: transiciones puntuales de imagen y texto con contenido visible aunque la animación no se ejecute.
- Paneles: movimiento funcional breve para abrir un diálogo o comunicar un estado; sin parallax ni fondos animados durante el trabajo.

La propuesta concentra tres momentos de protagonismo —portada, programas e historia— y deja respirar el resto. En móvil se reduce la intensidad y la carga. Se propone una preferencia Reducir movimiento, además de respetar la del dispositivo. La animación continua deberá poder pausarse. [Movimiento por interacción](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) y [pausa de movimiento automático](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

## Muestras de color para evaluar, no paleta final aprobada

| Uso propuesto | Muestra |
|---|---|
| Esmeralda protagonista elegido como referencia | #48B292 |
| Acción con texto blanco | #18785D |
| Fondo claro | #F6FAF8 |
| Superficie de apoyo suave | #E9F6F0 |
| Texto principal sobre fondos claros | #17352D |
| Fondo del tema oscuro | #101D19 |

Se calcularon pares concretos con la fórmula de luminancia relativa: blanco sobre #48B292 da aproximadamente 2,61:1; #17352D sobre ese esmeralda da 5,09:1; blanco sobre #18785D da 5,41:1. El texto normal requiere al menos 4,5:1 en WCAG AA. La propuesta conserva el esmeralda luminoso y ajusta el texto o el tono de acción según su uso. Este cálculo no acredita la accesibilidad de una pantalla inexistente ni sustituye la comprobación del diseño completo. [Contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Idioma, tema y preferencias

El requisito ES/EN abarca todas las vistas, incluidas landing, acceso, recuperación, paneles, preferencias y estados de error. Se propone traducir el contenido institucional de manera revisada y adaptar fechas, números y validaciones al idioma. El usuario amplió el alcance al contenido académico; se conserva esa decisión.

Queda pendiente si la traducción académica se redacta/revisa por el autor o se genera automáticamente al cambiar idioma. También se debe concretar si incluye el interior de PDF, fotos o adjuntos. No se ha elegido una API, modelo o servicio de traducción ni se garantiza una solución automática gratuita ilimitada.

Propuesta de integridad: conservar texto y archivo originales, ofrecer Ver original y Versión traducida, vincular traducciones a su versión y aplicar los mismos permisos de acceso. Una traducción no altera la nota, la identidad, el plazo ni crea otra entrega. Código, identificadores y nombres propios requieren tratamiento específico; las traducciones académicas deben distinguirse del contenido original y permitir revisión.

El tema debe ofrecer tres opciones explícitas: Claro, Oscuro y Sistema. Sistema sigue los cambios del dispositivo; una elección manual se conserva al navegar. Se propone guardar idioma, tema y movimiento como preferencias no sensibles del navegador y, con sesión, sincronizarlas con el perfil. Esto no cambia la política de tokens exclusivamente en memoria de la capa de cliente.

Se propone agrupar ajustes en un control Preferencias, con etiquetas claras. Los accesos de estudiantes y docentes deben seguir visibles. Ambos accesos verifican el rol real en el servidor; el botón de entrada no concede permisos.

## Ideas adicionales, todavía propuestas

- Comparador breve de programas por modalidad, duración, enfoque y precio ilustrativo.
- Preguntas frecuentes de admisión y detalle de programa antes de enviar el formulario.
- Formulario que conserve el programa elegido y muestre confirmación y errores comprensibles cuando exista recepción real.
- Identidad tipográfica o monograma ITSM propio, sin copiar escudos ajenos.
- Controles de movimiento y navegación por teclado; efectos equivalentes en pantallas táctiles.
- En paneles, listas de pendientes, cambio rápido de grupo y comprobante de entrega con fecha, versión y archivos, aprovechando el backend preparado.

Los próximos bocetos deberán representar al menos la portada en computador/celular y un panel, con variaciones de tema, antes de pasar a implementación. No se han elegido tipografías, logo, composición final o todos los colores.

## Preguntas abiertas enviadas al usuario

1. Resuelto: el alcance incluye traducción del contenido académico, además de la interfaz.
2. Resuelto: fotografía con movimiento suave para la portada.
3. Enviado posteriormente: elegir versiones ES/EN revisadas por el autor o generación automática; definir por separado el alcance de documentos e imágenes adjuntos.

La dirección final se resolverá con esas respuestas y los bocetos. Este documento conserva decisiones confirmadas y propuestas separadas.
