---
name: Instituto Tecnológico de San Miguel
description: Campus abierto y campus en profundidad, documentados desde la implementación.
colors:
  brand: "#48b292"
  action: "#146c53"
  action-ink: "#fff"
  ink: "#102e25"
  muted: "#4d6b60"
  ground: "#f7fbf9"
  surface: "#fff"
  mint: "#e5f4ed"
  mint-strong: "#c0e8d8"
  line: "#cedfd6"
  danger: "#a42a34"
  danger-bg: "#fff0f1"
  amber: "#76500a"
  amber-bg: "#fff5db"
  dark-action: "#78cbae"
  dark-action-ink: "#102e25"
  dark-ink: "#e2f2eb"
  dark-muted: "#a9c4b7"
  dark-ground: "#101d19"
  dark-surface: "#172922"
  dark-mint: "#1e382d"
  dark-mint-strong: "#2d5744"
  dark-line: "#385346"
  dark-danger: "#ffb1b7"
  dark-danger-bg: "#49292d"
  dark-amber: "#f0ce82"
  dark-amber-bg: "#3b321d"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(63px,6.1vw,96px)"
    fontWeight: 800
    lineHeight: 1.01
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(32px,3.1vw,50px)"
    fontWeight: 750
    lineHeight: 1.15
    letterSpacing: "-.035em"
  portal-headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(28px,2.7vw,40px)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "23px"
    fontWeight: 750
    lineHeight: 1.15
    letterSpacing: "-.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
    lineHeight: 1.65
  table-body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    lineHeight: 1.65
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1.65
rounded:
  badge: "4px"
  control: "7px"
  panel: "9px"
spacing:
  label-gap: "7px"
  compact-gap: "12px"
  form-gap: "20px"
  panel-inset: "28px"
  section-gap: "35px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  button-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  badge:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.badge}"
    padding: "4px 9px"
  detail-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "28px"
---

# Design System: Instituto Tecnológico de San Miguel

## Overview

**Creative North Star: "Campus abierto + Campus en profundidad"**

El mundo elegido combina fotografía amplia de campus, esmeralda luminoso, tinta verde y planos diagonales sencillos. La implementación usa Manrope local para una voz continua entre presentación, acceso y trabajo académico. La fotografía acompaña el catálogo público de cinco programas; por decisión expresa del usuario, la interfaz no lleva avisos que llamen ficticia a la institución, incluida la privacidad. Las cuentas de ejemplo y las operaciones de vista previa conservan su identificación.

Los portales reducen la intensidad compositiva: superficies tranquilas, navegación estable, divisores y tablas. ES/EN, tema claro/oscuro/sistema y preferencia de movimiento persisten entre superficies. Este documento describe reglas reutilizadas del código; no certifica integración, seguridad ni aprobación visual global. La extensión de verificación contextual conserva B+C y los tokens existentes; no hereda un veredicto de entrega de revisiones anteriores.

**Key Characteristics:**
- Identidad esmeralda con acciones en verde de contraste.
- Fotografía ilustrativa y diagonales en la presentación pública.
- Portales planos, tablas legibles y controles discretamente redondeados.
- Preferencias persistentes y movimiento fotográfico reducible.

