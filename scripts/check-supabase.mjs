import console from "node:console";
import process from "node:process";
import { probeSupabaseAuth } from "./lib/supabase-probe.mjs";

const result = await probeSupabaseAuth({
  projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

console.log(`${result.ok ? "Correcto" : "Pendiente"}: ${result.message}`);
process.exitCode = result.ok ? 0 : 1;
