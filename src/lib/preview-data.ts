import fixtures from "../../supabase/fixtures/accounts.json";
import type { Role } from "@/contracts/academic";

export type Row = { id: string; [key: string]: unknown };
export type Dataset = Record<string, Row[]>;
export const str = (row: Row | undefined, field: string, fallback = "") => typeof row?.[field] === "string" ? row[field] as string : fallback;
export const number = (row: Row | undefined, field: string) => Number(row?.[field] ?? 0);

export function previewViewer(role: Role, actor?: string) { return fixtures.accounts.find(account => account.role === role && account.fixture_id === actor) ?? fixtures.accounts.find(account => account.role === role)!; }
export function createPreview(role: Role, full = false): Dataset {
  const viewer = previewViewer(role); const students = fixtures.accounts.filter(a => a.role === "student");
  const subjects: Row[] = [
    { id: "s1", name: "Programación I", name_en: "Programming I", program_id: "p1" },
    { id: "s2", name: "Bases de datos", name_en: "Databases", program_id: "p1" },
    { id: "s3", name: "Fundamentos de redes", name_en: "Networking fundamentals", program_id: "p2" },
    { id: "s4", name: "Matemáticas aplicadas", name_en: "Applied mathematics", program_id: "p2" },
  ];
  const groups: Row[] = ["A01", "A02", "B01", "R01", "R02", "M01"].map((name, index) => ({ id: `g${index + 1}`, name, subject_id: ["s1", "s1", "s2", "s3", "s3", "s4"][index], period_id: "period1" }));
  const enrollments: Row[] = [];
  groups.forEach((group, index) => { const network = index > 2; const eligible = students.filter((_, i) => network ? i % 2 === 1 : i % 2 === 0); const roster = index === 2 || index === 5 ? eligible : eligible.slice(index === 1 || index === 4 ? 10 : 0, index === 1 || index === 4 ? 20 : 10); roster.forEach(s => enrollments.push({ id: `${group.id}-${s.fixture_id}`, group_id: group.id, student_id: s.fixture_id })); });
  const tasks: Row[] = groups.flatMap((group, index) => [
    { id: `t${index * 2 + 1}`, group_id: group.id, category_id: `c-${str(group, "subject_id")}-1`, title: ["Primeros pasos con algoritmos", "Diseñar una solución", "Modelo de una biblioteca", "Conectar una red local", "Plan de direccionamiento", "Resolver un caso práctico"][index], title_en: ["Getting started with algorithms", "Design a solution", "A library data model", "Connect a local network", "Addressing plan", "Solve a practical case"][index], description: "Desarrolla una propuesta y explica tus decisiones. Adjunta un documento o una fotografía legible del resultado. Comparte tus preguntas en los comentarios de tu entrega.", description_en: "Develop a proposal and explain your decisions. Attach a document or a readable photograph of the result. Share questions in your submission comments.", due_at: "2026-11-05T23:59:00-05:00", author_id: index > 2 ? "persona-42" : "persona-41" },
    { id: `t${index * 2 + 2}`, group_id: group.id, category_id: `c-${str(group, "subject_id")}-2`, title: "Proyecto colaborativo: una solución para la comunidad", title_en: "Collaborative project: a solution for the community", description: "Propón una solución relacionada con los temas de la materia. Documenta el proceso, los resultados y lo que mejorarías en una próxima versión.", description_en: "Propose a solution related to the course topics. Document the process, results and what you would improve in a future version.", due_at: "2026-11-20T23:59:00-05:00", author_id: index > 2 ? "persona-42" : "persona-41" },
  ]);
  const submissions: Row[] = []; const versions: Row[] = [];
  tasks.forEach((task, ti) => enrollments.filter(e => e.group_id === task.group_id).forEach((e, si) => {
    const id = `${task.id}-${e.student_id}`; const delivered = (si + ti) % 3 !== 2; const graded = delivered && ti % 2 === 0;
    submissions.push({ id, task_id: task.id, student_id: e.student_id, current_version: delivered ? 1 : 0, replacement_allowed: false, grade: graded ? [4.2, 3.8, 4.5, 3.1][si % 4] : null, graded_at: graded ? "2026-11-07T09:00:00-05:00" : null });
    if (delivered) versions.push({ id: `v-${id}`, submission_id: id, version: 1, body: "Comparto mi propuesta y las decisiones que tomé durante el desarrollo del ejercicio.", body_en: "Here is my proposal and the decisions I made while developing the exercise.", late: si % 4 === 0, submitted_at: si % 4 === 0 ? "2026-11-06T10:30:00-05:00" : "2026-11-04T16:20:00-05:00" });
  }));
  const visibleGroupIds = full ? groups.map(g => g.id) : role === "student" ? enrollments.filter(e => e.student_id === viewer.fixture_id).map(e => e.group_id) : role === "teacher" ? ["g1", "g2", "g3"] : groups.map(g => g.id);
  const visibleTasks = tasks.filter(task => visibleGroupIds.includes(task.group_id));
  const visibleSubmissions = submissions.filter(s => visibleTasks.some(t => t.id === s.task_id) && (full || role !== "student" || s.student_id === viewer.fixture_id));
  const academic = full || role === "student" || role === "teacher";
  return {
    profiles: (full || role === "system_admin" || role === "academic_admin" ? fixtures.accounts : [viewer]).map(a => ({ id: a.fixture_id, full_name: a.full_name, email: a.email, document_number: a.document_number, birth_date: "2001-05-18", address: "Calle de ejemplo 12, San Miguel", state: "active", program_id: a.program === "Redes y Telecomunicaciones" ? "p2" : "p1", role: a.role })),
    roster: students.map(a => ({ id: a.fixture_id, student_id: a.fixture_id, full_name: a.full_name })),
    groups: groups.filter(g => visibleGroupIds.includes(g.id)), subjects,
    programs: [{ id: "p1", name: "Desarrollo de Software", name_en: "Software Development" }, { id: "p2", name: "Redes y Telecomunicaciones", name_en: "Networks and Telecommunications" }],
    periods: [{ id: "period1", name: "Período de ejemplo", name_en: "Example term", starts_on: "2026-08-01", ends_on: "2026-12-15", closed_at: null }],
    categories: subjects.flatMap(s => [1, 2].map(n => ({ id: `c-${s.id}-${n}`, subject_id: s.id, period_id: "period1", name: n === 1 ? "Tareas" : "Proyecto", name_en: n === 1 ? "Assignments" : "Project", weight: 50 }))),
    enrollments: enrollments.filter(e => visibleGroupIds.includes(e.group_id)), tasks: academic ? visibleTasks : [], submissions: academic ? visibleSubmissions : [], submission_versions: academic ? versions.filter(v => visibleSubmissions.some(s => s.id === v.submission_id)) : [],
    comments: academic && visibleSubmissions[0] ? [{ id: "comment1", submission_id: visibleSubmissions[0].id, author_id: "persona-41", body: "Buen trabajo. Explica con más detalle cómo validarías los datos de entrada.", body_en: "Good work. Explain in more detail how you would validate input data.", created_at: "2026-11-07T09:05:00-05:00" }] : [],
    teacher_groups: [{ id: "a1", teacher_id: "persona-41", group_id: "g1" }, { id: "a2", teacher_id: "persona-41", group_id: "g2" }, { id: "a3", teacher_id: "persona-41", group_id: "g3" }, { id: "a4", teacher_id: "persona-42", group_id: "g4" }, { id: "a5", teacher_id: "persona-42", group_id: "g5" }, { id: "a6", teacher_id: "persona-42", group_id: "g6" }, { id: "a7", teacher_id: "persona-43", group_id: "g1" }, { id: "a8", teacher_id: "persona-43", group_id: "g3" }, { id: "a9", teacher_id: "persona-44", group_id: "g4" }, { id: "a10", teacher_id: "persona-44", group_id: "g6" }],
    final_results: [], uploads: [], content_translations: [], rubrics: [], grade_history: [], contact_inquiries: [],
    notifications: [{ id: "n1", kind: "welcome", read_at: null, created_at: "2026-11-07T08:00:00-05:00", title: "Bienvenido a tu espacio académico", title_en: "Welcome to your academic space" }],
    calendar_events: [{ id: "event1", title: "Encuentro de proyectos", title_en: "Project showcase", starts_at: "2026-11-18T10:00:00-05:00", ends_at: "2026-11-18T12:00:00-05:00" }],
    audit_events: role === "system_admin" ? [{ id: "audit1", action: "account_created", entity: "profiles", resource_id: "persona-01", created_at: "2026-11-07T08:00:00-05:00" }] : [], deletion_requests: [], identity_requests: [], invitation_jobs: [],
  };
}

