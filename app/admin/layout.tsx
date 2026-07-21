import { PortalSidebar } from '@/components/portal/sidebar'
import { Topbar } from '@/components/portal/topbar'
import { requireRole } from '@/lib/authorization'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('ADMIN')
  return <div className="flex h-dvh overflow-hidden bg-background"><PortalSidebar /><div className="flex min-w-0 flex-1 flex-col overflow-hidden"><Topbar /><div className="min-h-0 flex-1 overflow-y-auto">{children}</div></div></div>
}
