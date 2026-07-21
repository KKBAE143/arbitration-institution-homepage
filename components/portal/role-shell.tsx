"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { Bell, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, CircleHelp, ClipboardCheck, FilePlus2, FileText, Gauge, Gavel, Home, LogOut, Menu, Search, Scale, UserRound } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const roleIcons = { Gauge, Gavel, CalendarDays, FileText, ClipboardCheck, UserRound, FilePlus2, CircleDollarSign }
type RoleIconName = keyof typeof roleIcons
type NavigationItem = { label: string; href: string; icon: RoleIconName; count?: number }
type RoleShellProps = {
  children: React.ReactNode
  navigation: NavigationItem[]
  roleLabel: string
  workspaceLabel: string
  userName: string
  userInitials: string
  searchPlaceholder: string
}

function isActive(pathname: string, href: string) {
  const route = href.split("#")[0]
  return route === pathname || (route !== "/arbitrator" && route !== "/portal" && pathname.startsWith(`${route}/`))
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Scale className="size-5" /></span>{!compact && <span><strong className="block font-serif text-xl leading-tight">ICA Secretariat</strong><span className="block text-xs text-sidebar-foreground/65">Arbitration platform</span></span>}</div>
}

function Navigation({ navigation, compact = false, onNavigate }: { navigation: NavigationItem[]; compact?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  return <nav aria-label="Workspace navigation" className="flex flex-col gap-1">
    {navigation.map((item) => {
      const active = isActive(pathname, item.href)
      const Icon = roleIcons[item.icon]
      return <Link key={item.label} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={compact ? item.label : undefined} className={cn("flex min-h-11 items-center rounded-xl text-sm font-medium transition-colors", compact ? "justify-center px-2" : "gap-3 px-3", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground")}>
        <Icon className="size-5 shrink-0" />{!compact && <><span className="truncate">{item.label}</span>{item.count !== undefined && <Badge variant="secondary" className="ml-auto">{item.count}</Badge>}</>}
      </Link>
    })}
  </nav>
}

function SidebarFooter({ compact = false }: { compact?: boolean }) {
  return <div className="flex flex-col gap-1 border-t border-sidebar-border p-3">
    <Link href="/" title={compact ? "Public website" : undefined} className={cn("flex min-h-10 items-center rounded-lg text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", compact ? "justify-center" : "gap-3 px-2")}><Home className="size-5" />{!compact && "Public website"}</Link>
    <Link href="/#contact" title={compact ? "Help & support" : undefined} className={cn("flex min-h-10 items-center rounded-lg text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", compact ? "justify-center" : "gap-3 px-2")}><CircleHelp className="size-5" />{!compact && "Help & support"}</Link>
  </div>
}

export function RoleShell({ children, navigation, roleLabel, workspaceLabel, userName, userInitials, searchPlaceholder }: RoleShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  return <div className="flex h-dvh overflow-hidden bg-background">
    <aside className={cn("hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] lg:flex", collapsed ? "w-20" : "w-72")}>
      <div className={cn("flex h-20 items-center border-b border-sidebar-border", collapsed ? "justify-center px-3" : "px-5")}><Brand compact={collapsed} /></div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">{!collapsed && <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/55">{workspaceLabel}</p>}<Navigation navigation={navigation} compact={collapsed} /></div>
      <SidebarFooter compact={collapsed} />
      <Button variant="ghost" className={cn("m-3 text-sidebar-foreground/65", collapsed ? "justify-center" : "justify-start")} onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight /> : <><ChevronLeft data-icon="inline-start" />Collapse sidebar</>}</Button>
    </aside>

    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-20 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation" />}><Menu /></SheetTrigger>
          <SheetContent side="left" className="w-80 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
            <SheetHeader className="border-b border-sidebar-border p-5"><SheetTitle className="text-sidebar-foreground"><Brand /></SheetTitle><SheetDescription className="text-sidebar-foreground/65">{workspaceLabel}</SheetDescription></SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-3"><Navigation navigation={navigation} onNavigate={() => setMobileOpen(false)} /></div><SidebarFooter />
          </SheetContent>
        </Sheet>
        <div className="relative hidden max-w-xl flex-1 md:block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={searchPlaceholder} placeholder={searchPlaceholder} className="pl-9" /></div>
        <div className="ml-auto flex items-center gap-2"><ThemeToggle /><Badge variant="outline" className="hidden sm:inline-flex">Demo mode</Badge><Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell /><span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" /></Button><div className="hidden items-center gap-2 sm:flex"><Avatar className="size-9"><AvatarFallback>{userInitials}</AvatarFallback></Avatar><span className="hidden lg:block"><strong className="block max-w-36 truncate text-sm font-medium">{userName}</strong><span className="block text-xs text-muted-foreground">{roleLabel}</span></span></div><Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => signOut({ callbackUrl: "/login" })}><LogOut /></Button></div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  </div>
}
