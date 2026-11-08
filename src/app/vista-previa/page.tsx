import { Portal, PreviewChooser } from "@/components/portal";
import type { Role } from "@/contracts/academic";
export default async function Page({ searchParams }: { searchParams: Promise<{ rol?: string }> }) { const { rol } = await searchParams; return rol && ["student", "teacher", "academic_admin", "system_admin"].includes(rol) ? <Portal key={rol} previewRole={rol as Role} /> : <PreviewChooser />; }
