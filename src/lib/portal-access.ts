import type { Role } from "@/contracts/academic";

export const academicPermissions = ["structure.manage", "enrollment.manage", "evaluation.manage", "period.close", "identity.manage", "contact.manage"] as const;
export function canOpenPortalView(view: string, role: Role | undefined, permissions: readonly string[]): boolean {
  if (!role) return false;
  if (["overview", "notifications", "profile", "security"].includes(view)) return true;
  if (["courses", "tasks", "detail"].includes(view)) return role === "student" || role === "teacher";
  if (view === "new-task") return role === "teacher";
  if (view === "grades") return role === "student";
  if (view === "calendar") return role !== "system_admin";
  if (view === "users" || view === "audit") return role === "system_admin";
  if (view === "contacts") return role === "academic_admin" && permissions.includes("contact.manage");
  if (view === "structure") return role === "academic_admin" && academicPermissions.some(permission => permission !== "contact.manage" && permissions.includes(permission));
  return false;
}
