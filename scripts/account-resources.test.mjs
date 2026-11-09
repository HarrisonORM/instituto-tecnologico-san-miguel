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
const { GET } = await import(moduleUrl(source));
test("carga roles y permisos usando sus claves compuestas, sin exigir columna id", async () => {
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
    return globalThis.Response.json([]);
  };
  try {
    for (const [resource, order] of [["user_roles", "user_id,role"], ["user_permissions", "user_id,permission"]]) {
      const response = await GET(new globalThis.Request(`http://local.invalid/api/backend/${resource}?limit=100`, { headers: { Authorization: "Bearer synthetic" } }), { params: Promise.resolve({ resource }) });
      assert.equal(response.status, 200);
      const target = requests.find(url => url.pathname === `/rest/v1/${resource}`);
      assert.equal(target.searchParams.get("order"), order);
    }
  } finally {
    globalThis.fetch = previousFetch;
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
});
