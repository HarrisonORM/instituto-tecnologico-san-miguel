type LinkType = "invite" | "recovery" | "email";
type ConfirmationLink = { mode: "token"; hash: string; type: LinkType } | { mode: "session"; access: string; refresh: string } | { mode: "invalid"; expired: boolean };

// Solo interpreta datos; no verifica ni consume el enlace al abrir la página.
export function readConfirmationLink(search: string, hash: string): ConfirmationLink {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const error = fragment.get("error_code") ?? query.get("error_code");
  if (error || fragment.has("error") || query.has("error")) return { mode: "invalid", expired: error === "otp_expired" };
  for (const params of [fragment, query]) {
    const token = params.get("token_hash"); const type = params.get("type");
    if (token && token.length <= 4096 && (type === "invite" || type === "recovery" || type === "email")) return { mode: "token", hash: token, type };
  }
  const access = fragment.get("access_token"); const refresh = fragment.get("refresh_token");
  if (access && refresh && access.length <= 8192 && refresh.length <= 8192) return { mode: "session", access, refresh };
  return { mode: "invalid", expired: false };
}
