import { AuthScreen } from "@/components/auth";
export default async function Page({ searchParams }: { searchParams: Promise<{ perfil?: string }> }) { const { perfil } = await searchParams; return <AuthScreen profile={perfil} />; }
