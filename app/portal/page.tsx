import { requireRole } from "@/lib/authorization"
import { CaseWorkspace } from "@/components/portal/case-workspace"
export default async function PartyPortalPage(){ const user=await requireRole("PARTY"); return <CaseWorkspace user={user} basePath="/portal" /> }
