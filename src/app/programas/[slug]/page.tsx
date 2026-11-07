import { notFound } from "next/navigation";
import { ProgramPage } from "@/components/landing";
import { programs } from "@/lib/content";
export function generateStaticParams() { return programs.map(({ slug }) => ({ slug })); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!programs.some(p => p.slug === slug)) notFound(); return <ProgramPage slug={slug} />; }
