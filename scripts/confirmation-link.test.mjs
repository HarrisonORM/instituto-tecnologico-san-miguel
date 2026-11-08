import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import { URL } from "node:url";
import { Buffer } from "node:buffer";
import ts from "typescript";

const source = await fs.readFile(new URL("../src/lib/confirmation-link.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { readConfirmationLink } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("la invitación nueva interpreta el hash en el fragmento que no se transmite al servidor", () => {
  const url = new URL("https://campus.example.invalid/auth/confirmar#token_hash=synthetic-hash&type=invite");
  assert.equal(url.search, "");
  assert.deepEqual(readConfirmationLink(url.search, url.hash), { mode: "token", hash: "synthetic-hash", type: "invite" });
});
test("conserva compatibilidad con hash en query y sesión de la plantilla estándar", () => {
  assert.deepEqual(readConfirmationLink("?token_hash=synthetic&type=recovery", ""), { mode: "token", hash: "synthetic", type: "recovery" });
  assert.deepEqual(readConfirmationLink("", "#access_token=synthetic-access&refresh_token=synthetic-refresh&type=invite"), { mode: "session", access: "synthetic-access", refresh: "synthetic-refresh" });
});
test("no mezcla un token parcial de query con un tipo de fragmento", () => {
  assert.equal(readConfirmationLink("?token_hash=synthetic", "#type=invite").mode, "invalid");
});
test("rechaza tipos desconocidos, datos incompletos y límites de tamaño", () => {
  for (const [query, fragment] of [["", ""], ["?token_hash=synthetic&type=admin", ""], ["", "#access_token=synthetic"], ["", `#token_hash=${"x".repeat(4097)}&type=invite`], ["", `#access_token=${"x".repeat(8193)}&refresh_token=synthetic`]]) assert.equal(readConfirmationLink(query, fragment).mode, "invalid");
});
test("un error de Auth tiene precedencia y no muestra su descripción privada", () => {
  const result = readConfirmationLink("?token_hash=synthetic&type=invite", "#error=access_denied&error_code=otp_expired&error_description=synthetic-private");
  assert.deepEqual(result, { mode: "invalid", expired: true });
  assert.equal(JSON.stringify(result).includes("synthetic-private"), false);
});
