---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/layout.tsx","src/app/globals.css","src/components/landing.tsx","src/components/portal.tsx","src/components/verification-dialog.tsx","src/lib/sensitive-actions.ts","src/components/ui.tsx","src/components/auth.tsx"]
---

# Landing y campus del Instituto Tecnológico de San Miguel

Modo: Persuade en la presentación; Operate en los portales. El usuario eligió B+C y después pidió «Entonces continua con todo lo que falta sin parar». La implementación concreta la dirección con la composición 2 como referencia elegida por el agente bajo esa delegación. No es una aprobación explícita del render por el usuario.

Ruta actual: code-led, registrada en .impeccable/config.json. Referencia de crítica: .impeccable/mocks/san-miguel-bc-02.png; no comp aprobado que obligue a declarar superado un proceso comp-led. Su sidecar sigue approved:false. El state.json anterior conserva la ronda histórica abierta. La placa de campus mide 1911 × 823 y no se declara superado el umbral 1,5× del proceso anterior.

## Direction contract

THESIS: Un campus abierto al visitante: la fotografía continua, el campo esmeralda y los títulos amplios conducen a explorar cinco programas; evita el hero genérico de dos columnas y tarjetas flotantes repetidas.

OWN-WORLD: Esmeralda luminoso #48B292, menta fría, tinta verde, Manrope local y planos diagonales simples. En los portales, superficies tranquilas, navegación estable y tablas con jerarquía clara.

STORY: El aspirante descubre los cinco programas y solicita información; estudiantes y docentes encuentran inmediatamente su acceso. No se inventan precios, acreditaciones ni logros.

FIRST VIEWPORT: Navegación clara arriba; una foto panorámica de campus ocupa el escenario. A la izquierda cruza un plano esmeralda con Aprender. Crear. Conectar. Abajo se integra el explorador menta: cambiar programa actualiza su descripción y enlace. En móvil, texto, foto y explorador se apilan. Zoom y desplazamiento son suaves, pausables y reducibles.

FORM: Campus abierto + Campus en profundidad; composición 2 de la ronda B+C como referencia de ejecución. La semilla heredada d5b30ae5 coincide con el sidecar histórico de la referencia, pero no se corroboró su tirada original: no constituye un gate verificado ni un comp aprobado. ES/EN y tres temas se conservan al pasar a los paneles.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Ajustes solicitados por el usuario

El 7 de noviembre de 2026 pidió retirar el aviso de institución ficticia de la presentación y corregir el contorno del selector de tema. Esta instrucción sustituye el hallazgo previo del revisor sobre ese aviso. La petición posterior retiró también los avisos de ficción de privacidad y acceso. Se habla de cuentas de ejemplo, sin afirmar acceso institucional. Los paneles ya no contienen selectores globales de rol/persona; el estudiante no recibe directorio de compañeros. Solicitó además Auxiliar Contable, Auxiliar Administrativo y Mantenimiento y Reparación de Equipos Biomédicos. El explorador usa selección nativa compacta para los cinco programas; cada uno tiene su ficha fotográfica y página. No se abre otra dirección visual.

Ante «la imagen principal de la landing page no tiene movimiento», el refinamiento conserva fotografía, paleta, tipografía y composición B+C. La foto usa un ciclo alterno de 18s, zoom 1.03→1.12 y desplazamiento horizontal de −.7% a .7%, además del scroll limitado a 45px. La pausa conserva la posición y se aplica fuera del viewport o con pestaña oculta. El sistema gobierna la reducción por defecto; una elección explícita full/reduced persiste y prevalece sobre él. En preferencias antiguas, reduced:true conserva la pausa y reduced:false sigue el sistema.

## Estado y límites

