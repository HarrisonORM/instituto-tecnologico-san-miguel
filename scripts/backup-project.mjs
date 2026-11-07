// Copia privada manual. Este archivo NO ejecuta nada hasta invocarlo expresamente.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";

let destination;
async function run() {
  if(process.env.BACKUP_ALLOWED!=="true")throw new Error("Copia deshabilitada");
  const project=process.env.BACKUP_PROJECT_REF;
  const secret=process.env.SUPABASE_SECRET_KEY;
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
  if(!project || !/^[a-z0-9]{20}$/.test(project) || base!==`https://${project}.supabase.co` || !secret?.startsWith("sb_secret_"))throw new Error("Destino no confirmado");
  const database=new URL(process.env.DATABASE_URL??"");
  const user=decodeURIComponent(database.username);
  const direct=database.hostname===`db.${project}.supabase.co`;
  const pooled=database.hostname.endsWith(".pooler.supabase.com") && user===`postgres.${project}`;
  if(!["postgres:","postgresql:"].includes(database.protocol) || (!direct&&!pooled))throw new Error("La base no corresponde al proyecto esperado");
  const root=path.resolve("backups");fs.mkdirSync(root,{recursive:true});
  destination=path.join(root,`${new Date().toISOString().replace(/[:.]/g,"-")}-${randomUUID().slice(0,8)}`);
  fs.mkdirSync(destination,{recursive:false,mode:0o700});
  const manifest={project,started_at:new Date().toISOString(),complete:false,database:"database.dump",files:[]};
  const save=()=>fs.writeFileSync(path.join(destination,"manifest.json"),JSON.stringify(manifest,null,2)+"\n",{mode:0o600});
  save();
  const environment={...process.env,PGHOST:database.hostname,PGPORT:database.port||"5432",PGDATABASE:decodeURIComponent(database.pathname.slice(1))||"postgres",PGUSER:user,PGPASSWORD:decodeURIComponent(database.password),PGSSLMODE:"verify-full",PGCONNECT_TIMEOUT:"20"};
  delete environment.SUPABASE_SECRET_KEY;delete environment.DATABASE_URL;delete environment.DEMO_SEED_PASSWORD;
  await new Promise((resolve,reject)=>{
    const child=spawn("pg_dump",["--format=custom","--no-owner","--no-privileges","--schema=public","--schema=private","--schema=auth","--schema=storage",`--file=${path.join(destination,"database.dump")}`],{env:environment,stdio:"ignore",windowsHide:true});
    child.once("error",()=>reject(new Error("pg_dump no disponible")));
    child.once("exit",code=>code===0?resolve():reject(new Error("Exportación de base incompleta")));
  });
  let total=0; let count=0;
  async function api(endpoint,body) {
    const response=await globalThis.fetch(`${base}${endpoint}`,{method:body?"POST":"GET",headers:{apikey:secret,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined,redirect:"error",signal:globalThis.AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error("Lectura de almacenamiento incompleta");
    return response;
  }
  const fileRoot=path.join(destination,"evidence");fs.mkdirSync(fileRoot,{recursive:true,mode:0o700});
  const folders=[""];const visited=new Set();
  while(folders.length) {
    const prefix=folders.shift();
    if(visited.has(prefix))continue;visited.add(prefix);
    if(visited.size>5000)throw new Error("Listado fuera del presupuesto de copia");
    for(let offset=0;;offset+=100) {
      const objects=await(await api("/storage/v1/object/list/evidence",{prefix,limit:100,offset,sortBy:{column:"name",order:"asc"}})).json();
      for(const object of objects) {
        const name=prefix?`${prefix}/${object.name}`:object.name;
        if(!object.id) {folders.push(name);continue;}
        if(++count>5000)throw new Error("Demasiados archivos para esta copia");
        const target=path.resolve(fileRoot,name);
        if(!target.startsWith(fileRoot+path.sep))throw new Error("Ruta de archivo rechazada");
        const response=await api(`/storage/v1/object/authenticated/evidence/${name.split("/").map(encodeURIComponent).join("/")}`);
        const reader=response.body?.getReader();if(!reader)throw new Error("Archivo sin cuerpo");
        const chunks=[];let size=0;
        try {
          while(true) {
            const {done,value}=await reader.read();if(done)break;
            size+=value.length;total+=value.length;
            if(size>2000000 || total>250000000){await reader.cancel();throw new Error("Presupuesto de copia excedido");}
            chunks.push(value);
          }
        } finally {reader.releaseLock();}
        const bytes=Buffer.concat(chunks);
        fs.mkdirSync(path.dirname(target),{recursive:true,mode:0o700});
        fs.writeFileSync(target,bytes,{flag:"wx",mode:0o600});
        manifest.files.push({name,bytes:size,sha256:createHash("sha256").update(bytes).digest("hex")});save();
      }
      if(objects.length<100)break;
    }
  }
  const dump=fs.readFileSync(path.join(destination,"database.dump"));
  manifest.database_sha256=createHash("sha256").update(dump).digest("hex");
  manifest.finished_at=new Date().toISOString();manifest.complete=true;save();
  console.log("Copia local finalizada. Conservarla en almacenamiento privado; falta validar su restauración.");
}
run().catch(()=>{console.error("Copia no completada. Conservar los archivos parciales para revisar; no se muestran credenciales.");process.exitCode=1;});
