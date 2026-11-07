import { URL } from "node:url";

export async function probeSupabaseAuth({
  projectUrl,
  publishableKey,
  request = globalThis.fetch,
}) {
  if (!projectUrl?.trim() || !publishableKey?.trim()) {
    return {
      ok: false,
      code: "MISSING_CONFIG",
      message: "Completa la URL y la clave Publishable en .env.local y guarda el archivo.",
    };
  }

  let url;
  try {
    url = new URL(projectUrl.trim());
  } catch {
    return invalidUrl();
  }

  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9]{20}\.supabase\.co$/.test(url.hostname) ||
    url.username || url.password || url.port ||
    url.pathname !== "/" || url.search || url.hash
  ) {
    return invalidUrl();
  }

  const key = publishableKey.trim();
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    return {
      ok: false,
      code: "INVALID_KEY_TYPE",
      message: "Usa la clave Publishable que empieza por sb_publishable_. Revisa Settings > API Keys.",
    };
  }

  try {
    const response = await request(new URL("/auth/v1/settings", url), {
      method: "GET",
      headers: { apikey: key, Accept: "application/json" },
      redirect: "error",
      signal: globalThis.AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return {
        ok: false,
        code: "HTTP_ERROR",
        message: `Supabase respondió HTTP ${response.status}. Revisa la URL, la clave y el estado del proyecto.`,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.split(";")[0].trim().toLowerCase() !== "application/json") {
      return unexpectedResponse();
    }

    const settings = await response.json();
    if (typeof settings?.disable_signup !== "boolean") {
      return unexpectedResponse();
    }

    if (!settings.disable_signup) {
      return {
        ok: false,
        code: "PUBLIC_SIGNUP_ENABLED",
        message: "Auth responde. Desactiva Allow new users to sign up en Authentication para conservar el alta solo por personal autorizado.",
      };
    }

    return {
      ok: true,
      code: "AUTH_READY",
      message: "Auth responde y el registro público está desactivado. Faltan las pruebas de datos, archivos y correo.",
    };
  } catch {
    return {
      ok: false,
      code: "REQUEST_FAILED",
      message: "No se pudo completar la comprobación de Auth. Revisa conexión y estado del proyecto y vuelve a intentarlo.",
    };
  }
}

function invalidUrl() {
  return {
    ok: false,
    code: "INVALID_URL",
    message: "Usa la URL HTTPS del proyecto terminada en .supabase.co, sin rutas, parámetros ni credenciales.",
  };
}

function unexpectedResponse() {
  return {
    ok: false,
    code: "UNEXPECTED_RESPONSE",
    message: "La respuesta no permite comprobar la configuración de Auth. Revisa la URL y el servicio.",
  };
}
