import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import { URL } from "node:url";
import { Buffer } from "node:buffer";
import ts from "typescript";
function moduleUrl(source) { return `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`; }
const portalUrl = moduleUrl(await fs.readFile(new URL("../src/lib/portal-access.ts", import.meta.url), "utf8"));
const source = (await fs.readFile(new URL("../src/lib/account-management.ts", import.meta.url), "utf8")).replace('from "./portal-access"', `from ${JSON.stringify(portalUrl)}`);
const { accountRoles, accountPermissions, accountManagementKind, filterAccounts } = await import(moduleUrl(source));
const data = {
  profiles: [{ id: "s", full_name: "María López", document_number: "12345" }, { id: "t", full_name: "Andrés Ruiz" }, { id: "a", full_name: "Elena Duarte" }, { id: "root", full_name: "Sistema" }],
  user_roles: [{ user_id: "s", role: "student" }, { user_id: "t", role: "teacher" }, { user_id: "a", role: "academic_admin" }, { user_id: "root", role: "system_admin" }],
  user_permissions: [{ user_id: "a", permission: "evaluation.manage" }, { user_id: "a", permission: "structure.manage" }],
};
test("clasifica el rol único desde las relaciones reales", () => {
  assert.deepEqual(accountRoles(data, data.profiles[2]), ["academic_admin"]);
  assert.equal(accountManagementKind(accountRoles(data, data.profiles[0])), "student");
  assert.equal(accountManagementKind(accountRoles(data, data.profiles[1])), "teacher");
  assert.equal(accountManagementKind(accountRoles(data, data.profiles[2])), "academic");
  assert.equal(accountManagementKind(accountRoles(data, data.profiles[3])), "system");
});
test("filtra el directorio por el rol asignado", () => {
  assert.deepEqual(filterAccounts(data, "", "student").map(row => row.id), ["s"]);
  assert.deepEqual(filterAccounts(data, "", "teacher").map(row => row.id), ["t"]);
  assert.deepEqual(filterAccounts(data, "", "academic_admin").map(row => row.id), ["a"]);
  assert.deepEqual(filterAccounts(data, "", "system_admin").map(row => row.id), ["root"]);
});
test("un conflicto antiguo no elige ni concede silenciosamente un rol", () => {
  const conflicted = { ...data, user_roles: [...data.user_roles, { user_id: "s", role: "teacher" }] };
  assert.deepEqual(accountRoles(conflicted, data.profiles[0]), ["student", "teacher"]);
  assert.equal(accountManagementKind(accountRoles(conflicted, data.profiles[0])), "conflict");
});
test("combina nombre o documento con rol, tolerando acentos y mayúsculas", () => {
  assert.deepEqual(filterAccounts(data, " MARIA ", "student").map(row => row.id), ["s"]);
  assert.deepEqual(filterAccounts(data, "12345", "all").map(row => row.id), ["s"]);
  assert.deepEqual(filterAccounts(data, "Maria", "teacher"), []);
});
test("preselecciona exclusivamente los permisos de la persona elegida", () => {
  assert.deepEqual(accountPermissions(data, data.profiles[2]), ["structure.manage", "evaluation.manage"]);
  assert.deepEqual(accountPermissions(data, data.profiles[0]), []);
});
test("los datos ausentes no convierten a un usuario en personal ni inventan permisos", () => {
  assert.deepEqual(accountRoles({}, data.profiles[0]), []);
  assert.equal(accountManagementKind([]), "unknown");
  assert.deepEqual(accountPermissions({}, data.profiles[2]), []);
});
test("la vista previa conserva compatibilidad y una relación explícita prevalece", () => {
  const person = { id: "p", role: "academic_admin", permissions: ["structure.manage"] };
  assert.deepEqual(accountRoles({}, person), ["academic_admin"]);
  assert.deepEqual(accountPermissions({}, person), ["structure.manage"]);
  assert.deepEqual(accountRoles({ user_roles: [] }, person), []);
  assert.deepEqual(accountPermissions({ user_permissions: [] }, person), []);
});
