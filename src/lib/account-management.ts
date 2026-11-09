import type { Role } from "@/contracts/academic";
import { academicPermissions } from "./portal-access";
import type { Dataset, Row } from "./preview-data";

export const accountRoleOrder: Role[] = ["student", "teacher", "academic_admin", "system_admin"];
export function accountRoles(data: Dataset, person: Row): Role[] {
  const assigned = data.user_roles?.filter(row => row.user_id === person.id).map(row => row.role) ?? (typeof person.role === "string" ? [person.role] : []);
  return accountRoleOrder.filter(role => assigned.includes(role));
}
export function accountPermissions(data: Dataset, person: Row): string[] {
  const assigned = data.user_permissions?.filter(row => row.user_id === person.id).map(row => row.permission) ?? (Array.isArray(person.permissions) ? person.permissions : []);
  return academicPermissions.filter(permission => assigned.includes(permission));
}
export function accountManagementKind(roles: readonly Role[]) {
  if (roles.length > 1) return "conflict";
  return roles.includes("academic_admin") ? "academic" : roles.includes("teacher") ? "teacher" : roles.includes("system_admin") ? "system" : roles.includes("student") ? "student" : "unknown";
}
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function filterAccounts(data: Dataset, search: string, role: Role | "all"): Row[] {
  const needle = normalize(search);
  return (data.profiles ?? []).filter(person => (role === "all" || accountRoles(data, person).includes(role)) && normalize(`${person.full_name ?? ""} ${person.document_number ?? ""}`).includes(needle))
    .sort((a, b) => String(a.full_name ?? "").localeCompare(String(b.full_name ?? ""), "es", { sensitivity: "base" }) || a.id.localeCompare(b.id));
}
