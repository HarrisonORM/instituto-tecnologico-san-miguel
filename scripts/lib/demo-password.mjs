import { createHmac } from "node:crypto";
export function demoPassword(secret, fixtureId) {
  if (typeof secret !== "string" || secret.length<16 || !/^persona-\d{2}$/.test(fixtureId)) throw new Error("Configuración ficticia no válida");
  return createHmac("sha256",secret).update(`itsm-demo-v1:${fixtureId}`).digest("base64url").slice(0,30)+"aA1!";
}