Fuente: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui.tsx`, `landing.tsx`, `auth.tsx`, `portal.tsx` y `management-tools.tsx`. PRODUCT.md aporta las decisiones de marca; el contrato de superficie conserva la composición y sus límites. La referencia B+C es de crítica, no un comp aprobado vinculante.

## Colors

Una familia de verdes articula identidad, acciones, fondos y texto; rojo y ámbar comunican estados concretos.

### Primary
- **Esmeralda de campus — brand:** monograma, plano de presentación, propósito institucional y barra lateral. Conserva su valor en ambos temas, con tinta verde oscura sobre esos campos.
- **Verde de acción — action / action-ink:** botones principales, enlaces de acción, foco y acentos funcionales. En oscuro se aplica la pareja dark-action / dark-action-ink.

### Neutral
- **Tinta verde — ink / muted:** texto principal y explicaciones. Las parejas dark-ink / dark-muted acompañan fondos oscuros.
- **Papel claro — ground / surface:** fondo de página y superficies de trabajo; dark-ground / dark-surface son sus equivalentes de tema.
- **Menta — mint / mint-strong:** zonas de orientación, cabeceras de tabla, mensajes y selecciones; las variantes dark-mint cambian con el tema.
- **Línea vegetal — line:** bordes de campos, tablas y divisores, con dark-line en oscuro.

Los pares danger / danger-bg y amber / amber-bg, con sus equivalentes oscuros, se reservan para error, riesgo o advertencia. El estado también lleva texto.

**The Identity and Action Rule.** El campo de identidad usa brand; las acciones usan action y action-ink como pareja del tema activo.

## Typography

**Display Font:** Manrope, sans-serif.
**Body Font:** Manrope, sans-serif.

La fuente variable se aloja en `public/fonts/manrope.ttf`, con licencia OFL; `next/font/local` la expone mediante `--font-manrope` y usa intercambio de fuente. El carácter es abierto y compacto, con títulos pesados, interletraje negativo y párrafos de mayor aire.

### Hierarchy
- **Display:** apertura pública, con el token display; en móvil pasa a 58px y altura de línea 1.
- **Headline:** títulos de sección, con el token headline; la regla móvil general usa 34px, con ajustes propios por sección.
- **Portal headline:** título de trabajo más contenido; en móvil usa 29px.
- **Title:** títulos secundarios. Las secciones de trabajo usan 22px y los paneles de detalle, 24px.
- **Body:** texto general, máximo habitual de 72ch; en móvil el cuerpo general pasa a 14px. Las tablas usan table-body y sus notas reducen tamaño según contexto.
- **Label:** etiquetas de formulario. La navegación pública usa 13px y peso 750; los botones, peso 700 y altura de línea 1.35.

**The Numeric Alignment Rule.** Tablas y calificaciones usan cifras tabulares para comparar valores sin saltos de anchura.

## Layout

La presentación alterna secciones amplias y columnas, con contenedor de sección de hasta 1800px y relleno de 110px / 7%. A 950px baja a 80px / 6%; a 760px, a 65px / 25px. Los cinco programas se muestran en dos columnas; la última ficha impar ocupa ambas columnas y todas pasan a una en móvil. Las diagonales pertenecen a planos de presentación y al monograma; no se imponen a los formularios o tablas.

El acceso usa dos columnas con bloque menta lateral y formulario de hasta 430px; a 760px se apila y oculta la ilustración. El portal combina barra lateral de 225px y contenido de hasta 1600px, centrado horizontalmente y alineado arriba mediante `margin:0 auto`; a 1250px la barra baja a 205px y a 950px a 185px. A 760px la navegación se convierte en fila horizontal desplazable y el contenido usa márgenes de 18px. Las tablas mantienen desplazamiento horizontal dentro de su contenedor. Los formularios usan un espacio vertical de 20px; sus pares de campos se apilan en móvil.

Los puntos de adaptación observados son 1250px, 950px y 760px, más un ajuste de presentación desde 1800px. La navegación pública se despliega mediante botón desde 950px. Los formularios generales elevan los campos a 16px en móvil; controles compactos tienen ajustes propios.

El diálogo de verificación se centra en escritorio: ancho máximo de 520px, margen de viewport de 16px, altura máxima de 100dvh menos 32px y desplazamiento vertical interno. Hasta 760px adopta una hoja inferior de ancho completo y altura máxima de 100dvh menos 16px. Su contenido usa relleno de 28px y separación de 20px; en móvil, relleno de 24px / 20px, área segura inferior y acciones apiladas de ancho completo.

## Elevation & Depth

Predominan planos de color, bordes finos y fotografía. Los paneles de trabajo no usan sombras de tarjeta. Las fichas fotográficas emplean una gradación oscura para sostener el texto sobre la imagen. La única sombra ambiental reutilizable definida en el origen corresponde al control de movimiento; el marcador de historia lleva un contorno circular local.

La verificación contextual usa el plano superior nativo de dialog y un velo oscuro (#071a13b8), sin sombra de tarjeta. El velo pertenece al componente y no amplía la paleta global.

### Shadow Vocabulary
- **Control flotante:** `0 12px 35px #103c2620` en claro y `0 12px 35px #0004` en oscuro; variable `--shadow` aplicada al control de movimiento.

**The Quiet Portal Rule.** La jerarquía del trabajo académico se construye con tipografía, separación, menta y líneas, conservando los paneles planos.

