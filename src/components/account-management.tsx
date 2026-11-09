"use client";

import { useEffect, useRef, useState } from "react";
import type { Role } from "@/contracts/academic";
import { accountManagementKind, accountPermissions, accountRoleOrder, accountRoles, filterAccounts } from "@/lib/account-management";
import { academicPermissions } from "@/lib/portal-access";
import { roleNames } from "@/lib/content";
import { str, type Dataset, type Row } from "@/lib/preview-data";
import { Empty, Icon, Message, useUI } from "./ui";

type Command = (operation: string, params: Record<string, unknown>) => Promise<unknown>;
const permissionCopy: Record<string, [string, string, string, string]> = {
  "structure.manage": ["Estructura académica", "Academic structure", "Gestionar carreras, períodos, materias y grupos.", "Manage programs, terms, subjects and groups."],
  "enrollment.manage": ["Matrículas y asignaciones", "Enrollment and assignments", "Matricular estudiantes y asignar docentes a grupos.", "Enroll students and assign teachers to groups."],
  "evaluation.manage": ["Esquemas de evaluación", "Assessment schemes", "Definir categorías y porcentajes de evaluación.", "Define assessment categories and weights."],
  "period.close": ["Cierre de períodos", "Term closing", "Cerrar períodos y consolidar resultados finales.", "Close terms and calculate final results."],
  "identity.manage": ["Correcciones de identidad", "Identity corrections", "Revisar y corregir datos de identidad autorizados.", "Review and correct authorized identity details."],
  "contact.manage": ["Consultas de contacto", "Contact inquiries", "Revisar las solicitudes del formulario público.", "Review inquiries from the public form."],
};

function PermissionEditor({ person, data, command, busy, onDirty, onSaved }: { person: Row; data: Dataset; command: Command; busy: boolean; onDirty: (value: boolean) => void; onSaved: () => void }) {
  const { t, lang } = useUI();
  const saved = accountPermissions(data, person); const signature = saved.join(",");
  const [draft, setDraft] = useState(() => ({ baseline: saved, selected: saved }));
  const dirty = draft.baseline.join(",") !== draft.selected.join(",");
  useEffect(() => { onDirty(dirty); return () => onDirty(false); }, [dirty, onDirty]);
  useEffect(() => {
    setDraft(current => current.baseline.join(",") === current.selected.join(",") ? { baseline: signature ? signature.split(",") : [], selected: signature ? signature.split(",") : [] } : current);
  }, [signature]);
  const stale = signature !== draft.baseline.join(",");
  async function save() {
    const chosen = [...draft.selected];
    try { await command("set_permissions", { p_user: person.id, p_permissions: chosen, p_expected: draft.baseline }); setDraft({ baseline: chosen, selected: chosen }); onSaved(); }
    catch { /* El contenedor muestra el error; se conserva el borrador. */ }
  }
  return <form onSubmit={event => { event.preventDefault(); void save(); }}>
    <fieldset className="people-permissions" disabled={busy}>
      <legend>{t("Permisos académicos", "Academic permissions")}</legend>
      <p className="people-description">{t("Marca las funciones que esta persona podrá utilizar. Los cambios se guardan juntos.", "Select the functions this person can use. Changes are saved together.")}</p>
      <div className="permission-grid">{academicPermissions.map(permission => {
        const copy = permissionCopy[permission];
        return <label className="permission-option" key={permission}>
          <input type="checkbox" name="permissions" value={permission} checked={draft.selected.includes(permission)} onChange={event => setDraft(current => ({ ...current, selected: academicPermissions.filter(item => item === permission ? event.target.checked : current.selected.includes(item)) }))} />
          <span><strong>{lang === "es" ? copy[0] : copy[1]}</strong><span>{lang === "es" ? copy[2] : copy[3]}</span></span>
        </label>;
      })}</div>
    </fieldset>
    {stale && <Message>{t("Los permisos guardados han cambiado. Restablece el formulario antes de guardar.", "Saved permissions have changed. Reset the form before saving.")}</Message>}
    <div className="people-save"><span role="status">{dirty ? t("Cambios sin guardar", "Unsaved changes") : t("Sin cambios pendientes", "No pending changes")}</span><div className="inline-actions">
      <button className="button button-secondary" type="button" disabled={busy || (!dirty && !stale)} onClick={() => setDraft({ baseline: saved, selected: saved })}>{t("Restablecer", "Reset")}</button>
      <button className="button button-primary" disabled={busy || !dirty || stale}>{t("Guardar permisos", "Save permissions")}</button>
    </div></div>
  </form>;
}

