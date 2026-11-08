# Revisión del catálogo y de los paneles por rol

7 de noviembre de 2026. Revisión fresca de `impeccable-finish-reviewer`, sin heredar la conversación de implementación. El usuario aportó evidencia contra el acabado anterior; su petición de retirar avisos de institución ficticia sustituye la recomendación histórica de añadirlos. La referencia B+C 02 es de crítica, sin comp aprobado vinculante. Ruta code-led.

## Primera revisión: fix

- **persistence:** PRODUCT.md y contrato actualizados; semilla d5b30ae5 corroborada en el sidecar histórico. DESIGN pendiente de actualización quirúrgica por documenter.
- **fidelity:** Manrope, esmeralda, fotografía, composición, cinco programas, ES/EN y temas coherentes. Selector con foco que cubre icono, texto y flecha. Estudiante sin directorio ni cambio de persona/rol; docente con sus grupos; navegación administrativa por permisos. Sin acreditaciones, precios o resultados inventados.
- **ceiling:** la alineación vertical variable del panel de sistema impide la estabilidad del contenido.
- **material_fixes:** `.portal-main { margin:auto }` centra verticalmente las vistas cortas. Cambiar a `margin:0 auto`; el título del panel de sistema aparecía aproximadamente en y345 frente a y165 en otros paneles.
- **keep:** privacidad por rol, selector integrado, cuentas de ejemplo separadas, fotografía y esmeralda B+C.

La corrección se aplicó sin alterar la dirección visual. Compilación final y lint terminaron con código 0. Se sustituyeron las capturas de sistema, estudiante 1440/1896 y notas móviles por recapturas comprobadas tras la corrección.

## Veredicto de correcciones: ship limitado a un hallazgo

El mismo revisor puntuó **Resolved** la alineación del panel de sistema: título y contenido empiezan arriba a la misma altura que el estudiante, sin el vacío superior. No observó regresiones visibles en las cuatro recapturas. Su `remaining: Clear` y `disposition: ship` se limitan a la corrección puntuada; no son una aprobación global de integraciones ni una auditoría exhaustiva de seguridad.

El documenter actualizó quirúrgicamente DESIGN.md y su sidecar: conservó paleta y tipografía; registró cinco programas, selector integrado y navegación por rol. La comparación final confirmó la alineación y la copia idéntica del sidecar. La densidad auxiliar preexistente de 9–11px no se canonizó ni se reparó en este alcance.

## Alcance y evidencia

Doce capturas reales de viewport en `.impeccable/review/`: tema-1040-final, portada-mobile-final, panel-estudiante-final, estudiante-privado-desktop, estudiante-notas-mobile-en, docente-final-desktop, sistema-final-desktop, academico-final-desktop, nuevas-carreras-desktop, catalogo-desktop-en, biomedicos-desktop-en y biomedicos-mobile-es. No son capturas de página completa ni una auditoría exhaustiva de accesibilidad.

Detector ejecutado una vez: emitió avisos informativos de tamaños, radios y colores frente al sistema documentado, muchos preexistentes; su salida se truncó y no se afirma un recuento exhaustivo. No se repitió el detector. Procedencia: ocho rasters, cero faltantes.

La evidencia funcional adicional es local: nueve pruebas de proyección/permisos, seis HTTP, veinte migraciones y suites SQL de seguridad y reglas académicas. No constituye validación de Supabase, correos, despliegue ni seguridad exhaustiva de producción.
