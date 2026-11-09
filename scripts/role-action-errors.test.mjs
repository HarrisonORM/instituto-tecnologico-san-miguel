import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import process from "node:process";
import { URL } from "node:url";
import { Buffer } from "node:buffer";
import ts from "typescript";
function moduleUrl(source) { return `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`; }
const backend = moduleUrl(await fs.readFile(new URL("../src/server/backend.ts", import.meta.url), "utf8"));
const source = (await fs.readFile(new URL("../src/app/api/backend/[resource]/route.ts", import.meta.url), "utf8")).replace('from "@/server/backend"', `from ${JSON.stringify(backend)}`);
const { POST } = await import(moduleUrl(source));
async function fixture(action) {
  const previousFetch = globalThis.fetch;
  const keys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abcdefghijklmnopqrst.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_synthetic";
  const requests = [];
  globalThis.fetch = async url => {
    const target = new URL(url); requests.push(target);
    if (target.pathname === "/auth/v1/user") return globalThis.Response.json({ id: "local" });
    if (target.pathname === "/rest/v1/profiles") return globalThis.Response.json([{ id: "local", state: "active" }]);
    if (target.pathname === "/rest/v1/rpc/assign_account_role") return globalThis.Response.json({ code: "PGRST202", message: "synthetic missing RPC" }, { status: 404 });
    return globalThis.Response.json([]);
  };
  try { await action(requests); }
  finally {
    globalThis.fetch = previousFetch;
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
}
function roleRequest(expected) {
  return new globalThis.Request("http://local.invalid/api/backend/assign_account_role", { method: "POST", headers: { Authorization: "Bearer synthetic", "Content-Type": "application/json" }, body: JSON.stringify({ p_user: "target", p_role: "teacher", p_expected: expected }) });
}
const context = { params: Promise.resolve({ resource: "assign_account_role" }) };
test("un conflicto antiguo se explica sin llamar a la escritura de rol", () => fixture(async requests => {
  const response = await POST(roleRequest(["student", "teacher"]), context);
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /roles duplicados/);
  assert.equal(requests.some(url => url.pathname === "/rest/v1/rpc/assign_account_role"), false);
}));
test("la funcion ausente informa actualizacion pendiente, no un codigo incorrecto", () => fixture(async requests => {
  const response = await POST(roleRequest(["student"]), context);
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /actualización de la plataforma/);
  assert.equal(requests.filter(url => url.pathname === "/rest/v1/rpc/assign_account_role").length, 1);
}));
