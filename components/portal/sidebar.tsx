'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, Gavel, HelpCircle, Home, PanelLeftClose } from 'lucide-react'
import { adminNavigation } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function PortalSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside className={cn('sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex', collapsed ? 'w-20' : 'w-64')}>
      <a href="/admin" className="flex h-20 items-center border-b px-5">
        <div className="flex min-w-0 items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Gavel /></div>{!collapsed && <div className="min-w-0"><p className="font-serif text-lg font-semibold leading-none">ICA Secretariat</p><p className="mt-1 text-xs text-sidebar-foreground/65">Arbitration platform</p></div>}</div>
      </a>
      <nav aria-label="Admin navigation" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className={cn('px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/65', collapsed && 'sr-only')}>Workspace</p>
        {adminNavigation.map((item, index) => {
          const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
          return <a key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent', active && 'bg-sidebar-accent text-sidebar-accent-foreground', !active && index > 5 && 'text-sidebar-foreground/65', collapsed && 'justify-center px-0')} title={collapsed ? item.label : undefined}><item.icon className="size-5 shrink-0" /><span className={cn('flex-1 text-left', collapsed && 'sr-only')}>{item.label}</span>{!collapsed && item.count && <span className="rounded-md bg-background px-1.5 py-0.5 text-xs text-sidebar-foreground/65">{item.count}</span>}</a>
        })}
      </nav>
      <div className="border-t p-3">
        <a href="/" className={cn('mb-2 flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-foreground', collapsed && 'justify-center px-0')}><Home className="size-5" /><span className={collapsed ? 'sr-only' : undefined}>Public website</span></a>
        <button className={cn('mb-2 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-foreground', collapsed && 'justify-center px-0')}><HelpCircle className="size-5" /><span className={collapsed ? 'sr-only' : undefined}>Help & support</span></button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftClose className="rotate-180" /> : <ChevronLeft />}{!collapsed && 'Collapse sidebar'}</Button>
      </div>
    </aside>
  )
}
