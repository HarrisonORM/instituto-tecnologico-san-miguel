// Solo prepara archivos locales. No lee .env ni abre conexiones de red.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { createHash } from "node:crypto";
import console from "node:console";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, "supabase", "migrations");
const output = path.join(root, "work", "database-install");
const files = (await fs.readdir(source)).filter(name => /^\d{12}_[a-z_]+\.sql$/.test(name)).sort();
if (files.length !== 22 || files[0] !== "202611070001_backend.sql" || files.at(-1) !== "202611080022_people_permissions.sql") {
  throw new Error("El conjunto de migraciones cambió. Revisar la instalación antes de generar otro archivo.");
}
const manifest = [];
const bodies = [];
for (const name of files) {
  const original = await fs.readFile(path.join(source, name), "utf8");
  const lines = original.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").split("\n");
  const first = lines.findIndex(line => line.trim() && !line.trim().startsWith("--"));
  const last = lines.findLastIndex(line => line.trim() && !line.trim().startsWith("--"));
  // Quitar solo la envoltura exterior, nunca los BEGIN de las funciones PL/pgSQL.
  if (lines[first]?.trim().toLowerCase() !== "begin;" || lines[last]?.trim().toLowerCase() !== "commit;") {
    throw new Error(`Transacción exterior no reconocida en ${name}; no se genera el instalador.`);
  }
  lines[first] = "";
  lines[last] = "";
  const sha256 = createHash("sha256").update(original).digest("hex");
  manifest.push({ file: `supabase/migrations/${name}`, sha256 });
  bodies.push(`-- MIGRACION: ${name}\n-- SHA256 de origen: ${sha256}\n${lines.join("\n").trim()}\n`);
}
const preflight = `-- Instalación inicial del Instituto Tecnológico de San Miguel.
-- Destino previsto: instituto-tecnologico-san-miguel (smbtvfevndmpxpxxiorj).
-- Revisar ese proyecto en el panel antes de ejecutar TODO el archivo una sola vez.
-- Solo migraciones 001-021: no incluye bootstrap.sql, pruebas, cuentas ni secretos.
-- No cargar sobre otro proyecto ni sobre una instalación existente.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';
do $install_guard$
begin
 if to_regclass('auth.users') is null or to_regclass('storage.buckets') is null then
  raise exception 'Se requiere la estructura existente de Supabase Auth y Storage.';
 end if;
 if not exists(select 1 from pg_roles where rolname='authenticated') or not exists(select 1 from pg_roles where rolname='service_role') then
  raise exception 'No se reconocen los roles de Supabase.';
 end if;
 if exists(select 1 from pg_catalog.pg_tables where schemaname='public') then
  raise exception 'Instalación detenida: public ya contiene tablas. No repetir ni borrar datos; revisar el estado.';
 end if;
 if to_regnamespace('private') is not null then
  raise exception 'Instalación detenida: el esquema private ya existe. Revisar el destino antes de continuar.';
 end if;
 if exists(select 1 from storage.buckets where id='evidence') then
  raise exception 'Instalación detenida: el depósito evidence ya existe. Revisar el destino antes de continuar.';
 end if;
end $install_guard$;
`;
const verify = `
commit;
-- Resumen de lectura después de confirmar la instalación.
select 'Instalación completada' as resultado,
 (select count(*) from pg_catalog.pg_tables where schemaname='public') as tablas_publicas,
 (select count(*) from pg_catalog.pg_tables where schemaname='public' and rowsecurity) as tablas_con_rls,
 (select not public from storage.buckets where id='evidence') as archivos_privados;
`;
await fs.mkdir(output, { recursive: true });
await fs.writeFile(path.join(output, "instalar-base.sql"), `${preflight}\n${bodies.join("\n")}\n${verify}`, "utf8");
await fs.writeFile(path.join(output, "migraciones.json"), `${JSON.stringify({ target: "smbtvfevndmpxpxxiorj", migrations: manifest }, null, 2)}\n`, "utf8");
console.log("Preparadas 20 migraciones en work/database-install/instalar-base.sql.");
console.log("Solo archivos locales: no se conectó ni modificó Supabase.");
