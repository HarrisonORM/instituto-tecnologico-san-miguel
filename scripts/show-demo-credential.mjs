// Solo uso local deliberado del operador. Nunca ejecutar en CI, servidor o logs públicos.
import fs from "node:fs";
import process from "node:process";
import console from "node:console";
import { demoPassword } from "./lib/demo-password.mjs";
try {
  if(process.env.DEMO_CREDENTIAL_ACCESS!=="true") throw new Error();
  const fixture=JSON.parse(fs.readFileSync(new URL("../supabase/fixtures/accounts.json",import.meta.url),"utf8"));
  const account=fixture.accounts.find(a=>a.fixture_id===process.argv[2]);
  if(!account) throw new Error();
  console.log(`Cuenta ficticia: ${account.email}`);
  console.log(`Contraseña: ${demoPassword(process.env.DEMO_SEED_PASSWORD,account.fixture_id)}`);
} catch {console.error("Consulta de credencial deshabilitada o configuración incorrecta.");process.exitCode=1;}
