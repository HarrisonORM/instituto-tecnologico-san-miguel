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

function RoleEditor({ person, roles, command, busy, onDirty, onSaved }: { person: Row; roles: Role[]; command: Command; busy: boolean; onDirty: (value: boolean) => void; onSaved: () => void }) {
  const { t, lang } = useUI();
  const [chosen, setChosen] = useState(roles.length === 1 ? roles[0] : "");
  const dirty = Boolean(chosen) && (roles.length !== 1 || chosen !== roles[0]);
  useEffect(() => { onDirty(dirty); return () => onDirty(false); }, [dirty, onDirty]);
  return <section className="people-section" aria-label={t("Rol de la cuenta", "Account role")}>
    <h3>{t("Rol de la cuenta", "Account role")}</h3>
    <p className="people-description">{t("Cada persona tiene un único rol. Al cambiarlo, se sustituye el anterior y se conserva el historial.", "Each person has one role. Changing it replaces the previous role and preserves history.")}</p>
    {roles.length > 1 && <Message error>{t("Esta cuenta tiene más de un rol. Selecciona cuál debe conservar.", "This account has more than one role. Select which one to keep.")}</Message>}
    <form className="people-state-form" onSubmit={async event => { event.preventDefault(); if (!dirty) return; try { await command("assign_account_role", { p_user: person.id, p_role: chosen, p_expected: roles }); onSaved(); } catch { /* Conservar elección y mostrar error en el contenedor. */ } }}>
      <label>{t("Rol único", "Single role")}<select value={chosen} required disabled={busy} onChange={event => setChosen(event.target.value as Role)}><option value="" disabled>{t("Selecciona un rol", "Select a role")}</option>{accountRoleOrder.map(role => <option value={role} key={role}>{roleNames[role][lang]}</option>)}</select></label>
      <button className="button button-secondary" disabled={busy || !dirty}>{t("Guardar rol", "Save role")}</button>
    </form>
    {dirty && roles.includes("academic_admin") && chosen !== "academic_admin" && <Message>{t("Al retirar el rol académico también se retirarán sus permisos específicos.", "Removing the academic role also removes its specific permissions.")}</Message>}
  </section>;
}

