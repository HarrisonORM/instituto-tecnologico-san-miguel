# Revisión independiente de movimiento de portada

Petición: «la imagen principal de la landing page no tiene movimiento y con que seguimos?».

## Primera revisión — disposition: fix

### persistence

PRODUCT.md y contrato presentes; ruta code-led, sin exigir gates comp-led. DESIGN.md aún describe 22s y escalas anteriores. Semilla d5b30ae5 coincide con sidecar histórico, sin corroboración de su tirada original. JPEG válidos del host: 982×714 y 382×826, escalados proporcionalmente desde viewports DOM 990×720 y 390×844; extremos y cabeceras completos.

### fidelity

Sin comp aprobado: referencia de crítica únicamente. Manrope local, campus continuo, plano esmeralda, jerarquía, accesos y explorador conservados. Transformación activa cambia; las dos muestras móviles pausadas y asentadas coinciden. Fuera del hero el efecto queda pausado. Ocultación de pestaña implementada, sin comprobación mediante cambio real.

### ceiling

Reached para el refinamiento: movimiento acotado, control visible, persistencia y reducción por defecto. Los 51 avisos del detector son deriva previa de tamaños, colores y radios; no se introdujo un hallazgo visual nuevo en el alcance revisado.

### material_fixes

1. Aclarar en el contrato que la semilla es heredada y su tirada original no se corroboró; no declarar un gate verificado ni un comp aprobado.
2. Actualizar DESIGN.md y .impeccable/design.json a 18s, escala 1.03–1.12, desplazamiento horizontal ±0.7 %, pausa por visibilidad y resolución actual de preferencias.

### keep

Conservar fotografía continua, plano esmeralda, composición móvil y pausa estable; sin cambiar textos ni jerarquía.

La revisión fue realizada por el agente independiente motion_review. La documentación se corrige después de esta primera disposición; se registrará su puntuación posterior sin convertirla en aprobación global de integración o seguridad.
## verdict

1. resolved — FORM declara la semilla d5b30ae5 heredada, su tirada original no corroborada y la ausencia de gate verificado o comp aprobado.
2. resolved — DESIGN.md y .impeccable/design.json describen 18s, escalas 1.03–1.12, desplazamiento horizontal ±0.7 %, pausa por visibilidad y preferencias system/full/reduced con persistencia y compatibilidad antigua.

## remaining

clear — ship cubre únicamente las dos correcciones documentales puntuadas.

disposition: ship
