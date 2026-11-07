# Guía del agente

Proyecto: Instituto Tecnológico de San Miguel, demostración universitaria fullstack con datos ficticios y presupuesto adicional de cero.

## Contexto que debes leer

1. PRODUCT.md: requisitos actuales, reglas confirmadas, propuestas y decisiones abiertas.
2. docs/ESTADO.md: bloque actual, verificaciones y siguiente paso.
3. docs/PLAN.md: orden de las etapas y sus criterios de finalización.
4. docs/ENTORNO.md: herramientas detectadas y qué no se ha comprobado todavía.
5. Antes de configurar servicios: docs/SERVICIOS-GRATUITOS.md y docs/CONFIGURACION-SERVICIOS.md, con cuotas, pasos y pruebas observadas o pendientes.

Mantén una única fuente de requisitos en PRODUCT.md. Actualiza el estado al cerrar cada bloque. Si recibes una corrección explícita del usuario, incorpora el acuerdo sin reabrir decisiones ya confirmadas.

## Cómo colaborar

- Responde en español, explica conceptos cuando aparezcan y trabaja en bloques pequeños.
- Indica objetivo, cambios, pasos que debe realizar el usuario, resultado esperado y cómo comprobarlo.
- Realiza directamente los cambios rutinarios autorizados y conserva archivos y ediciones de otros.
- Avanza dentro del bloque acordado. Antes de pasar a otra etapa sustancial, explica lo terminado y lo siguiente.
- Pregunta únicamente por decisiones materiales pendientes. Diferencia confirmado, propuesto y verificado.
- La identidad visual debe elegirse con el usuario antes de programar pantallas. No crear DESIGN.md con una dirección inventada.

## Restricciones del proyecto

- Un solo repositorio de una aplicación Next.js modular con Supabase, según PRODUCT.md.
- Cero costes adicionales. Verifica condiciones oficiales antes de activar servicios; no usar una API de pago para sustituir el uso incluido del agente.
- No activar servicios externos ni publicar durante el primer bloque. No instalar herramientas globales en ese bloque.
- No guardar secretos, copias de datos privados o credenciales en Git ni en respuestas. Las plantillas no llevan secretos reales.
- Aplicar autorizaciones por operación y recurso en servidor, base de datos y archivos; el rol no sustituye la relación con el grupo o estudiante.
- Conservar la entrega única con reemplazo autorizado incluso antes de calificar, el redondeo aprobado y los ceros automáticos al cierre. No sustituir estas reglas por recomendaciones anteriores.
- No afirmar que una integración o comprobación funcionó sin ejecutarla y observar su resultado.

## Mensajes de commit

- Preferencia confirmada del usuario: cada commit debe tener un título claro y un cuerpo detallado en español.
- Describir los cambios concretos de ese commit, su finalidad y las comprobaciones realmente ejecutadas, con sus resultados y límites relevantes.
- Agrupar cambios relacionados en commits comprensibles; un mensaje genérico como «cambios» o «actualización» no es suficiente.
- Conservar el historial existente. Esta preferencia se aplica a los commits siguientes, salvo que el usuario pida reescribir los anteriores.

## Comprobaciones del proyecto

La base técnica define estos comandos, ejecutados desde la raíz del proyecto:

- `npm.cmd ci`: instalación reproducible desde package-lock.json.
- `npm.cmd run dev`: desarrollo en 127.0.0.1; comprobar `/api/health` hasta que haya pantallas aprobadas.
- `npm.cmd run lint`: ESLint.
- `npm.cmd run typecheck`: generación de tipos de Next.js y TypeScript.
- `npm.cmd run build`: compilación optimizada.
- `npm.cmd run start`: ejecución local de una compilación existente.

El estado de las comprobaciones realmente ejecutadas está en docs/ESTADO.md. No confundir comandos configurados con resultados observados. Vitest y Playwright siguen previstos para sus etapas; todavía no hay una suite de reglas académicas.

Para cambios solo de documentación basta revisar consistencia y referencias. No crear pruebas que repitan el texto o una respuesta constante. Al trabajar con Next.js, consultar la documentación de la versión instalada cuando esté disponible en node_modules/next/dist/docs.

La identidad visual sigue pendiente de elección del usuario. El layout raíz técnico y la configuración de Tailwind no autorizan a construir una landing o paneles sin esa elección.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