export function AccountPanel({ data, command, busy, viewerId }: { data: Dataset; command: Command; busy: boolean; viewerId: string }) {
  const { t, lang } = useUI();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Role | "all">("all");
  const [selectedId, setSelectedId] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [permissionDirty, setPermissionDirty] = useState(false);
  const [roleDirty, setRoleDirty] = useState(false);
  const [inviteDirty, setInviteDirty] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const directoryHeading = useRef<HTMLHeadingElement>(null);
  const directoryScroll = useRef(0);
  const returnTarget = useRef("");
  useEffect(() => { if (selectedId || inviteOpen) heading.current?.focus(); }, [selectedId, inviteOpen]);
  const people = filterAccounts(data, search, filter);
  const selected = data.profiles?.find(person => person.id === selectedId);
  const roles = selected ? accountRoles(data, selected) : [];
  const kind = accountManagementKind(roles);
  const canLeave = () => !(permissionDirty || roleDirty || inviteDirty) || window.confirm(t("Hay cambios sin guardar. ¿Quieres descartarlos?", "Changes have not been saved. Discard them?"));
  function openPerson(id: string) { directoryScroll.current = window.scrollY; returnTarget.current = `manage-${id}`; setSelectedId(id); }
  function back() {
    if (!canLeave()) return;
    setSelectedId(""); setInviteOpen(false); setPermissionDirty(false); setRoleDirty(false); setInviteDirty(false);
    window.setTimeout(() => { (document.getElementById(returnTarget.current) ?? directoryHeading.current)?.focus({ preventScroll: true }); window.scrollTo({ top: directoryScroll.current, behavior: "instant" }); }, 0);
  }
  const stateLabel = (person: Row) => person.state === "active" ? t("Activa", "Active") : person.state === "suspended" ? t("Suspendida", "Suspended") : person.state === "deleting" ? t("Baja en curso", "Removal in progress") : t("Archivada", "Archived");
  return <div className="people-workspace">
    <section className="people-directory" hidden={Boolean(selectedId) || inviteOpen} aria-label={t("Directorio de personas", "People directory")}>
      <div className="people-toolbar"><div><h2 ref={directoryHeading} tabIndex={-1}>{t("Personas del instituto", "Institute people")}</h2><p className="people-description">{t("Busca una persona para consultar su cuenta y gestionar su acceso.", "Find someone to view their account and manage access.")}</p></div><button id="people-invite" className="button button-primary" disabled={busy} onClick={() => { directoryScroll.current = window.scrollY; returnTarget.current = "people-invite"; setInviteOpen(true); }}>{t("Invitar persona", "Invite someone")}</button></div>
      <div className="people-filters"><label>{t("Buscar persona", "Find a person")}<div className="search-input"><Icon name="search" /><input value={search} disabled={busy} onChange={event => setSearch(event.target.value)} placeholder={t("Nombre o documento", "Name or document")} /></div></label><label>{t("Filtrar por rol", "Filter by role")}<select value={filter} disabled={busy} onChange={event => setFilter(event.target.value as Role | "all")}><option value="all">{t("Todas las personas", "All people")}</option>{accountRoleOrder.map(role => <option value={role} key={role}>{roleNames[role][lang]}</option>)}</select></label></div>
      <p className="people-count" role="status">{people.length} {people.length === 1 ? t("persona encontrada", "person found") : t("personas encontradas", "people found")}</p>
      {people.length ? <div className="table-wrap" role="region" aria-label={t("Personas y roles", "People and roles")} tabIndex={0}><table><thead><tr><th scope="col">{t("Persona", "Person")}</th><th scope="col">{t("Rol", "Role")}</th><th scope="col">{t("Estado", "State")}</th><th scope="col">{t("Acciones", "Actions")}</th></tr></thead><tbody>{people.map(person => {
        const assigned = accountRoles(data, person);
        return <tr key={person.id}><td><strong>{str(person, "full_name")}</strong>{Boolean(person.document_number) && <p>{str(person, "document_number")}</p>}</td><td>{assigned.length === 1 ? roleNames[assigned[0]][lang] : <span className="badge badge-warning">{assigned.length > 1 ? t("Revisar rol", "Review role") : t("Rol no disponible", "Role unavailable")}</span>}</td><td><span className={`badge ${person.state === "suspended" ? "badge-warning" : ""}`}>{stateLabel(person)}</span></td><td><button id={`manage-${person.id}`} className="button button-secondary" disabled={busy} onClick={() => openPerson(person.id)}>{t("Gestionar", "Manage")}</button></td></tr>;
      })}</tbody></table></div> : <Empty title={t("No hay coincidencias", "No matches")} description={t("Prueba otro nombre o selecciona otro rol.", "Try another name or choose a different role.")} />}
    </section>
    {(Boolean(selectedId) || inviteOpen) && <button className="text-link people-back" disabled={busy} onClick={back}><Icon name="arrow" />{t("Volver a personas", "Back to people")}</button>}
    {selected && !inviteOpen && <section className="people-management" aria-label={t("Gestionar persona seleccionada", "Manage selected person")}>
      <header className="people-heading"><h2 ref={heading} tabIndex={-1}>{str(selected, "full_name")}</h2><div className="people-meta"><span>{roles.length === 1 ? roleNames[roles[0]][lang] : t("Rol pendiente de corregir", "Role needs correction")}</span><span className="badge">{stateLabel(selected)}</span></div></header>
      <section className="people-section"><h3>{t("Acceso a la cuenta", "Account access")}</h3><p className="people-description">{selected.id === viewerId ? t("Esta es tu cuenta. Sus cambios de acceso requieren otro administrador.", "This is your account. Another administrator must change its access.") : t("Suspender o archivar conserva el historial académico. Archivar es una baja reversible.", "Suspending or archiving preserves academic history. Archiving is reversible.")}</p><form className="people-state-form" key={`${selected.id}-${selected.state}`} onSubmit={async event => { event.preventDefault(); const state = new FormData(event.currentTarget).get("state"); try { await command("manage_account", { p_user: selected.id, p_state: String(state) }); heading.current?.focus(); } catch { /* Error en el contenedor. */ } }}><label>{t("Estado de la cuenta", "Account state")}<select name="state" defaultValue={str(selected, "state")} disabled={busy || selected.id === viewerId || selected.state === "deleting"}><option value="active">{t("Activa", "Active")}</option><option value="suspended">{t("Suspendida", "Suspended")}</option><option value="archived">{t("Archivada", "Archived")}</option>{selected.state === "deleting" && <option value="deleting">{t("Baja en curso", "Removal in progress")}</option>}</select></label><button className="button button-secondary" disabled={busy || selected.id === viewerId || selected.state === "deleting"}>{t("Guardar estado", "Save state")}</button></form></section>
      {kind === "academic" && <section className="people-section">{data.user_permissions || Array.isArray(selected.permissions) ? <PermissionEditor key={selected.id} person={selected} data={data} command={command} busy={busy || roleDirty || selected.state === "deleting"} onDirty={setPermissionDirty} onSaved={() => heading.current?.focus()} /> : <Message error>{t("No se pudieron cargar los permisos. Actualiza la información antes de editarlos.", "Permissions could not be loaded. Refresh before editing.")}</Message>}</section>}
      {kind === "student" && <section className="people-section"><h3>{t("Funciones del estudiante", "Student functions")}</h3><p className="people-description">{t("Accede a sus materias, entregas y notas. Los permisos de gestión académica corresponden al personal autorizado.", "Accesses their own courses, submissions and grades. Academic management permissions belong to authorized staff.")}</p></section>}
      {kind === "teacher" && <section className="people-section"><h3>{t("Funciones docentes", "Teaching functions")}</h3><p className="people-description">{t("Sus funciones se limitan a las materias y grupos asignados.", "Functions are limited to assigned subjects and groups.")}</p><ul className="people-capabilities"><li>{t("Publicar tareas y consultar sus grupos.", "Publish assignments and view assigned groups.")}</li><li>{t("Revisar entregas, comentar y calificar.", "Review submissions, comment and grade.")}</li><li>{t("Autorizar reemplazos de entregas.", "Authorize submission replacements.")}</li></ul></section>}
      {kind === "system" && <section className="people-section"><h3>{t("Funciones de administración", "Administration functions")}</h3><p className="people-description">{t("Administra cuentas y actividad. Este rol no concede permisos académicos ni acceso a las calificaciones.", "Manages accounts and activity. This role does not grant academic permissions or access to grades.")}</p></section>}
      {["academic", "teacher", "system", "conflict"].includes(kind) && <RoleEditor key={`${selected.id}-${roles.join(",")}`} person={selected} roles={roles} command={command} busy={busy || permissionDirty || selected.id === viewerId || selected.state === "deleting"} onDirty={setRoleDirty} onSaved={() => heading.current?.focus()} />}
      {kind === "unknown" && <Message error>{t("No se pudo identificar el rol. Actualiza la información antes de gestionar funciones.", "The role could not be identified. Refresh before managing functions.")}</Message>}
    </section>}
    {inviteOpen && <section className="people-invitation"><header className="people-heading"><h2 ref={heading} tabIndex={-1}>{t("Invitar a una persona", "Invite someone")}</h2><p className="people-description">{t("Recibirá un enlace para crear su contraseña y acceder a su perfil.", "They will receive a link to create a password and access their profile.")}</p></header><form onChange={() => setInviteDirty(true)} onSubmit={async event => { event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form); try { await command("invite", Object.fromEntries(fields)); form.reset(); setInviteDirty(false); heading.current?.focus(); } catch { /* Se conserva el formulario. */ } }}><div className="form-two"><label>{t("Nombre completo", "Full name")}<input name="full_name" required maxLength={200} /></label><label>{t("Correo electrónico", "Email address")}<input name="email" type="email" required maxLength={254} /></label></div><label>{t("Rol de la cuenta nueva", "New account role")}<select name="role">{accountRoleOrder.map(role => <option key={role} value={role}>{roleNames[role][lang]}</option>)}</select></label><div><button className="button button-primary" disabled={busy}>{t("Iniciar invitación", "Start invitation")}</button></div></form></section>}
  </div>;
}
