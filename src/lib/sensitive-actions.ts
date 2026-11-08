export type SensitiveContext = { target?: string };
export type VerificationIntent = SensitiveContext & { id: string; operation: string; variant?: string; generation: number };

const protectedWrites = new Set([
  "manage_account", "set_role", "set_permission", "request_deletion", "approve_deletion", "cancel_deletion",
  "correct_identity", "resolve_identity_request", "assign_program", "manage_structure", "edit_structure", "retire_structure",
  "remove_assignment", "set_evaluation", "close_period", "add_calendar_event", "set_public_offer", "mark_contact", "reconcile_storage_budget",
]);
export function needsVerification(operation: string, parameters: Record<string, unknown> = {}): boolean {
  return protectedWrites.has(operation) || (operation === "set_translation" && ["program", "subject", "category"].includes(String(parameters.p_kind)));
}

export function verificationCopy(intent: Pick<VerificationIntent, "operation" | "variant">, english: boolean) {
  const labels: Record<string, [string, string]> = {
    suspended: ["Suspender cuenta", "Suspend account"], archived: ["Archivar cuenta", "Archive account"], active: ["Reactivar cuenta", "Reactivate account"],
    request_deletion: ["Solicitar eliminación", "Request deletion"], approve_deletion: ["Aprobar eliminación", "Approve deletion"], execute_deletion: ["Eliminar definitivamente", "Permanently delete"],
    cancel_deletion: ["Cancelar solicitud de eliminación", "Cancel deletion request"], set_role: ["Cambiar rol", "Change role"], set_permission: ["Cambiar permisos", "Change permissions"],
    invite: ["Crear una cuenta", "Create an account"], reconcile_invitation: ["Conciliar invitación", "Reconcile invitation"],
    password: ["Cambiar tu contraseña", "Change your password"], setup: ["Activar la verificación", "Enable verification"],
    close_period: ["Cerrar período académico", "Close academic period"], correct_identity: ["Corregir identidad", "Correct identity"], resolve_identity_request: ["Resolver corrección de identidad", "Resolve identity correction"],
    assign_program: ["Asignar carrera", "Assign program"], manage_structure: ["Guardar estructura académica", "Save academic structure"], edit_structure: ["Editar estructura académica", "Edit academic structure"],
    retire_structure: ["Archivar estructura académica", "Archive academic structure"], remove_assignment: ["Retirar asignación", "Remove assignment"], set_evaluation: ["Guardar evaluación", "Save evaluation"],
    add_calendar_event: ["Publicar evento académico", "Publish academic event"], set_public_offer: ["Actualizar oferta académica", "Update academic offer"], set_translation: ["Guardar traducción institucional", "Save institutional translation"],
    mark_contact: ["Marcar consulta como revisada", "Mark inquiry reviewed"], reconcile_storage_budget: ["Conciliar almacenamiento", "Reconcile storage"],
  };
  const key = intent.operation === "manage_account" ? intent.variant ?? "manage_account" : intent.operation;
  const title = (labels[key] ?? ["Confirmar operación", "Confirm operation"])[english ? 1 : 0];
  let description = english ? "Verify your identity with your authenticator to continue with this action." : "Confirma tu identidad con tu aplicación autenticadora para continuar con esta acción.";
  if (intent.operation.includes("deletion")) description = english ? "Accounts with academic history are archived. Permanent deletion requires two different administrators." : "Las cuentas con historial académico se archivan. La eliminación definitiva requiere dos administradores distintos.";
  if (intent.operation === "manage_account" && intent.variant === "archived") description = english ? "Access will be disabled and academic history preserved. Archiving is reversible." : "Se desactivará el acceso y se conservará el historial académico. El archivado es reversible.";
  if (intent.operation === "manage_account" && intent.variant === "suspended") description = english ? "New operations will be blocked. The account and its history will be preserved." : "Se bloquearán las nuevas operaciones. La cuenta y su historial se conservarán.";
  if (intent.operation === "close_period") description = english ? "Unsubmitted work receives zero. Submissions awaiting review prevent closing." : "Las actividades no entregadas recibirán cero. Las entregas pendientes de revisión impedirán el cierre.";
  const confirmations: Record<string, [string, string]> = {
    archived: ["Verificar y archivar", "Verify and archive"], suspended: ["Verificar y suspender", "Verify and suspend"], active: ["Verificar y reactivar", "Verify and reactivate"],
    request_deletion: ["Verificar y solicitar eliminación", "Verify and request deletion"], approve_deletion: ["Verificar y aprobar", "Verify and approve"], execute_deletion: ["Verificar y eliminar", "Verify and delete"],
    cancel_deletion: ["Verificar y cancelar solicitud", "Verify and cancel request"], close_period: ["Verificar y cerrar período", "Verify and close period"],
    password: ["Verificar y cambiar contraseña", "Verify and change password"], setup: ["Verificar y activar", "Verify and activate"], invite: ["Verificar y crear cuenta", "Verify and create account"],
  };
  return { title, description, confirm: (confirmations[key] ?? ["Verificar y guardar", "Verify and save"])[english ? 1 : 0] };
}
