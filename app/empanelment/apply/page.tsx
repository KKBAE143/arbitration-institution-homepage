import { IntakeForm } from "@/components/public/intake-form"
import { PublicHero, PublicShell } from "@/components/public/public-shell"
export default function ApplyPage(){return <PublicShell><PublicHero eyebrow="Panel applications" title="Apply for empanelment" description="Submit your professional profile for the Council's structured document review, interview, and approval process."/><section className="mx-auto max-w-3xl px-4 py-16 md:px-8"><IntakeForm type="empanelment"/></section></PublicShell>}
