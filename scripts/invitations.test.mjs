import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import process from "node:process";
import { Buffer } from "node:buffer";
import { URL } from "node:url";
import ts from "typescript";

// Ejecuta la ruta y el transporte reales con fetch simulado. Nunca lee .env.local.
function moduleUrl(source) {
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return `data:text/javascript;base64,${Buffer.from(result.outputText).toString("base64")}`;
}
const backend = moduleUrl(await fs.readFile(new URL("../src/server/backend.ts", import.meta.url), "utf8"));
const source = (await fs.readFile(new URL("../src/app/api/admin/invitations/route.ts", import.meta.url), "utf8")).replace('from "@/server/backend"', `from ${JSON.stringify(backend)}`);
const { POST } = await import(moduleUrl(source));
const requestKey = "11111111-1111-4111-a111-111111111111";

async function fixture(run, { permitted = true, state = "active", complete = false } = {}) {
  const previousFetch = globalThis.fetch;
  const values = { NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic", SUPABASE_SECRET_KEY: "sb_secret_synthetic", INSTITUTION_EMAIL_DOMAIN: "old-setting.invalid" };
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  Object.assign(process.env, values);
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ path, body });
    if (path === "/auth/v1/user") return globalThis.Response.json({ id: "local-admin" });
    if (path === "/rest/v1/profiles") return globalThis.Response.json([{ id: "local-admin", state }]);
    if (path.endsWith("require_account_admin") && !permitted) return globalThis.Response.json({ code: "42501" }, { status: 403 });
    if (path.endsWith("prepare_invitation")) return globalThis.Response.json({ status: complete ? "complete" : "dispatching", auth_user_id: complete ? "local-invited" : null });
    if (path === "/auth/v1/invite") return globalThis.Response.json({ id: "local-invited" });
    return globalThis.Response.json(null);
  };
  const invoke = (email, options = {}) => POST(new globalThis.Request("http://local.invalid/api/admin/invitations", {
    method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": requestKey, ...(options.auth === false ? {} : { Authorization: "Bearer synthetic-session" }) },
    body: JSON.stringify({ email, full_name: "Persona de prueba", role: options.role ?? "student" }),
  }));
  try { await run(invoke, calls); }
  finally {
    globalThis.fetch = previousFetch;
    for (const key of Object.keys(values)) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
}

test("acepta Gmail sin dominio propio e ignora la antigua restricción configurada", () => fixture(async (invoke, calls) => {
  const response = await invoke("  Persona+prueba@gmail.com  ");
  assert.equal(response.status, 200);
  assert.equal(calls.find(call => call.path === "/auth/v1/invite").body.email, "persona+prueba@gmail.com");
  assert.ok(calls.findIndex(call => call.path.endsWith("require_account_admin")) < calls.findIndex(call => call.path === "/auth/v1/invite"));
}));
test("acepta Outlook aunque no exista la antigua variable de dominio", () => fixture(async (invoke, calls) => {
  delete process.env.INSTITUTION_EMAIL_DOMAIN;
  assert.equal((await invoke("persona@outlook.com")).status, 200);
  assert.equal(calls.filter(call => call.path === "/auth/v1/invite").length, 1);
}));
test("rechaza correos mal formados antes de registrar o enviar una invitación", () => fixture(async (invoke, calls) => {
  for (const email of ["sin-arroba", "persona@", "@gmail.com", "persona@@gmail.com", "persona@gmail", "persona @gmail.com", "persona@gmail.com\r\nBcc:otro@example.invalid"]) assert.equal((await invoke(email)).status, 400);
  assert.equal(calls.some(call => call.path.endsWith("prepare_invitation") || call.path === "/auth/v1/invite"), false);
}));
test("una petición sin sesión nunca alcanza Auth ni envía correo", () => fixture(async (invoke, calls) => {
  assert.equal((await invoke("persona@gmail.com", { auth: false })).status, 401);
  assert.equal(calls.length, 0);
}));
test("sin administrador y MFA válidos no se prepara ni envía una invitación", () => fixture(async (invoke, calls) => {
  assert.equal((await invoke("persona@gmail.com")).status, 403);
  assert.equal(calls.some(call => call.path.endsWith("prepare_invitation") || call.path === "/auth/v1/invite"), false);
}, { permitted: false }));
test("una cuenta suspendida no puede invitar", () => fixture(async (invoke, calls) => {
  assert.equal((await invoke("persona@gmail.com")).status, 403);
  assert.equal(calls.some(call => call.path === "/auth/v1/invite"), false);
}, { state: "suspended" }));
test("un rol no admitido no crea ni envía la invitación", () => fixture(async (invoke, calls) => {
  assert.equal((await invoke("persona@gmail.com", { role: "owner" })).status, 400);
  assert.equal(calls.some(call => call.path.endsWith("prepare_invitation") || call.path === "/auth/v1/invite"), false);
}));
test("un trabajo completado devuelve su resultado sin reenviar el correo", () => fixture(async (invoke, calls) => {
  assert.equal((await invoke("persona@gmail.com")).status, 200);
  assert.equal(calls.some(call => call.path === "/auth/v1/invite"), false);
}, { complete: true }));