## Shapes

Los controles comparten esquinas suaves con el token control; paneles y tablas usan panel y las etiquetas de estado usan badge. Campos y paneles tienen borde de 1px. Los avatares son círculos. Las grandes imágenes se recortan sin marcos decorativos. El monograma tiene dos barras sesgadas y una palabra ITSM; los iconos funcionales son SVG de trazo, normalmente de 20px, con trazo 1.7 y extremos redondeados.

## Components

### Buttons

Acciones compactas y explícitas: principal relleno, secundario de superficie con borde y peligro con fondo semántico y borde rojo. El tamaño general tiene mínimo de 46px; las acciones de tabla se compactan a 34px. El principal oscurece con brillo .93 y asciende 1px al pasar el cursor; el secundario pasa a menta. El estado deshabilitado usa opacidad .55 y cursor de no disponible.

El foco visible compartido es un contorno de 3px en action, separado 4px. La transición general dura .2s para fondo/color y .3s para desplazamiento, con curva `cubic-bezier(.16,1,.3,1)` para este último.

### Chips

Las etiquetas de estado son compactas, con menta y tinta, tipografía de 10px / 750 y variantes de advertencia y peligro. No sustituyen el texto del estado por color.

### Cards / Containers

Los paneles de detalle usan surface, line y un relleno de 28px; en móvil se reduce a 22px / 18px. Las tablas usan el mismo borde y esquina; cabecera menta, filas divididas y acciones dentro de celdas. Los estados vacíos emplean borde discontinuo, icono SVG, título y explicación centrada.

### Inputs / Fields

Campos de superficie con borde line, relleno de 12px / 14px y etiquetas encima separadas 7px. El texto auxiliar y los placeholders usan muted. Foco visible compartido, caret de acción y textarea redimensionable verticalmente. Los errores se muestran mediante mensajes con texto, fondo semántico y `role="alert"`; los mensajes ordinarios usan `role="status"`.

### Navigation

La navegación pública es textual, con hover de acción, accesos por perfil, ES/EN y selector de tema. La barra lateral de portal usa brand y tinta oscura; la página actual lleva fondo claro y `aria-current="page"`. El móvil conserva los destinos en una fila desplazable. La selección ES/EN se comunica con `aria-pressed`; claro, oscuro y sistema comparten selector.

Las pestañas y acciones del portal se ajustan al rol y los permisos específicos. Dentro del portal no hay selectores globales de rol o persona; la vista previa usa una cuenta de ejemplo fija por rol. El estudiante navega sus materias, entregas y notas, sin directorio ni selector de compañeros. Esta presentación no sustituye los controles de autorización del servidor.

El selector de tema integra icono, texto y flecha en un solo contorno de esquina control y superficie menta. El select nativo llena el control, con mínimo de 44px, ancho general de 132px y relleno de 10px / 30px / 10px / 35px. Icono y flecha se sitúan sobre él sin interceptar el puntero; el foco del select rodea el conjunto. En móvil usa 127px; la cabecera pública lo compacta a 110px.

### Photographic program explorer

La selección pública combina un select nativo de cinco programas, etiqueta visible, descripción viva y enlace actualizado. El campo usa surface, borde line y mínimo de 44px; su texto de 12px pasa a 16px en móvil. El catálogo comprende Desarrollo de Software, Redes y Telecomunicaciones, Auxiliar Contable, Auxiliar Administrativo y Mantenimiento y Reparación de Equipos Biomédicos. Su adaptación móvil se apila.

La fotografía de campus combina zoom y desplazamiento lateral (`18s ease-in-out infinite alternate`, de `scale(1.03) translateX(-.7%)` a `scale(1.12) translateX(.7%)`). El fondo admite además desplazamiento ligado al scroll (`min(scrollY * .1,45)px`). El control pausa o reactiva la fotografía; la animación conserva su posición al pausar y se suspende cuando el hero queda fuera del viewport o la pestaña está oculta. La pausa fuera del viewport está observada; la ocultación de pestaña está implementada, sin comprobación mediante un cambio real de pestaña.

