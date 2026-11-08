# Qué falta del plan inicial

Este documento resume el avance; PRODUCT.md sigue siendo la fuente de requisitos y PLAN.md conserva las etapas. No se expresa un porcentaje global: tener código, validarlo localmente y comprobarlo con los servicios reales son resultados distintos.

Actualización del 8 de noviembre: landing y salud pública observadas; primer administrador y MFA confirmados por el usuario. El segundo administrador sigue pendiente. La nueva verificación contextual pasó las comprobaciones locales con 21 migraciones; falta aplicar únicamente 021 en el proyecto existente y publicar ese código. El inventario histórico siguiente no reemplaza el bloque actual de ESTADO.md. Antes de cargar datos de ejemplo, adaptar la semilla para preservar cuentas propias.

## Evidencia actual

- Hay una aplicación Next.js en un solo repositorio: interfaz y API, con landing, acceso, recuperación, cuatro portales, datos de ejemplo, navegación por rol y preferencias ES/EN/temas.
- Cinco programas públicos, fotografías optimizadas, historia, misión, visión y contacto preparados. La dirección B+C se conserva y hubo revisión visual de alcance limitado.
- Backend con veinte migraciones, RLS y políticas de archivos. El instalador completo pasó en PostgreSQL aislado con 26 tablas públicas protegidas; suites de permisos y reglas académicas aprobadas localmente.
- Nueve pruebas de proyección/permisos y seis HTTP locales aprobadas en el bloque correspondiente. No son pruebas completas de los servicios externos.
- Auth responde con registro público desactivado según el resultado compartido por el usuario. Después informó que la instalación SQL terminó bien; no se recibió la fila de resumen ni se ejecutó una verificación remota adicional del agente.
- El usuario informó que subió el proyecto a GitHub. Se comprobó el remoto configurado y que `.env.local` no está versionado actualmente. URL, Publishable y Secret tienen valor local; eso no acredita la validez de Secret contra el servicio.

## Trabajo pendiente, en orden recomendado

| Bloque | Qué queda por hacer | Cómo sabremos que terminó |
|---|---|---|
| Primera publicación | Importar GitHub en Vercel Hobby, configurar variables y observar el despliegue. | URL pública en Ready, landing y API de salud accesibles desde computador/celular. |
| Configuración de servidor | Completar retorno de recuperación, dominio permitido de correo y secreto del canal de contacto. Revisar límites vigentes. | Cada variable tiene destino correcto y la función asociada deja de estar pendiente; secretos solo en servidor. |
| Primeros administradores | Preparar el alta controlada del primer administrador y del segundo necesario para doble autorización, sin registro abierto. Configurar MFA. | Acceso institucional real y operaciones sensibles protegidas; no basta crear un usuario en Auth sin perfil/rol. |
| Datos de demostración | Revisar y autorizar la semilla de 47 cuentas, cinco carreras, cuatro materias, seis grupos y un período. Las matrículas iniciales permanecen en las dos carreras originales. | Carga real revisada sin correos a direcciones inventadas; permisos coherentes por persona. |
| Recorrido académico conectado | Docente publica a uno/varios grupos o una selección; estudiante entrega; docente comenta/califica; estudiante consulta. | Persistencia real, aislamiento entre estudiantes, archivo privado y nota visible al guardarse. |
| Promedio provisional | Concretar el tratamiento de categorías aún sin notas y completar el cálculo ponderado real. | Resultado explícito y comprobado según pesos por categoría; no confundir el promedio de muestra con el cálculo del servidor. |
| Reemplazos y cierre | Completar políticas pendientes de autorización de reemplazos y cambios del esquema con actividades. Probar cierre y correcciones contra Supabase. | Una entrega, reemplazo autorizado, historial, tardanza sin penalización automática, ceros a no entregadas y pendientes de revisión que bloquean cierre. |
| Administración conectada | Probar matrículas, grupos, permisos específicos, identidad, suspensión/reactivación, archivado, auditoría, calendario, rúbricas y notificaciones. | Operaciones permitidas y rechazadas por servidor/base; suspensión también bloquea una sesión abierta. |
| Bajas excepcionales | Mantener ejecución definitiva desactivada hasta verificar el ejecutor, ausencia de historial, dos administradores y conciliación de archivos/Auth. | Flujo completo y trazable con escenarios permitidos y denegados. |
| Invitación y recuperación | Elegir/configurar remitente gratuito compatible, revisar destino de enlaces de invitación y probar activación/recuperación con buzón controlado. | Correo recibido, enlace correcto, contraseña establecida y acceso con rol correcto. No hay SMS gratuito contratado. |
| Contacto público | Configurar secreto de límite, probar recepción privada y acceso exclusivo del personal con permiso. | Consulta guardada, consentimiento registrado, límites efectivos y resultado de error/éxito correcto. |
| Traducciones académicas | Confirmar si las versiones ES/EN revisadas por el autor satisfacen el alcance solicitado. El código ya admite esas versiones, sin API externa. Acordar por separado el interior de adjuntos. | Contenido académico en ambos idiomas según el mecanismo acordado; una traducción ausente no se inventa. |
| Contenido institucional | Completar duración, modalidad y precios cuando el usuario los defina; revisar textos de las cinco carreras. | Oferta coherente sin precios, acreditaciones, testimonios o fechas inventadas por el agente. |
| Calidad y privacidad | Revisar accesibilidad, dispositivos reales, rendimiento, concurrencia, límites y denegaciones mediante API/Storage. | Evidencia del uso real y rechazo de acceso ajeno; no solo capturas o botones ocultos. |
| Copias y restauración | Ejecutar copia privada de base/archivos y comprobar recuperación en un destino aislado. | Restauración observada y documentada; tener un script no equivale a una copia recuperable. |
| PWA y entrega | Validar instalación, actualización y modo sin conexión limitado, preparar documentación y accesos de portafolio controlados. | Instalación probada en dispositivo y ausencia de datos académicos privados guardados sin una política acordada. |

## Dos pendientes de implementación que no deben ocultarse

1. **Promedio provisional:** `public.my_subject_result`, en la migración 011, sigue devolviendo un valor nulo con estado `pending_academic_policy`. La vista previa calcula un promedio de muestra; no acredita el promedio ponderado real solicitado. El cierre final sí tiene implementación y pruebas locales.
2. **Traducción:** el selector ES/EN y las versiones académicas revisadas tienen código. No hay servicio de traducción automática elegido ni traducción del interior de documentos/fotografías implementada. No se prometen llamadas de pago para completarlas.

## Orden del próximo recorrido guiado

Publicar la primera versión → configurar la URL real y el servidor → primeros administradores con MFA → datos de ejemplo controlados → recorrido académico real → correo/contacto y traducciones → revisión, restauración y PWA.

La publicación inicial permite revisar desde el celular. No convierte por sí sola todo el proyecto en una plataforma terminada ni garantiza disponibilidad continua dentro de cuotas gratuitas.
