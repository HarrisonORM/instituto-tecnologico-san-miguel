import assert from "node:assert/strict";
import test from "node:test";

// Solo el servidor local de producción de este proyecto. No admite destinos
// externos, tokens ni credenciales; todas las operaciones privadas son negativas.
const base = "http://127.0.0.1:3001";
async function request(path, method = "GET", body) {
  return globalThis.fetch(`${base}${path}`, {
    method, redirect: "error", signal: globalThis.AbortSignal.timeout(15000),
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test("el proceso local responde con estado propio y sin caché", async () => {
  const response = await request("/api/health");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.deepEqual(await response.json(), { status: "ok", service: "instituto-san-miguel" });
});

test("las páginas públicas y las cuatro muestras se renderizan", async () => {
  for (const path of ["/", "/programas/software", "/programas/redes", "/acceso", "/olvide-contrasena", "/auth/confirmar", "/privacidad", "/campus", ...["student", "teacher", "academic_admin", "system_admin"].map(role => `/vista-previa?rol=${role}`)]) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(await response.text(), /Instituto Tecnológico de San Miguel/);
  }
});

test("las consultas y escrituras privadas rechazan una sesión ausente", async () => {
  for (const [path, method, body] of [
    ["/api/me", "GET"], ["/api/backend/profiles", "GET"],
    ["/api/backend/review_work", "POST", {}],
    ["/api/files/00000000-0000-0000-0000-000000000001", "GET"],
    ["/api/auth/mfa-list", "POST", {}], ["/api/auth/password", "POST", { password: "ficticia-sin-sesion" }],
  ]) {
    const response = await request(path, method, body);
    assert.equal(response.status, 401, path);
    assert.match(response.headers.get("cache-control"), /no-store/);
    const payload = await response.json();
    assert.equal(typeof payload.error, "string");
    assert.equal(payload.data, undefined);
  }
});

test("contacto rechaza datos inválidos antes de llegar al almacenamiento", async () => {
  assert.equal((await request("/api/contact", "POST", {})).status, 400);
  assert.equal((await request("/api/contact", "POST", { consent: "yes", name: "Ejemplo", email: "no-es-correo", program: "software", message: "Mensaje ficticio de prueba" })).status, 400);
});

test("las respuestas incluyen cabeceras y la salud no admite escritura", async () => {
  const response = await request("/");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal((await request("/api/health", "POST", {})).status, 405);
});
