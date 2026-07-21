import { prisma } from "@/lib/prisma"
import { IntakeForm } from "@/components/public/intake-form"
import { PublicHero, PublicShell } from "@/components/public/public-shell"
export default async function BookingPage(){const facilities=await prisma.facility.findMany({where:{isActive:true},select:{id:true,name:true}}).catch(()=>[]);return <PublicShell><PublicHero eyebrow="External booking" title="Request hearing facilities" description="Submit a preferred room and time. The Secretariat will confirm availability and practical arrangements."/><section className="mx-auto max-w-3xl px-4 py-16 md:px-8"><IntakeForm type="booking" facilities={facilities}/></section></PublicShell>}