// Recorte de datos ficticios para cada vista. La autorización real vive en el servidor y RLS.
export function selectPreview(master: Dataset, role: Role, actor?: string): Dataset {
  const viewer = previewViewer(role, actor); const uid = viewer.fixture_id;
  const row = (resource: string) => master[resource] ?? [];
  const groups = row("groups").filter(g => role === "student" ? row("enrollments").some(e => e.student_id === uid && e.group_id === g.id) : role === "teacher" ? row("teacher_groups").some(a => a.teacher_id === uid && a.group_id === g.id) : true);
  const groupIds = groups.map(g => g.id); const academic = role === "student" || role === "teacher";
  const tasks = academic ? row("tasks").filter(task => groupIds.includes(String(task.group_id)) && (role !== "student" || row("submissions").some(s => s.task_id === task.id && s.student_id === uid))) : [];
  const submissions = row("submissions").filter(s => tasks.some(task => task.id === s.task_id) && (role !== "student" || s.student_id === uid));
  const versions = row("submission_versions").filter(v => submissions.some(s => s.id === v.submission_id));
  const enrollments = row("enrollments").filter(e => groupIds.includes(String(e.group_id)) && (role !== "student" || e.student_id === uid));
  return { ...master, groups, enrollments, tasks, submissions, submission_versions: versions,
    profiles: row("profiles").filter(p => role === "academic_admin" || role === "system_admin" || p.id === uid),
    roster: row("roster").filter(p => enrollments.some(e => e.student_id === p.student_id)),
    comments: row("comments").filter(c => submissions.some(s => s.id === c.submission_id)),
    uploads: row("uploads").filter(file => file.owner_id === uid || versions.some(v => v.id === file.version_id || (Array.isArray(v.upload_ids) && v.upload_ids.includes(file.id)))),
    notifications: row("notifications").filter(n => !n.user_id || n.user_id === uid),
    final_results: row("final_results").filter(r => groupIds.includes(String(r.group_id)) && (role === "teacher" || r.student_id === uid)),
    audit_events: role === "system_admin" ? row("audit_events") : [], deletion_requests: role === "system_admin" ? row("deletion_requests") : [],
    identity_requests: row("identity_requests").filter(r => role === "academic_admin" || r.user_id === uid),
    invitation_jobs: role === "system_admin" ? row("invitation_jobs") : [], contact_inquiries: role === "academic_admin" ? row("contact_inquiries") : [],
    grade_history: row("grade_history").filter(r => submissions.some(s => s.id === r.submission_id)),
    rubrics: row("rubrics").filter(r => tasks.some(task => task.id === r.task_id)),
    content_translations: row("content_translations").filter(r => ["program", "subject", "category"].includes(String(r.resource_type)) || tasks.some(task => task.id === r.resource_id) || row("comments").some(c => c.id === r.resource_id && submissions.some(s => s.id === c.submission_id))),
  };
}
