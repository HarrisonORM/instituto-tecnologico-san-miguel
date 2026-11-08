"use client";

import type { AuthTokens, CurrentUser, PaginatedQuery, PublicProgram } from "@/contracts/academic";

export class ClientApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// Instanciar por contexto de navegador. Nunca guardar tokens en localStorage o URLs.
export class InstituteClient {
  private tokens: AuthTokens | null = null;
  private generation = 0;
  private refreshInFlight: Promise<void> | null = null;

  private async send<T>(path: string, method: string, body?: unknown, authenticated = true, retry = true, extraHeaders: Record<string,string> = {}): Promise<T> {
    if (!path.startsWith("/api/") || path.includes("\\")) throw new ClientApiError(400, "Destino no permitido");
    const generation = this.generation;
    const response = await fetch(path, {
      method, credentials: "omit", cache: "no-store", redirect: "error",
      headers: { "Content-Type": "application/json", ...(authenticated && this.tokens ? { Authorization: `Bearer ${this.tokens.access_token}` } : {}), ...extraHeaders },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 401 && authenticated && retry && this.tokens?.refresh_token && generation===this.generation) {
      await this.refresh(); return this.send(path,method,body,authenticated,false,extraHeaders);
    }
    const payload = await response.json().catch(()=>({ error: "Respuesta no disponible" }));
    if (!response.ok) throw new ClientApiError(response.status, typeof payload.error==="string"?payload.error:"Operación no disponible");
    // Descartar respuestas académicas de una sesión que ya se cerró o cambió.
    if(authenticated && generation!==this.generation) throw new ClientApiError(401,"La sesión ha cambiado");
    return payload.data as T;
  }

  private async refresh() {
    if(this.refreshInFlight) return this.refreshInFlight;
    const generation=this.generation; const token=this.tokens?.refresh_token;
    if(!token) throw new ClientApiError(401,"Inicia sesión");
    const pending=(async()=>{
      try {
        const tokens=await this.send<AuthTokens>("/api/auth/refresh","POST",{refresh_token:token},false,false);
        if(generation!==this.generation) throw new ClientApiError(401,"La sesión ha cambiado");
        this.tokens=tokens;
      } catch(error) {
        if(generation===this.generation) {this.tokens=null;this.generation++;}
        throw error;
      }
    })();
    this.refreshInFlight=pending;
    try {await pending;} finally {if(this.refreshInFlight===pending)this.refreshInFlight=null;}
  }

  async login(email: string,password: string) {
    const generation=++this.generation; this.tokens=null;
    const tokens=await this.send<AuthTokens>("/api/auth/login","POST",{email,password},false,false);
    if(generation!==this.generation) throw new ClientApiError(401,"La sesión ha cambiado");
    this.tokens=tokens; return this.me();
  }
  async logout() {
    const pending=this.send("/api/auth/logout","POST",{},true,false);
    this.tokens=null;this.generation++;this.refreshInFlight=null;
    // El cierre local es inmediato; una respuesta anterior ya no puede restaurar sesión.
    await pending.catch(()=>undefined);
  }
  me() {return this.send<CurrentUser>("/api/me","GET");}
  async acceptSession(accessToken: string, refreshToken: string) {
    if (!accessToken || accessToken.length > 8192 || !refreshToken || refreshToken.length > 8192) throw new ClientApiError(400, "Sesión no válida");
    const generation = ++this.generation;
    this.tokens = { access_token: accessToken, refresh_token: refreshToken, expires_in: 3600, token_type: "bearer" };
    try { return await this.me(); } catch (error) { if (generation === this.generation) { this.tokens = null; this.generation++; } throw error; }
  }
  catalog() {return this.send<{programs:PublicProgram[]}>("/api/public/catalog","GET",undefined,false);}
  list<T>(resource: string,query: PaginatedQuery = {}) {
    if(!/^[a-z_]+$/.test(resource)) throw new ClientApiError(400,"Recurso no válido");
    const params=new URLSearchParams();
    for(const [key,value] of Object.entries(query)) if(value!==undefined)params.set(key,String(value));
    return this.send<T[]>(`/api/backend/${resource}?${params}`,"GET");
  }
  command<T>(operation: string,parameters: Record<string,unknown>,idempotencyKey?: string) {
    if(!/^[a-z_]+$/.test(operation)) throw new ClientApiError(400,"Operación no válida");
    return this.send<T>(`/api/backend/${operation}`,"POST",parameters,true,true,idempotencyKey?{"Idempotency-Key":idempotencyKey}:{});
  }
  recover(email: string) {return this.send("/api/auth/recover","POST",{email},false);}
  async verify(tokenHash: string,type: "invite"|"recovery"|"email") {
    const generation=++this.generation;this.tokens=null;
    const result=await this.send<AuthTokens>("/api/auth/verify","POST",{token_hash:tokenHash,type},false,false);
    if(generation!==this.generation)throw new ClientApiError(401,"La sesión ha cambiado");
    this.tokens=result;
  }
  changePassword(password: string) {return this.send("/api/auth/password","POST",{password});}
  enrollMfa() {return this.send<{id:string;totp:{qr_code:string;secret:string;uri:string}}>("/api/auth/mfa-enroll","POST",{});}
  listMfa() {return this.send<{id:string;friendly_name?:string;status:string}[]>("/api/auth/mfa-list","POST",{});}
  challengeMfa(factor: string) {return this.send<{id:string}>("/api/auth/mfa-challenge","POST",{factor_id:factor});}
  async verifyMfa(factor: string,challenge: string,code: string) {
    const generation=this.generation;
    const result=await this.send<AuthTokens>("/api/auth/mfa-verify","POST",{factor_id:factor,challenge_id:challenge,code});
    if(generation!==this.generation)throw new ClientApiError(401,"La sesión ha cambiado");
    this.tokens=result;
  }
  invite(email: string,fullName: string,role: string,key: string) {
    return this.send("/api/admin/invitations","POST",{email,full_name:fullName,role},true,true,{"Idempotency-Key":key});
  }
  reconcileInvitation(id: string) {return this.send(`/api/admin/invitations/${encodeURIComponent(id)}`,"POST",{});}
  executeDeletion(id: string) {return this.send(`/api/admin/deletions/${encodeURIComponent(id)}`,"POST",{});}
  inspectUpload(id: string) {return this.send(`/api/files/${encodeURIComponent(id)}/inspect`,"POST",{});}
  discardUpload(id: string) {return this.send(`/api/files/${encodeURIComponent(id)}`,"DELETE",{});}
  async storageUpload(path: string,file: File) {
    if(!this.tokens)throw new ClientApiError(401,"Inicia sesión");
    const base=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!base || !key)throw new ClientApiError(503,"Almacenamiento pendiente de configurar");
    if(!/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(base))throw new ClientApiError(503,"Destino de almacenamiento no válido");
    const response=await fetch(`${base}/storage/v1/object/evidence/${path.split("/").map(encodeURIComponent).join("/")}`,{
      method:"POST",credentials:"omit",redirect:"error",headers:{apikey:key,Authorization:`Bearer ${this.tokens.access_token}`,"Content-Type":file.type,"x-upsert":"false"},body:file,
    });
    if(!response.ok)throw new ClientApiError(response.status,"No se pudo completar la carga; conservar la reserva para conciliarla");
  }
  async download(id: string) {
    const generation=this.generation;
    const response=await fetch(`/api/files/${encodeURIComponent(id)}`,{credentials:"omit",cache:"no-store",redirect:"error",headers:this.tokens?{Authorization:`Bearer ${this.tokens.access_token}`}:{}});
    if(!response.ok)throw new ClientApiError(response.status,"Archivo no disponible");
    const blob=await response.blob();
    if(generation!==this.generation)throw new ClientApiError(401,"La sesión ha cambiado");
    return blob;
  }
}
