import { IntakeForm } from "@/components/public/intake-form"
import { PublicHero, PublicShell } from "@/components/public/public-shell"
export default function ReferralPage(){return <PublicShell><PublicHero eyebrow="Dispute intake" title="Refer a commercial dispute" description="Share the essential details with the Secretariat. Your submission is confidential and will be acknowledged by email."/><section className="mx-auto max-w-3xl px-4 py-16 md:px-8"><IntakeForm type="referral"/></section></PublicShell>}
