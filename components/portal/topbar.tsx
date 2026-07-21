'use client'

import { usePathname } from 'next/navigation'
import { Bell, Home, LogOut, Menu, Search } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { adminNavigation } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'

export function Topbar() {
  const pathname = usePathname()
  return (
    <header className="flex h-20 items-center justify-between gap-4 border-b bg-background px-4 md:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation"><Menu /></Button>} />
          <SheetContent side="left" className="p-6">
            <SheetTitle className="font-serif">ICA Secretariat</SheetTitle>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile Admin navigation">
              {adminNavigation.map((item) => {
                const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
                return <a key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted', active && 'bg-secondary text-secondary-foreground')}><item.icon className="size-5" />{item.label}</a>
              })}
              <a href="/" className="mt-4 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted"><Home className="size-5" />Public website</a>
            </nav>
          </SheetContent>
        </Sheet>
        <a href="/admin" className="font-serif font-semibold">ICA</a>
      </div>
      <div className="relative hidden w-full max-w-md md:block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-10 bg-muted pl-9" aria-label="Search cases, people, and documents" placeholder="Search cases, people, documents..." /><kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 text-xs text-muted-foreground">⌘ K</kbd></div>
      <div className="ml-auto flex items-center gap-2"><ThemeToggle className="theme-toggle-glow" /><Badge variant="outline" className="hidden sm:inline-flex">Demo Secretariat</Badge><Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell /><span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" /></Button><div className="mx-1 h-8 w-px bg-border" /><div className="flex items-center gap-2 rounded-lg p-1.5 text-left"><Avatar className="size-8"><AvatarFallback>AM</AvatarFallback></Avatar><span className="hidden md:block"><strong className="block text-sm font-medium">Ananya Mehra</strong><span className="block text-xs text-muted-foreground">Demo administrator</span></span></div><Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => signOut({ callbackUrl: '/login' })}><LogOut /></Button></div>
    </header>
  )
}
