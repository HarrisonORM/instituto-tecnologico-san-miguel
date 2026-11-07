import { Portal, PreviewChooser } from "@/components/portal";
import type { Role } from "@/contracts/academic";
export default async function Page({ searchParams }: { searchParams: Promise<{ rol?: string; persona?: string }> }) { const { rol, persona } = await searchParams; return rol && ["student", "teacher", "academic_admin", "system_admin"].includes(rol) ? <Portal key={`${rol}-${persona ?? ""}`} previewRole={rol as Role} previewActor={persona} /> : <PreviewChooser />; }
