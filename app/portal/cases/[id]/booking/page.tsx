import Link from "next/link"
import { IntakeForm } from "@/components/public/intake-form"
import { Button } from "@/components/ui/button"
import { accessibleCase, requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export default async function CaseBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("PARTY")
  const { id } = await params
  const matter = await accessibleCase(id, user)
  const facilities = await prisma.facility.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } })
  return <main className="min-h-screen bg-muted/30"><div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 md:px-8"><header><Button render={<Link href={`/portal/cases/${id}`} />} variant="ghost">Back to matter</Button><p className="mt-6 font-mono text-sm text-muted-foreground">{matter.caseNumber}</p><h1 className="font-serif text-4xl font-semibold text-balance">Request a priority hearing booking</h1><p className="mt-2 text-muted-foreground">This request will be linked to {matter.title} and prioritized by the Secretariat.</p></header><IntakeForm type="booking" facilities={facilities} caseId={id} /></div></main>
}
