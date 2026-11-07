import { createHash } from "node:crypto";
import { ApiError } from "./backend";

export async function boundedBytes(response: Response, maximum: number): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) throw new ApiError(400, "Archivo vacío");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.length;
      if (size > maximum) { await reader.cancel(); throw new ApiError(413, "Archivo demasiado grande"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (!size) throw new ApiError(400, "Archivo vacío");
  const output = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
  return output;
}

export function inspectSignature(bytes: Uint8Array, mime: string) {
  const starts = (signature: number[]) => signature.every((byte, i) => bytes[i] === byte);
  let accepted = false;
  if (mime === "image/png") {
    const ending = [0,0,0,0,73,69,78,68,174,66,96,130];
    accepted = bytes.length >= 45 && starts([137,80,78,71,13,10,26,10]) && ending.every((byte,i) => bytes[bytes.length-ending.length+i]===byte);
  } else if (mime === "image/jpeg") {
    accepted = bytes.length > 4 && starts([255,216,255]) && bytes[bytes.length-2]===255 && bytes[bytes.length-1]===217;
  } else if (mime === "application/pdf") {
    accepted = starts([37,80,68,70,45]) && new TextDecoder().decode(bytes.slice(-1024)).includes("%%EOF");
  }
  if (!accepted) throw new ApiError(400, "El contenido no coincide con un formato admitido");
  // Firmas y huella, no antivirus ni un analizador completo de PDF o imágenes.
  return createHash("sha256").update(bytes).digest("hex");
}
