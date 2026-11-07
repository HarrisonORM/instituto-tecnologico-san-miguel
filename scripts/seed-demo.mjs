// Herramienta de escritura remota: no se ejecuta durante la implementación.
import fs from "node:fs";
import process from "node:process";
import console from "node:console";
import { URL } from "node:url";
import { createHash } from "node:crypto";
import { demoPassword } from "./lib/demo-password.mjs";

const tag = "itsm-synthetic-v1";
const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const password = process.env.DEMO_SEED_PASSWORD;
const expected = process.env.DEMO_PROJECT_REF;

function uuid(value) {
  const hex = createHash("sha256").update(`${tag}:${value}`).digest("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
}
async function api(path, body, method = "GET", prefer = "return=representation") {
  const response = await globalThis.fetch(`${base}${path}`, {
    method, redirect: "error", signal: globalThis.AbortSignal.timeout(20000),
    headers: { apikey: secret, "Content-Type": "application/json", Prefer: prefer },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Carga detenida por respuesta HTTP ${response.status}. Conservar los registros existentes y revisar antes de repetir.`);
  const text = await response.text(); return text ? JSON.parse(text) : null;
}
async function rows(table, values) {
  if (!values.length) return;
  await api(`/rest/v1/${table}?on_conflict=id`, values, "POST", "resolution=ignore-duplicates,return=minimal");
}
async function run() {
  if (process.env.DEMO_SEED_ALLOWED !== "true" || process.env.DEMO_ACCEPT_SAMPLE_DATA !== "true") throw new Error("Carga deshabilitada: requiere aceptar expresamente el destino y los datos de ejemplo.");
  if (!base || !secret?.startsWith("sb_secret_") || !password || password.length<16 || !expected) throw new Error("Falta configuración privada para la carga ficticia.");
  const url = new URL(base);
  if (url.origin !== base || url.protocol !== "https:" || url.hostname !== `${expected}.supabase.co` || !/^[a-z0-9]{20}$/.test(expected)) throw new Error("El destino no coincide con el proyecto autorizado.");
  const fixture = JSON.parse(fs.readFileSync(new URL("../supabase/fixtures/accounts.json", import.meta.url), "utf8"));
  const existingProfiles = await api("/rest/v1/profiles?select=id,seed_tag&limit=1000");
  if (existingProfiles.some(p=>p.seed_tag!==tag)) throw new Error("El proyecto contiene perfiles ajenos a esta semilla. No se modifica.");
  const authUsers=[];
  for (let page=1;page<=20;page++) {
    const result=await api(`/auth/v1/admin/users?page=${page}&per_page=100`);
    authUsers.push(...result.users);
    if(result.users.length<100) break;
    if(page===20) throw new Error("Directorio inesperadamente grande: revisar el destino.");
  }
  if(authUsers.some(u=>u.app_metadata?.seed_tag!==tag)) throw new Error("Existen cuentas Auth ajenas a esta semilla. No se modifica el proyecto.");
  const accounts=[];
  for(const item of fixture.accounts) {
    if(!item.email.endsWith(".invalid")) throw new Error("La semilla solo admite direcciones ficticias .invalid.");
    let user=authUsers.find(u=>u.email===item.email);
    if(!user) user=await api("/auth/v1/admin/users",{email:item.email,password:demoPassword(password,item.fixture_id),email_confirm:true,app_metadata:{seed_tag:tag}},"POST");
    accounts.push({...item,id:user.id});
    await rows("profiles",[{id:user.id,full_name:item.full_name,document_number:item.document_number,seed_tag:tag}]);
    await api("/rest/v1/user_roles?on_conflict=user_id,role",[{user_id:user.id,role:item.role}],"POST","resolution=ignore-duplicates,return=minimal");
  }
  const programs=[{id:uuid("program-0"),name:"Desarrollo de Software"},{id:uuid("program-1"),name:"Redes y Telecomunicaciones"}];
  await rows("programs",programs);
  const start=new Date(); const end=new Date(start.getTime()+180*86400000);
  const period={id:uuid("period"),name:"Período ficticio de portafolio",starts_on:start.toISOString().slice(0,10),ends_on:end.toISOString().slice(0,10)};
  await rows("periods",[period]);
  const subjects=["Fundamentos de Programación","Bases de Datos","Fundamentos de Redes","Servicios de Telecomunicaciones"].map((name,i)=>({id:uuid(`subject-${i}`),program_id:programs[Math.floor(i/2)].id,name}));
  await rows("subjects",subjects);
  const groups=[0,0,1,2,2,3].map((subject,i)=>({id:uuid(`group-${i}`),subject_id:subjects[subject].id,period_id:period.id,name:`Grupo ${i+1}`}));
  await rows("groups",groups);
  const teachers=accounts.filter(a=>a.role==="teacher");
  const teacherIndex=[0,0,1,2,2,3];
  await api("/rest/v1/teacher_groups?on_conflict=teacher_id,group_id",groups.map((g,i)=>({group_id:g.id,teacher_id:teachers[teacherIndex[i]].id})),"POST","resolution=ignore-duplicates,return=minimal");
  const academic=accounts.find(a=>a.role==="academic_admin");
  await api("/rest/v1/user_permissions?on_conflict=user_id,permission",["structure.manage","enrollment.manage","evaluation.manage","identity.manage","period.close"].map(permission=>({user_id:academic.id,permission})),"POST","resolution=ignore-duplicates,return=minimal");
  const enrollments=[]; let a=0,b=0;
  for(const student of accounts.filter(p=>p.role==="student")) {
    const software=student.program===programs[0].name;
    const index=software?a++:b++;
    const chosen=software?[index<10?0:1,2]:[index<10?3:4,5];
    for(const g of chosen) enrollments.push({student_id:student.id,group_id:groups[g].id});
    await api(`/rest/v1/profiles?id=eq.${student.id}&program_id=is.null`,{program_id:programs[software?0:1].id},"PATCH","return=minimal");
  }
  await api("/rest/v1/enrollments?on_conflict=student_id,group_id",enrollments,"POST","resolution=ignore-duplicates,return=minimal");
  const categories=subjects.flatMap((s,i)=>[{id:uuid(`category-${i}-0`),subject_id:s.id,period_id:period.id,name:"Actividades prácticas",weight:60},{id:uuid(`category-${i}-1`),subject_id:s.id,period_id:period.id,name:"Evaluación de cierre",weight:40}]);
  await rows("categories",categories);
  const tasks=groups.flatMap((g,i)=>[0,1].map(n=>({id:uuid(`task-${i}-${n}`),group_id:g.id,category_id:categories.find(c=>c.subject_id===g.subject_id&&c.name===(n?"Evaluación de cierre":"Actividades prácticas")).id,author_id:teachers[teacherIndex[i]].id,title:n?"Actividad integradora de ejemplo":"Práctica inicial de ejemplo",description:"Actividad ficticia para recorrer la plataforma. No corresponde a un programa académico real.",due_at:new Date(start.getTime()+(n?7:-1)*86400000).toISOString()})));
  await rows("tasks",tasks);
  const submissions=[],versions=[];
  for(const [i,e] of enrollments.entries()) {
    for(const task of tasks.filter(t=>t.group_id===e.group_id)) {
      const id=uuid(`submission-${e.student_id}-${task.id}`);
      const delivered=i%3!==0; const graded=delivered&&i%2===0;
      submissions.push({id,task_id:task.id,student_id:e.student_id,current_version:delivered?1:0,grade:graded?3.8:null,graded_by:graded?task.author_id:null,graded_at:graded?start.toISOString():null});
      if(delivered) versions.push({id:uuid(`version-${id}`),submission_id:id,version:1,body:"Evidencia textual ficticia. Los documentos se incorporarán en la demostración posterior.",submitted_at:start.toISOString(),late:new Date(task.due_at)<start});
    }
  }
  await rows("submissions",submissions); await rows("submission_versions",versions);
  for(const submission of submissions.filter(s=>s.grade!==null)) {
    const history=await api(`/rest/v1/grade_history?submission_id=eq.${submission.id}&select=id&limit=1`);
    if(!history.length) await api("/rest/v1/grade_history",{submission_id:submission.id,old_grade:null,new_grade:submission.grade,actor_id:submission.graded_by,reason:"Calificación ficticia inicial"},"POST","return=minimal");
  }
  fs.mkdirSync("work",{recursive:true});
  fs.writeFileSync("work/seed-map.json",JSON.stringify({tag,project:expected,accounts:accounts.map(({fixture_id,id,role})=>({fixture_id,id,role})),period:period.id},null,2)+"\n",{mode:0o600});
  console.log("Carga ficticia preparada en el proyecto autorizado. No se enviaron correos. No se imprimen contraseñas.");
}
run().catch(()=>{console.error("Carga detenida. Revisar configuración, destino y registros antes de repetir; no se muestran datos privados.");process.exitCode=1;});
