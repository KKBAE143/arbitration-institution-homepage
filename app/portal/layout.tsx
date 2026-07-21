import { RoleShell } from "@/components/portal/role-shell"
import { requireRole } from "@/lib/authorization"
import { partyNavigation } from "@/lib/navigation"

export default async function PartyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("PARTY")
  return <RoleShell navigation={partyNavigation} roleLabel="Party & counsel" workspaceLabel="Case workspace" userName={user.name ?? "Aarav Sharma"} userInitials="AS" searchPlaceholder="Search matters, filings, hearings, documents...">{children}</RoleShell>
}