export function AccountPanel({ data, command, busy, viewerId }: { data: Dataset; command: Command; busy: boolean; viewerId: string }) {
  const { t, lang } = useUI();
  const [search, setSearch] = useState(""); const [filter, setFilter] = useState<Role | "all">("all"); const [selectedId, setSelectedId] = useState("");
  const [permissionDirty, setPermissionDirty] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (selectedId) { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "nearest" }); } }, [selectedId]);
  const people = filterAccounts(data, search, filter);
  const selected = data.profiles?.find(person => person.id === selectedId);
  const roles = selected ? accountRoles(data, selected) : [];
  const kind = accountManagementKind(roles);
  const canLeave = () => !permissionDirty || window.confirm(t("Hay cambios de permisos sin guardar. ¿Quieres descartarlos?", "Permission changes have not been saved. Discard them?"));
  function select(id: string) { if (id !== selectedId && canLeave()) { setSelectedId(id); setPermissionDirty(false); } }
  return <><div className="people-layout">
    <section className="work-section" aria-label={t("Directorio de personas", "People directory")}>
      <div className="people-filters"><label>{t("Buscar persona", "Find a person")}<div className="search-input"><Icon name="search" /><input value={search} disabled={busy} onChange={event => { if (canLeave()) { setSearch(event.target.value); setSelectedId(""); setPermissionDirty(false); } }} placeholder={t("Nombre o documento", "Name or document")} /></div></label>
        <label>{t("Filtrar por rol", "Filter by role")}<select value={filter} disabled={busy} onChange={event => { if (canLeave()) { setFilter(event.target.value as Role | "all"); setSelectedId(""); setPermissionDirty(false); } }}><option value="all">{t("Todas las personas", "All people")}</option>{accountRoleOrder.map(role => <option key={role} value={role}>{roleNames[role][lang]}</option>)}</select></label>
      </div>
      <p className="people-count" role="status">{people.length} {people.length === 1 ? t("persona encontrada", "person found") : t("personas encontradas", "people found")}</p>
      {people.length ? <div className="table-wrap" role="region" aria-label={t("Personas y roles", "People and roles")}><table><thead><tr><th>{t("Persona", "Person")}</th><th>{t("Rol", "Role")}</th><th>{t("Estado", "State")}</th><th><span className="sr-only">{t("Acciones", "Actions")}</span></th></tr></thead><tbody>{people.map(person => <tr key={person.id} aria-selected={person.id === selectedId}>
        <td><strong>{str(person, "full_name")}</strong>{person.document_number ? <p>{str(person, "document_number")}</p> : null}</td>
        <td><div className="people-roles">{accountRoles(data, person).map(role => <span className="badge" key={role}>{roleNames[role][lang]}</span>)}{!accountRoles(data, person).length && t("Rol no disponible", "Role unavailable")}</div></td>
        <td><span className={`badge ${person.state === "suspended" ? "badge-warning" : ""}`}>{person.state === "active" ? t("Activa", "Active") : person.state === "suspended" ? t("Suspendida", "Suspended") : person.state === "deleting" ? t("Baja en curso", "Removal in progress") : t("Archivada", "Archived")}</span></td>
        <td><button id={`manage-${person.id}`} className="button button-secondary" aria-pressed={person.id === selectedId} disabled={busy} onClick={() => select(person.id)}>{t("Gestionar", "Manage")}</button></td>
      </tr>)}</tbody></table></div> : <Empty title={t("No hay coincidencias", "No matches")} description={t("Prueba otro nombre o selecciona otro rol.", "Try another name or choose a different role.")} />}
    </section>
    {selected ? <section className="work-section people-management" aria-label={t("Gestionar persona seleccionada", "Manage selected person")}>
      <div className="people-heading"><div><h2 ref={heading} tabIndex={-1}>{str(selected, "full_name")}</h2><p>{roles.map(role => roleNames[role][lang]).join(" · ") || t("Rol no disponible", "Role unavailable")}</p></div><button className="button button-secondary" disabled={busy} onClick={() => { if (canLeave()) { const id = selectedId; setSelectedId(""); setPermissionDirty(false); window.setTimeout(() => document.getElementById(`manage-${id}`)?.focus(), 0); } }}>{t("Cerrar gestión", "Close management")}</button></div>
      <div className="people-account-state"><h3>{t("Acceso a la cuenta", "Account access")}</h3><form className="people-state-form" key={`${selected.id}-${selected.state}`} onSubmit={async event => { event.preventDefault(); const state = new FormData(event.currentTarget).get("state"); try { await command("manage_account", { p_user: selected.id, p_state: String(state) }); } catch { /* Error visible en el contenedor. */ } }}>
        <label>{t("Estado de la cuenta", "Account state")}<select name="state" defaultValue={str(selected, "state")} disabled={busy || selected.id === viewerId || selected.state === "deleting"}><option value="active">{t("Activa", "Active")}</option><option value="suspended">{t("Suspendida", "Suspended")}</option><option value="archived">{t("Archivada", "Archived")}</option>{selected.state === "deleting" && <option value="deleting">{t("Baja en curso", "Removal in progress")}</option>}</select></label>
        <button className="button button-secondary" disabled={busy || selected.id === viewerId || selected.state === "deleting"}>{t("Guardar estado", "Save state")}</button>
      </form><p className="people-description">{selected.id === viewerId ? t("Esta es tu cuenta. Sus cambios de acceso requieren otro administrador.", "This is your account. Another administrator must change its access.") : t("Suspender o archivar conserva el historial académico. Archivar es una baja reversible.", "Suspending or archiving preserves academic history. Archiving is reversible.")}</p></div>
      {kind === "academic" && (data.user_permissions || Array.isArray(selected.permissions) ? <PermissionEditor key={selected.id} person={selected} data={data} command={command} busy={busy || selected.state === "deleting"} onDirty={setPermissionDirty} onSaved={() => heading.current?.focus()} /> : <Message error>{t("No se pudieron cargar los permisos. Actualiza la información antes de editarlos.", "Permissions could not be loaded. Refresh the information before editing.")}</Message>)}
      {kind === "student" && <Message>{t("Este perfil accede a sus materias, entregas y notas. La gestión de permisos del personal corresponde a otros perfiles.", "This profile accesses its own courses, submissions and grades. Staff permissions belong to other profiles.")}</Message>}
      {kind === "teacher" && <div className="people-capabilities"><h3>{t("Funciones docentes", "Teaching functions")}</h3><p>{t("Sus funciones se limitan a las materias y grupos asignados.", "Functions are limited to assigned subjects and groups.")}</p><ul><li>{t("Publicar tareas y consultar sus grupos.", "Publish assignments and view assigned groups.")}</li><li>{t("Revisar entregas, comentar y calificar.", "Review submissions, comment and grade.")}</li><li>{t("Autorizar reemplazos de entregas.", "Authorize submission replacements.")}</li></ul></div>}
      {kind === "system" && <Message>{t("Este perfil administra cuentas y actividad. Los permisos académicos corresponden al administrativo académico.", "This profile manages accounts and activity. Academic permissions belong to academic administrators.")}</Message>}
      {kind === "unknown" && <Message error>{t("No se pudo identificar el rol. Actualiza la información antes de gestionar funciones.", "The role could not be identified. Refresh the information before managing functions.")}</Message>}
      {["academic", "teacher", "system"].includes(kind) && <details className="people-staff-roles"><summary>{t("Roles del personal", "Staff roles")}</summary><p className="people-description">{t("Cada cambio de rol solicita verificación y se aplica individualmente.", "Each role change requires verification and is applied individually.")}</p><fieldset disabled={busy || selected.id === viewerId || permissionDirty || selected.state === "deleting"}><legend className="sr-only">{t("Roles del personal", "Staff roles")}</legend>{accountRoleOrder.filter(role => role !== "student").map(role => <label className="checkbox-label" key={role}><input type="checkbox" checked={roles.includes(role)} onChange={async event => { const enabled = event.target.checked; if (!canLeave()) return; try { await command("set_role", { p_user: selected.id, p_role: role, p_enabled: enabled }); } catch { /* Contenedor. */ } }} />{roleNames[role][lang]}</label>)}</fieldset>{selected.id === viewerId && <p className="people-description">{t("Otro administrador debe cambiar tus roles.", "Another administrator must change your roles.")}</p>}</details>}
    </section> : <section className="work-section"><Empty title={t("Selecciona una persona", "Select a person")} description={t("Verás las opciones que corresponden a su rol.", "You will see the options that match their role.")} /></section>}</div>
    <section className="detail-panel form-panel work-section"><h2>{t("Invitar a una persona", "Invite someone")}</h2><p>{t("Recibirá un enlace para crear su contraseña y acceder a su perfil.", "They will receive a link to create a password and access their profile.")}</p><form onSubmit={async event => { event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form); try { await command("invite", Object.fromEntries(fields)); form.reset(); } catch { /* Se conserva el formulario. */ } }}>
      <div className="form-two"><label>{t("Nombre completo", "Full name")}<input name="full_name" required maxLength={200} /></label><label>{t("Correo electrónico", "Email address")}<input name="email" type="email" required maxLength={254} /></label></div><label>{t("Rol de la cuenta nueva", "New account role")}<select name="role">{accountRoleOrder.map(role => <option key={role} value={role}>{roleNames[role][lang]}</option>)}</select></label><button className="button button-primary" disabled={busy}>{t("Iniciar invitación", "Start invitation")}</button>
    </form></section>
  </>;
}
