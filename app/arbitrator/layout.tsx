import { RoleShell } from "@/components/portal/role-shell"
import { requireRole } from "@/lib/authorization"
import { arbitratorNavigation } from "@/lib/navigation"

export default async function ArbitratorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ARBITRATOR")
  return <RoleShell navigation={arbitratorNavigation} roleLabel="Arbitrator" workspaceLabel="Tribunal workspace" userName={user.name ?? "Justice R. Mehta"} userInitials="RM" searchPlaceholder="Search assigned matters, hearings, documents...">{children}</RoleShell>
}
