import { requireRole } from "@/lib/authorization"
import { CaseWorkspace } from "@/components/portal/case-workspace"
export default async function ArbitratorPage(){ const user=await requireRole("ARBITRATOR"); return <CaseWorkspace user={user} basePath="/arbitrator" /> }