El contrato se consolida con el registro de la implementación, sin fingir que las revisiones posteriores ya ocurrieron. Hay capturas de escritorio/móvil y revisión independiente. Sus dos hallazgos materiales se corrigieron y se puntuaron Resolved: ship solo al alcance de esas correcciones. La documentación del sistema se deriva del código y de las capturas, sin canonizar el boceto como aprobado. El usuario autorizó después las pruebas locales. Lint, tipos, build y escenarios locales pasaron; no se autorizaron modificaciones a Supabase, correo ni despliegue. Contacto y traducciones revisadas tienen código, pero su integración real está pendiente. Los adjuntos no se traducen automáticamente.

Evidencia del refinamiento de movimiento: `.impeccable/review/motion-behavior.json` registra transformación activa, pausa móvil estable y pausa fuera del viewport. Las capturas `.impeccable/review/motion-desktop.jpg` y `motion-mobile.jpg` son JPEG del host escalados proporcionalmente (982×714 y 382×826) desde viewports DOM de 990×720 y 390×844. La ocultación de pestaña está implementada, sin comprobación mediante cambio real. El primer dictamen de `.impeccable/review/motion-review.md` pidió dos correcciones documentales; el mismo revisor las puntuó resolved con disposition: ship limitado a esas dos correcciones. Los 51 avisos de deriva previa del detector (45 tamaños, 4 colores, 2 radios) no se reparan ni se canonizan en este alcance.

## Extensión de verificación contextual (8 de noviembre de 2026)

Modo Operate y ruta code-led: el usuario pidió retirar el formulario permanente de código MFA de Seguridad y solicitarlo al confirmar una acción protegida o cambiar/recuperar contraseña. Conserva B+C, Manrope, paleta, ES/EN y Claro/Oscuro/Sistema. No hay comp nuevo aprobado ni cambio en el límite de la semilla histórica d5b30ae5.

VerificationDialog es reutilizable; sensitive-actions aporta contexto y verbos. El Provider abre un diálogo efímero y el cliente espera su resultado antes de continuar la operación. Seguridad conserva estado y configuración inicial. El diálogo se centra en escritorio y adopta una hoja inferior hasta 760px; identifica acción y destino disponible, explica consecuencias y ofrece autenticador, código, errores inline, ayuda y Cancelar. Escape conserva los datos del formulario; el código recibe foco tras cargar un factor verificado y el cierre intenta restaurarlo al control iniciador. El botón nombra la acción posterior. El QR privado de configuración procede del servicio; no es una imagen editorial añadida.

Evidencia DOM comunicada por el implementador: escritorio 990×760, diálogo 520×683 en x230/y38; móvil 390×844, diálogo aproximadamente 381.6×601 en y242.9, sin overflow observado. No se equipara esa medición móvil con el ancho CSS nominal. Se observaron cancelación y código inválido sin escrituras; un código válido dio una escritura. Se observaron cambio de contraseña y datos conservados tras Escape. La captura IAB falló incluso con pestaña visible: no hay revisión visual por imagen ni aprobación de render de esta extensión. El ajuste posterior de foco y botón está implementado; su confirmación final se registra por separado en el cierre de validación.

Las comprobaciones locales comunicadas cubren 21 migraciones y tres suites. La vigencia técnica de MFA reciente de 90 segundos para escrituras no implica una garantía de autorización de un solo uso. Las lecturas mantienen control por rol sin pedir código. La migración 021 no se aplicó remotamente; estos resultados no acreditan Supabase, correo ni despliegue. Se conservan sin canonizar las desviaciones históricas de tamaño, color y radio, incluidos textos auxiliares de 9–11px, por quedar fuera de esta extensión.

Confirmación final DOM: el campo código recibió foco y Cancelar devolvió el foco a Guardar estado; Escape conservó los campos de recuperación. Cancelar durante una validación aceptada dejó cero escrituras; la recuperación aceptada produjo una escritura y navegación al campus. Un fallo de consulta mostró error sin ofrecer configurar otro factor. El detector único devolvió 59 avisos advisory en CSS, con deriva histórica y valores intencionales del componente documentados arriba. No hubo hallazgos de severidad superior. Continúa sin captura nueva ni aprobación visual por imagen.
