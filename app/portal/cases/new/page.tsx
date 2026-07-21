import { requireRole } from "@/lib/authorization"
import { CaseFilingForm } from "@/components/portal/case-filing-form"
export default async function Page(){await requireRole("PARTY");return <main className="min-h-screen bg-muted/30 px-4 py-12"><CaseFilingForm/></main>}
