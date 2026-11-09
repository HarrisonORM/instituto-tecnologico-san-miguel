import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {URL} from 'node:url';
import {Buffer} from 'node:buffer';
import ts from 'typescript';

function moduleUrl(source) { const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}); return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`; }
const policySource=await fs.readFile(new URL('../src/lib/sensitive-actions.ts',import.meta.url),'utf8');
const policyUrl=moduleUrl(policySource); const {needsVerification,verificationCopy}=await import(policyUrl);
const clientSource=(await fs.readFile(new URL('../src/client/api.ts',import.meta.url),'utf8')).replace('"@/lib/sensitive-actions"',JSON.stringify(policyUrl));
const {InstituteClient,ClientApiError}=await import(moduleUrl(clientSource));
const tokens={access_token:'synthetic-token',refresh_token:'synthetic-refresh',expires_in:3600,token_type:'bearer'};
async function fixture(run,{factors=[]}={}) {
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async(path,options)=>{calls.push({path,method:options.method});let data=null;if(path.includes('/login')||path.includes('/mfa-verify'))data=tokens;else if(path==='/api/me')data={profile:{id:'local-account'},roles:[],permissions:[]};else if(path==='/api/auth/mfa-list')data=factors;else if(path==='/api/auth/mfa-challenge')data={id:'local-challenge'};return new globalThis.Response(JSON.stringify({data}),{status:200,headers:{'content-type':'application/json'}})};
 try {const api=new InstituteClient();await api.login('local@example.invalid','not-a-real-password');await run(api,calls)}finally{globalThis.fetch=original}
}
test('la escritura espera la aceptación y conserva el propósito y destinatario',()=>fixture(async(api,calls)=>{
 let resolve;let intent;api.setVerifier(value=>{intent=value;return new Promise(r=>{resolve=r})});
 const pending=api.command('manage_account',{p_user:'student',p_state:'archived'},undefined,{target:'Estudiante local'});
 assert.equal(calls.some(c=>c.path.includes('/api/backend/')),false);assert.equal(intent.target,'Estudiante local');assert.equal(intent.variant,'archived');
 resolve();await pending;assert.equal(calls.filter(c=>c.path.startsWith('/api/backend/manage_account')).length,1);
}));
test('cancelar no envía ninguna escritura',()=>fixture(async(api,calls)=>{
 api.setVerifier(async()=>{throw new ClientApiError(499,'Cancelado')});
 await assert.rejects(api.command('set_role',{p_user:'student',p_role:'teacher',p_enabled:true}),e=>e.status===499);
 assert.equal(calls.some(c=>c.path.includes('/api/backend/')),false);
}));
test('cambiar de sesión durante la verificación cancela la intención anterior',()=>fixture(async(api,calls)=>{
 let resolve;api.setVerifier(()=>new Promise(r=>{resolve=r}));const pending=api.command('close_period',{p_period:'period'});
 await api.login('other@example.invalid','another-synthetic-password');resolve();await assert.rejects(pending,e=>e.status===401);
 assert.equal(calls.some(c=>c.path.includes('/api/backend/')),false);
}));
test('las tareas y comentarios ordinarios no solicitan verificación administrativa',()=>fixture(async(api,calls)=>{
 let count=0;api.setVerifier(async()=>{count++});await api.command('add_comment',{p_submission:'submission',p_body:'Local'});assert.equal(count,0);assert.equal(calls.at(-1).method,'POST');
}));
test('una invitación no se envía si se cancela la verificación',()=>fixture(async(api,calls)=>{
 api.setVerifier(async()=>{throw new ClientApiError(499,'Cancelado')});await assert.rejects(api.invite('student@example.invalid','Prueba','student','key'),e=>e.status===499);assert.equal(calls.some(c=>c.path.includes('/api/admin/')),false);
}));
test('las seis casillas se guardan con una verificación y una petición, sin guardar al cancelar',()=>fixture(async(api,calls)=>{
 let checks=0;api.setVerifier(async intent=>{assert.equal(intent.operation,'set_permissions');checks++});
 await api.command('set_permissions',{p_user:'academic',p_permissions:['structure.manage','evaluation.manage'],p_expected:[]});
 assert.equal(checks,1);assert.equal(calls.filter(c=>c.path==='/api/backend/set_permissions').length,1);
 api.setVerifier(async()=>{throw new ClientApiError(499,'Cancelado')});
 await assert.rejects(api.command('set_permissions',{p_user:'academic',p_permissions:[],p_expected:['structure.manage','evaluation.manage']}),e=>e.status===499);
 assert.equal(calls.filter(c=>c.path==='/api/backend/set_permissions').length,1);
}));
test('la eliminación ejecutable solicita verificación antes de llamar al servidor',()=>fixture(async(api,calls)=>{
 let called=false;api.setVerifier(async intent=>{assert.equal(intent.operation,'execute_deletion');called=true});await api.executeDeletion('local-request');assert.equal(called,true);assert.equal(calls.at(-1).path,'/api/admin/deletions/local-request');
}));
test('la contraseña con factor activo solicita verificación y respeta la cancelación',()=>fixture(async(api,calls)=>{
 api.setVerifier(async intent=>{assert.equal(intent.operation,'password');throw new ClientApiError(499,'Cancelado')});await assert.rejects(api.changePassword('synthetic-new-password'),e=>e.status===499);assert.equal(calls.some(c=>c.path==='/api/auth/password'),false);
},{factors:[{id:'factor',status:'verified',factor_type:'totp'}]}));
test('la activación inicial sin factor mantiene el recorrido de enlace de correo',()=>fixture(async(api,calls)=>{
 let count=0;api.setVerifier(async()=>{count++});await api.changePassword('synthetic-new-password');assert.equal(count,0);assert.equal(calls.at(-1).path,'/api/auth/password');
}));
test('el desafío y la verificación no abren una verificación recursiva',()=>fixture(async(api)=>{
 let count=0;api.setVerifier(async()=>{count++});const challenge=await api.challengeMfa('factor');await api.verifyMfa('factor',challenge.id,'000000');assert.equal(count,0);
}));
test('la traducción docente y la institucional conservan distinto nivel de protección',()=>{
 assert.equal(needsVerification('set_translation',{p_kind:'task'}),false);assert.equal(needsVerification('set_translation',{p_kind:'category'}),true);assert.equal(needsVerification('close_period'),true);assert.equal(needsVerification('mark_notification'),false);
});
test('el resumen distingue archivado y eliminación sin prometer borrado de historial',()=>{
 assert.match(verificationCopy({operation:'manage_account',variant:'archived'},false).description,/reversible/);assert.match(verificationCopy({operation:'request_deletion'},false).description,/dos administradores/);assert.equal(verificationCopy({operation:'manage_account',variant:'suspended'},true).title,'Suspend account');
});
