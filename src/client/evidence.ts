"use client";
import { InstituteClient, ClientApiError } from "./api";
import type { UploadReservation } from "@/contracts/academic";

export class PendingEvidenceError extends Error {
  constructor(public uploadId:string,public cause:unknown) {super("Carga pendiente de conciliación");}
}
export async function prepareEvidence(client: InstituteClient,file: File) {
  if(!["application/pdf","image/jpeg","image/png"].includes(file.type) || file.size<=0 || file.size>2000000)throw new ClientApiError(400,"Archivo no admitido");
  const reservation=await client.command<UploadReservation>("reserve_upload",{p_bytes:file.size,p_mime:file.type});
  try {
    await client.storageUpload(reservation.path,file);
    await client.inspectUpload(reservation.id);
    return reservation.id;
  } catch(error) {throw new PendingEvidenceError(reservation.id,error);}
}
export function confirmSubmission(client: InstituteClient,submission:string,body:string,uploads:string[],idempotencyKey:string) {
  return client.command<string>("submit_work",{p_submission:submission,p_body:body,p_uploads:uploads},idempotencyKey);
}
