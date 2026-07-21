import {
  BookOpen,
  Building2,
  CalendarDays,
  FileCheck2,
  FileText,
  Gauge,
  Scale,
  Settings,
  Users,
} from 'lucide-react'

export const adminNavigation = [
  { label: 'Overview', href: '/admin', icon: Gauge },
  { label: 'Cases', href: '/admin/cases', icon: FileText, count: 12 },
  { label: 'Empanelment', href: '/admin/empanelment', icon: FileCheck2, count: 6 },
  { label: 'Arbitrators', href: '/admin/arbitrators', icon: Users },
  { label: 'Parties & counsel', href: '/admin/parties', icon: Users },
  { label: 'Referrals', href: '/admin/referrals', icon: FileText },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
  { label: 'Hearings', href: '/admin/hearings', icon: CalendarDays, count: 3 },
  { label: 'Facilities', href: '/admin/facilities', icon: Building2 },
  { label: 'Resources & CMS', href: '/admin/resources', icon: BookOpen },
  { label: 'Fee schedules', href: '/admin/fees', icon: Scale },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export const arbitratorNavigation = [
  { label: 'Overview', href: '/arbitrator', icon: 'Gauge' as const },
  { label: 'Assigned matters', href: '/arbitrator#matters', icon: 'Gavel' as const, count: 3 },
  { label: 'Hearings', href: '/arbitrator#hearings', icon: 'CalendarDays' as const, count: 2 },
  { label: 'Documents', href: '/arbitrator#documents', icon: 'FileText' as const, count: 6 },
  { label: 'Orders & awards', href: '/arbitrator#orders', icon: 'ClipboardCheck' as const },
  { label: 'Availability', href: '/arbitrator/profile#availability', icon: 'CalendarDays' as const },
  { label: 'Professional profile', href: '/arbitrator/profile', icon: 'UserRound' as const },
]

export const partyNavigation = [
  { label: 'Overview', href: '/portal', icon: 'Gauge' as const },
  { label: 'My matters', href: '/portal#matters', icon: 'Gavel' as const, count: 3 },
  { label: 'File a matter', href: '/portal/cases/new', icon: 'FilePlus2' as const },
  { label: 'Hearings', href: '/portal#hearings', icon: 'CalendarDays' as const, count: 2 },
  { label: 'Documents', href: '/portal#documents', icon: 'FileText' as const, count: 6 },
  { label: 'Fees & deposits', href: '/portal#fees', icon: 'CircleDollarSign' as const },
  { label: 'Account & counsel', href: '/portal#account', icon: 'UserRound' as const },
]

export const publicNavigation = [
  { label: 'Services', href: '/#services' },
  { label: 'Arbitrators', href: '/#panel' },
  { label: 'Resources', href: '/#resources' },
  { label: 'Facilities', href: '/#facilities' },
]
