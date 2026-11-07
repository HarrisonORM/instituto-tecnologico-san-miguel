import assert from "node:assert/strict";
import test from "node:test";
import { probeSupabaseAuth } from "./lib/supabase-probe.mjs";

const projectUrl = "https://abcdefghijklmnopqrst.supabase.co";
const publishableKey = "sb_publishable_clave_ficticia_para_pruebas";

test("no consulta la red cuando falta configuración", async () => {
  let calls = 0;
  const result = await probeSupabaseAuth({
    projectUrl,
    publishableKey: "",
    request: async () => { calls++; },
  });
  assert.equal(result.code, "MISSING_CONFIG");
  assert.equal(calls, 0);
});

test("rechaza destinos ajenos, HTTP y URL con credenciales o parámetros", async () => {
  const urls = [
    "https://supabase.com/dashboard",
    projectUrl.replace("https:", "http:"),
    projectUrl.replace("https://", "https://usuario:clave@"),
    `${projectUrl}/otra-ruta`,
    `${projectUrl}?dato=privado`,
    `${projectUrl}#fragmento`,
    `${projectUrl}:8443`,
  ];
  let calls = 0;
  for (const url of urls) {
    const result = await probeSupabaseAuth({
      projectUrl: url,
      publishableKey,
      request: async () => { calls++; },
    });
    assert.equal(result.code, "INVALID_URL");
  }
  assert.equal(calls, 0);
});

test("rechaza claves privilegiadas, heredadas o mal formadas sin mostrarlas", async () => {
  let calls = 0;
  for (const key of ["sb_secret_privilegiada", "eyJ.clave.heredada", `${publishableKey}\nsalto`]) {
    const result = await probeSupabaseAuth({
      projectUrl,
      publishableKey: key,
      request: async () => { calls++; },
    });
    assert.equal(result.code, "INVALID_KEY_TYPE");
    assert.equal(JSON.stringify(result).includes(key), false);
  }
  assert.equal(calls, 0);
});

test("consulta Auth por GET con apikey, sin seguir redirecciones ni mostrar la clave", async () => {
  let calls = 0;
  const result = await probeSupabaseAuth({
    projectUrl,
    publishableKey,
    request: async (url, options) => {
      calls++;
      assert.equal(url.href, `${projectUrl}/auth/v1/settings`);
      assert.equal(options.method, "GET");
      assert.equal(options.headers.apikey, publishableKey);
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(options.redirect, "error");
      assert.ok(options.signal instanceof globalThis.AbortSignal);
      return globalThis.Response.json({ disable_signup: true });
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(result).includes(publishableKey), false);
});

test("el registro público habilitado impide dar la comprobación por superada", async () => {
  const result = await probeSupabaseAuth({
    projectUrl,
    publishableKey,
    request: async () => globalThis.Response.json({ disable_signup: false }),
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "PUBLIC_SIGNUP_ENABLED");
});

test("un error HTTP no expone el cuerpo de respuesta", async () => {
  const result = await probeSupabaseAuth({
    projectUrl,
    publishableKey,
    request: async () => new globalThis.Response(`dato privado ${publishableKey}`, { status: 401 }),
  });
  assert.equal(result.code, "HTTP_ERROR");
  assert.equal(JSON.stringify(result).includes(publishableKey), false);
  assert.equal(JSON.stringify(result).includes("dato privado"), false);
});

test("una respuesta sin la configuración esperada no acredita conexión correcta", async () => {
  for (const payload of [null, {}, { disable_signup: "true" }]) {
    const result = await probeSupabaseAuth({
      projectUrl,
      publishableKey,
      request: async () => globalThis.Response.json(payload),
    });
    assert.equal(result.ok, false);
    assert.equal(result.code, "UNEXPECTED_RESPONSE");
  }
});

test("rechaza una respuesta que no es JSON", async () => {
  const result = await probeSupabaseAuth({
    projectUrl,
    publishableKey,
    request: async () => new globalThis.Response("<html>Error</html>"),
  });
  assert.equal(result.code, "UNEXPECTED_RESPONSE");
});

test("los errores de conexión no imprimen información de la petición", async () => {
  const result = await probeSupabaseAuth({
    projectUrl,
    publishableKey,
    request: async () => { throw new Error(`error de red con ${publishableKey}`); },
  });
  assert.equal(result.code, "REQUEST_FAILED");
  assert.equal(JSON.stringify(result).includes(publishableKey), false);
});
