import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import { URL } from "node:url";
import { Buffer } from "node:buffer";
import ts from "typescript";

// Ejecuta las funciones de permisos y proyección del código real, sin navegador,
// credenciales ni servicios externos. TypeScript solo elimina tipos/import type.
async function loadSource(path, substitutions = []) {
  let source = await fs.readFile(new URL(path, import.meta.url), "utf8");
  for (const [from, to] of substitutions) source = source.replace(from, to);
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const fixtures = await fs.readFile(new URL("../supabase/fixtures/accounts.json", import.meta.url), "utf8");
const { createPreview, selectPreview, previewViewer } = await loadSource("../src/lib/preview-data.ts", [
  ['import fixtures from "../../supabase/fixtures/accounts.json";', `const fixtures = ${fixtures};`],
]);
const { canOpenPortalView } = await loadSource("../src/lib/portal-access.ts");
const master = createPreview("teacher", true);

test("cada estudiante recibe solo su perfil, entregas y archivos, sin directorio de personas", () => {
  for (const profile of master.profiles.filter(profile => profile.role === "student")) {
    const data = selectPreview(master, "student", profile.id);
    assert.deepEqual(data.profiles.map(item => item.id), [profile.id]);
    assert.deepEqual(data.roster, []);
    assert.deepEqual(data.teacher_groups, []);
    assert.ok(data.submissions.every(item => item.student_id === profile.id));
    assert.ok(data.enrollments.every(item => item.student_id === profile.id));
    assert.ok(data.final_results.every(item => item.student_id === profile.id));
    assert.ok(data.subjects.every(subject => data.groups.some(group => group.subject_id === subject.id)));
    assert.ok(data.submission_versions.every(version => data.submissions.some(submission => submission.id === version.submission_id)));
    assert.ok(data.comments.every(comment => data.submissions.some(submission => submission.id === comment.submission_id)));
    assert.equal(data.contact_inquiries.length, 0);
    assert.equal(data.audit_events.length, 0);
  }
});

test("una persona de otro rol no cambia la identidad del estudiante", () => {
  const admin = master.profiles.find(profile => profile.role === "system_admin");
  const expected = previewViewer("student").fixture_id;
  assert.equal(selectPreview(master, "student", admin.id).profiles[0].id, expected);
});

test("los docentes solo reciben sus grupos y el listado pertinente", () => {
  for (const profile of master.profiles.filter(profile => profile.role === "teacher")) {
    const data = selectPreview(master, "teacher", profile.id);
    assert.ok(data.groups.every(group => master.teacher_groups.some(assignment => assignment.teacher_id === profile.id && assignment.group_id === group.id)));
    assert.ok(data.roster.every(person => data.enrollments.some(enrollment => enrollment.student_id === person.student_id)));
    assert.ok(data.teacher_groups.every(assignment => assignment.teacher_id === profile.id));
    assert.deepEqual(data.profiles.map(item => item.id), [profile.id]);
  }
});

test("administrar cuentas no concede notas, comentarios ni listados académicos", () => {
  const data = selectPreview(master, "system_admin");
  for (const key of ["submissions", "submission_versions", "tasks", "comments", "roster", "grade_history", "rubrics", "contact_inquiries"]) assert.deepEqual(data[key], [], key);
});

test("la proyección no hereda recursos privados desconocidos por propagación", () => {
  const projected = selectPreview({ ...master, private_records: [{ id: "secret" }] }, "student");
  assert.equal(projected.private_records, undefined);
});

test("archivos y traducciones ajenos no entran en el espacio del estudiante", () => {
  const data = selectPreview({ ...master,
    uploads: [{ id: "other-file", owner_id: "other-student", version_id: "other-version" }],
    content_translations: [
      { id: "other-translation", resource_type: "task", resource_id: "other-task" },
      { id: "unknown-translation", resource_type: "private-record", resource_id: "secret" },
    ],
  }, "student");
  assert.deepEqual(data.uploads, []);
  assert.deepEqual(data.content_translations, []);
});

test("las vistas del estudiante excluyen administración, contactos y creación de tareas", () => {
  for (const view of ["overview", "courses", "tasks", "detail", "grades", "calendar", "profile", "security", "notifications"]) assert.equal(canOpenPortalView(view, "student", []), true, view);
  for (const view of ["users", "audit", "contacts", "structure", "new-task", "unknown"]) assert.equal(canOpenPortalView(view, "student", ["structure.manage", "contact.manage"]), false, view);
});

test("docentes y administradores tienen navegación distinta", () => {
  assert.equal(canOpenPortalView("new-task", "teacher", []), true);
  assert.equal(canOpenPortalView("users", "teacher", []), false);
  assert.equal(canOpenPortalView("users", "system_admin", []), true);
  assert.equal(canOpenPortalView("grades", "system_admin", []), false);
  assert.equal(canOpenPortalView("overview", undefined, []), false);
});

test("la gestión académica requiere permisos específicos", () => {
  assert.equal(canOpenPortalView("structure", "academic_admin", []), false);
  assert.equal(canOpenPortalView("contacts", "academic_admin", []), false);
  assert.equal(canOpenPortalView("structure", "academic_admin", ["evaluation.manage"]), true);
  assert.equal(canOpenPortalView("structure", "academic_admin", ["contact.manage"]), false);
  assert.equal(canOpenPortalView("contacts", "academic_admin", ["contact.manage"]), true);
});
