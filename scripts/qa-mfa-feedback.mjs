// Aislado: sirve los componentes reales con respuestas HTTP sintéticas.
// No lee .env.local ni conecta con Supabase. Nunca desplegar este servidor.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import console from 'node:console';
import {setTimeout} from 'node:timers';
import {URL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'work/mfa-feedback-qa');
await fs.mkdir(out,{recursive:true});
const require=createRequire(path.join(root,'package.json'));
const pack=require('next/dist/compiled/webpack/webpack');
const webpack=pack.webpack || pack.default;
if(typeof webpack!=='function')throw new Error('Compilador local no disponible');
await fs.writeFile(path.join(out,'loader.cjs'),`const ts=require(${JSON.stringify(path.join(root,'node_modules/typescript'))});module.exports=function(source){return ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText};`);
await fs.writeFile(path.join(out,'link.tsx'),`export default function Link({children,...p}:any){return <a {...p}>{children}</a>}`);
await fs.writeFile(path.join(out,'image.tsx'),`export default function Image({fill,priority,unoptimized,...p}:any){return <img {...p}/>} `);
await fs.writeFile(path.join(out,'navigation.ts'),`export function useRouter(){return {push:(p:string)=>location.assign(p),replace:(p:string)=>location.replace(p)}}`);
await fs.writeFile(path.join(out,'entry.tsx'),`import {createRoot} from 'react-dom/client';import {useEffect} from 'react';import {Providers,useUI} from ${JSON.stringify(path.join(root,'src/components/ui.tsx'))};import {Portal} from ${JSON.stringify(path.join(root,'src/components/portal.tsx'))};function Test(){const {user,login}=useUI();useEffect(()=>{void login('admin@example.invalid','local-test-only')},[]);return user?<Portal/>:<p>Preparando prueba local…</p>}createRoot(document.getElementById('root')!).render(<Providers><Test/></Providers>);`);
const compiler=webpack({mode:'production',context:root,entry:path.join(out,'entry.tsx'),output:{path:out,filename:'bundle.js'},resolve:{extensions:['.tsx','.ts','.js','.json'],modules:[path.join(root,'node_modules'),'node_modules'],alias:{'@':path.join(root,'src'),'next/link$':path.join(out,'link.tsx'),'next/image$':path.join(out,'image.tsx'),'next/navigation$':path.join(out,'navigation.ts')}},module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:[{loader:path.join(out,'loader.cjs')}]}]},optimization:{minimize:false},plugins:[new webpack.DefinePlugin({'process.env.NEXT_PUBLIC_SUPABASE_URL':JSON.stringify('https://local-fixture.invalid'),'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY':JSON.stringify('sb_publishable_fixture')})]});
await new Promise((resolve,reject)=>compiler.run((error,stats)=>{compiler.close(()=>{});if(error||stats.hasErrors())reject(error||new Error(stats.toString({all:false,errors:true})));else resolve()}));
let scenario='success',verified=false,enrolled=false;
const id='11111111-1111-4111-a111-111111111111',factor='22222222-2222-4222-a222-222222222222';
const tokens={access_token:'local-test-token',refresh_token:'local-test-refresh',expires_in:3600,token_type:'bearer'};
const user={profile:{id,full_name:'Cuenta de prueba local',address:'',state:'active'},roles:[{user_id:id,role:'system_admin'}],permissions:[]};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:3103');
  const send=(data,status=200)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(status<400?{data}:{error:data}))};
  if(url.pathname==='/'){
   scenario=url.searchParams.get('case')||'success';verified=false;enrolled=false;
   res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
   res.end('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/app.css"><style>@font-face{font-family:Manrope;src:url(/font.ttf)}body{--font-manrope:Manrope}.qa-note{padding:8px 16px;background:#e9f7f1;color:#102e25;font:14px Manrope}</style></head><body><div class="qa-note">Prueba local · Respuestas simuladas · Sin cuentas ni códigos reales</div><div id="root"></div><script src="/bundle.js"></script></body></html>');return;
  }
  if(url.pathname==='/bundle.js'){res.writeHead(200,{'content-type':'application/javascript; charset=utf-8'});res.end(await fs.readFile(path.join(out,'bundle.js')));return}
  if(url.pathname==='/font.ttf'){res.end(await fs.readFile(path.join(root,'public/fonts/manrope.ttf')));return}
  if(url.pathname==='/app.css'){
   const dir=path.join(root,'.next/static/css');const css=(await fs.readdir(dir)).filter(n=>n.endsWith('.css'));
   res.writeHead(200,{'content-type':'text/css'});res.end((await Promise.all(css.map(n=>fs.readFile(path.join(dir,n),'utf8')))).join('\n'));return;
  }
  if(!url.pathname.startsWith('/api/')){res.writeHead(404);res.end();return}
  let body='';for await(const chunk of req)body+=chunk;const args=body?JSON.parse(body):{};
  if(url.pathname==='/api/auth/login'){send(tokens);return}
  if(url.pathname==='/api/me'){
   if(verified){await new Promise(r=>setTimeout(r,450));if(scenario==='refresh-error'){send('Fallo simulado de actualización',503);return}}
   send(user);return;
  }
  if(url.pathname==='/api/auth/mfa-list'){send(enrolled?[{id:factor,status:verified?'verified':'unverified',friendly_name:'Autenticador de prueba local'}]:[]);return}
  if(url.pathname==='/api/auth/mfa-enroll'){enrolled=true;send({id:factor,totp:{qr_code:'<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><rect width="180" height="180" fill="white"/><text x="15" y="90" fill="black">PRUEBA LOCAL</text></svg>',secret:'LOCAL-FIXTURE-NOT-A-SECRET',uri:'local-fixture'}});return}
  if(url.pathname==='/api/auth/mfa-challenge'){send({id:'33333333-3333-4333-a333-333333333333'});return}
  if(url.pathname==='/api/auth/mfa-verify'){
   if(scenario==='reject'||args.code!=='000000'){send('Código de prueba rechazado',400);return}
   verified=true;send(tokens);return;
  }
  if(url.pathname.startsWith('/api/backend/')){if(verified)await new Promise(r=>setTimeout(r,700));send(url.pathname.endsWith('/profiles')?[user.profile]:[]);return}
  send(null);
 }catch{res.writeHead(500);res.end('Fallo de la prueba local')}
});
server.listen(3103,'127.0.0.1',()=>console.log('Prueba local disponible en http://127.0.0.1:3103 · sin Supabase'));
