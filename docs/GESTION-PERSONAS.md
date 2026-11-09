# Gestión de personas

Acuerdo actualizado el 8 de noviembre de 2026: una persona tiene un único rol. Sustituye el soporte anterior de varios roles. Los seis permisos específicos siguen siendo exclusivos del administrativo académico; gestionar cuentas como administrador del sistema no concede acceso automático a notas.

| Perfil | Opciones visibles |
|---|---|
| Estudiante | Estado y explicación de sus funciones personales; sin controles de roles del personal ni permisos académicos. |
| Docente | Estado, funciones en grupos asignados y selector de un único rol. |
| Administrativo académico | Estado, seis casillas de permisos y selector de un único rol. |
| Administrador del sistema | Estado y selector de rol; su propia cuenta requiere otro administrador. |

## Organización

El directorio ocupa todo el ancho útil, hasta 1240px. La búsqueda por nombre/documento se combina con el filtro. Gestionar abre una ficha independiente; Volver conserva búsqueda/filtro y devuelve el foco a la fila o al encabezado si ya no coincide. Invitar abre su propio formulario.

Títulos locales de 28px y 24px en móvil sustituyen el tamaño fluido de la landing. Los filtros muestran su texto completo; el buscador usa el ancho disponible. La tabla desplaza sus propias columnas cuando hace falta, mientras ficha y permisos se apilan en móvil. Se conservan Manrope, B+C, temas y ES/EN. Cambiar de idioma o recargar datos de la misma identidad no desmonta el formulario. Una identidad diferente conserva el bloqueo que impide mostrar datos ajenos.

Guardar permisos mantiene la operación conjunta con una verificación, Restablecer vuelve a lo guardado y Cancelar conserva el borrador. Guardar rol sustituye el anterior y advierte sobre la retirada de permisos académicos. Un conflicto antiguo no se presenta como dos roles válidos ni se resuelve escogiendo el primero. Volver con un borrador solicita descartarlo.

## Base y activación

022 incorporó permisos conjuntos y limpieza al retirar el rol académico. 023 añade UNIQUE(user_id), assign_account_role y compatibilidad con set_role: habilitar sustituye, deshabilitar se rechaza para no dejar la cuenta sin rol. La creación sigue asignando un rol; la eliminación de cuentas conserva su procedimiento.

Se comprueba administrador activo, TOTP reciente, destino distinto de la cuenta propia, estado no deleting y conjunto esperado. Se serializa con el bloqueo 771001; una edición concurrente invalida el formulario antiguo. Se protegen administradores y se audita el nuevo rol. No se borran perfiles, matrículas, asignaciones, tareas, entregas ni calificaciones.

1. Confirmar el proyecto dedicado y 022 existente; no repetirla ni reinstalar.
2. Revisar conflictos y elegir un rol para cada persona. El usuario ya eligió Docente para la cuenta mostrada. La corrección específica se entrega fuera de Git: exige nombre único y los dos roles esperados, conserva Docente y retira Estudiante. Se detiene si los datos no coinciden.
3. Aplicar solo supabase/migrations/202611080023_single_account_role.sql. Si quedan conflictos, se detiene sin decidir roles ni aplicar parcialmente.
4. Publicar el frontend de este bloque. Sin variables nuevas. Comprobar directorio amplio, ficha, retorno, permisos y selector único.

Si falla, conservar el mensaje antes de repetir. Para comprobar 023, consultar to_regprocedure('public.assign_account_role(uuid,text,text[])') y la restricción user_roles_one_per_user. No borrar funciones o restricciones para repetir. Una reversión requiere una migración revisada, sin restaurar roles/permisos antiguos indiscriminadamente.

## Comprobaciones y límites

Instalador de 23 migraciones, rechazo de reinstalación, cinco suites SQL y actualización desde 022 con conflicto sintético comprobados. Treinta pruebas Node, tipos, lint y compilación correctos. Recorrido DOM/accesible con componentes reales y respuestas simuladas en escritorio, 1024px y móvil de 390px; cancelación y sustitución del rol, estudiante sin controles del personal, invitación separada, idioma/tema y borrador conservado. Capturas no disponibles; sin aprobación visual por imagen.

Sin cambios Supabase, correo ni despliegue desde el agente. El fallo remoto anterior del autenticador sigue sin diagnóstico confirmado. La semilla remota sigue pendiente de conservar el administrador propio antes de autorizar su carga.