Sin elección explícita, el movimiento sigue `prefers-reduced-motion`, también cuando cambia el sistema. El control guarda una elección explícita `full` o `reduced` que prevalece sobre el sistema y persiste entre superficies y recargas. En preferencias antiguas, `reduced:true` conserva la pausa y `reduced:false` vuelve a seguir el sistema. La resolución se aplica antes de pintar y en React. El estado reducido pausa la animación de campus y anula el desplazamiento del fondo, el scroll suave y las transiciones generales; no se infiere de ello una auditoría completa de todo movimiento.

### Contextual verification

Confirmación efímera ligada a la acción solicitada, implementada en src/components/verification-dialog.tsx con contexto y verbos de src/lib/sensitive-actions.ts. Reutiliza surface, ink, muted, line, mint y la pareja de acción del tema activo; conserva Manrope y ES/EN. Tiene borde de 1px y esquinas de 12px, limitadas a las superiores en móvil. Son valores del componente, sin cambiar los tokens generales. El título usa 24px / 1.25; las explicaciones, 16px / 1.55; las etiquetas, 14px / 700; el código, 24px con cifras tabulares e interletraje .2em. Campos y selector mantienen 16px y los botones un mínimo de 46px.

El título nombra la operación; el bloque menta identifica el destino cuando hay nombre disponible. La explicación expresa consecuencias de archivado, suspensión, eliminación o cierre según la acción. La confirmación dice «Verificar y archivar», «Verificar y cambiar contraseña» o el verbo correspondiente. El selector nativo permite elegir autenticador y el código de seis dígitos se solicita dentro del contexto; Seguridad conserva estado y acceso a configuración inicial sin campo permanente de códigos. La configuración puede mostrar el QR privado generado por el servicio y su clave manual; no son imágenes editoriales nuevas.

Accesibilidad implementada: showModal(), título y descripción asociados mediante ARIA, etiquetas visibles, inputMode numeric, autoComplete one-time-code, errores textuales con role alert y carga/ayuda con role status. El código recibe foco después de cargar un factor verificado; al cerrar se intenta devolverlo al control iniciador si sigue conectado. Cancelar y Escape cierran sin descartar el formulario subyacente. Deben conservarse estos criterios al reutilizar el componente; no certifican una auditoría completa de accesibilidad ni una autorización de un solo uso.

## Do's and Don'ts

### Correo de bienvenida

supabase/templates/invite.html extiende la identidad esmeralda (#48b292 / acción #146c53), tinta #102e25, menta #e5f4ed, fondo #f7fbf9 y líneas #cedfd6 sin una dirección visual nueva. Usa tabla fluida con máximo 560px, estilos inline, marca ITSM textual y un único botón de creación de contraseña. Arial/Helvetica, marca de 30px, título de 28px, cuerpo de 16px, auxiliares de 14px y botón con radio de 6px se limitan al medio email por compatibilidad; no alteran Manrope, la rampa ni los componentes de la aplicación. El HTML se comprobó mediante DOM en navegador móvil/escritorio; no hay aprobación por imágenes ni validación de render en Gmail/Outlook.


### Do:
- **Do** conservar la pareja de color de acción del tema activo.
- **Do** mantener Manrope local y cifras tabulares en datos comparables.
- **Do** usar bordes y menta para ordenar los portales planos.
- **Do** conservar ES/EN, tema y preferencia de movimiento al cambiar de superficie.
- **Do** conservar la identificación de cuentas de ejemplo y operaciones de vista previa, sin reintroducir avisos de institución ficticia retirados por el usuario.
- **Do** ajustar pestañas y acciones al rol y sus permisos, manteniendo la experiencia del estudiante centrada en sus propios datos.

### Don't:
- **Don't** trasladar automáticamente las diagonales de presentación a cada panel de trabajo.
- **Don't** comunicar errores, advertencias o selección únicamente mediante color.
- **Don't** presentar una fotografía ilustrativa como evidencia de un campus real.
- **Don't** convertir tamaños incidentales de texto auxiliar o un defecto observado en una regla para nuevas superficies.

No canonizado ni reparado en esta pasada: los textos auxiliares de 9–11px presentes en algunas vistas son excepciones de densidad del código, no un mínimo recomendado de legibilidad. El detector de movimiento registra deriva previa (45 avisos de tamaños, 4 de colores y 2 de radios); este refinamiento conserva la paleta, la rampa tipográfica y las formas existentes sin ampliar tokens para absorber esos avisos. La extensión actual no recibe aquí un veredicto de entrega ni validación de integraciones reales.
