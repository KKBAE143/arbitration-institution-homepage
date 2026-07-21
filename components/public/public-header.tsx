"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNavigation } from "@/components/public/mobile-navigation"

const menuGroups = [
  { title: "The Centre", links: [{ label: "About the Centre", href: "/about", note: "Our mandate and institutional approach" }, { label: "Panel of Arbitrators", href: "/arbitrators", note: "Explore distinguished legal experts" }, { label: "Join the Panel", href: "/empanelment/apply", note: "Apply for arbitrator empanelment" }] },
  { title: "Dispute Services", links: [{ label: "Refer a Dispute", href: "/refer-dispute", note: "Start an institutional reference" }, { label: "Model Arbitration Clause", href: "/model-clause", note: "Contract-ready drafting guidance" }, { label: "Case Portal", href: "/login", note: "Track matters and exchange records" }] },
  { title: "Rules & Infrastructure", links: [{ label: "Rules & Resources", href: "/resources", note: "Procedures, schedules and downloads" }, { label: "Facilities & Technology", href: "/facilities", note: "Hearing rooms and virtual support" }, { label: "Book a Facility", href: "/facilities/book", note: "Request a hearing suite or VC setup" }] },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  function cancelClose() { if (closeTimer.current) clearTimeout(closeTimer.current) }
  function scheduleClose() { cancelClose(); closeTimer.current = setTimeout(() => setOpen(false), 140) }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus() }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  useEffect(() => () => cancelClose(), [])

  return <>
    {open && <button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-30 hidden cursor-default bg-background/45 backdrop-blur-md motion-safe:animate-in motion-safe:fade-in lg:block" onClick={() => setOpen(false)} />}
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}><span className="flex size-10 shrink-0 items-center justify-center border border-primary text-primary"><Scale className="size-5" /></span><span className="hidden max-w-56 font-serif text-sm font-bold leading-tight sm:block">Arbitration &amp; Dispute Resolution Centre</span></Link>
        <nav className="ml-auto hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          <Link href="/about" className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary">About</Link>
          <div className="relative" onMouseEnter={() => { cancelClose(); setOpen(true) }} onMouseLeave={scheduleClose} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose() }}>
            <button ref={buttonRef} type="button" className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary aria-expanded:text-primary" aria-expanded={open} aria-controls="public-mega-menu" onFocus={() => { cancelClose(); setOpen(true) }} onClick={() => { cancelClose(); setOpen(true) }}>Explore <ChevronDown className={`size-3 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} /></button>
            {open && <div id="public-mega-menu" className="absolute left-1/2 top-full mt-7 w-[min(780px,calc(100vw-3rem))] -translate-x-1/2 border border-border bg-card p-7 shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
              <div className="mb-6 flex items-end justify-between gap-6 border-b border-border pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Navigate the Centre</p><p className="mt-2 font-serif text-2xl">Institutional services and guidance</p></div><p className="max-w-56 text-right text-xs leading-5 text-muted-foreground">Independent administration for efficient commercial dispute resolution.</p></div>
              <div className="grid grid-cols-3 gap-7">{menuGroups.map((group) => <section key={group.title}><h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">{group.title}</h2><div className="mt-4 flex flex-col gap-1">{group.links.map((link) => <Link key={link.href} href={link.href} className="group border-l border-transparent px-3 py-2 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:border-primary focus-visible:bg-primary/5" onClick={() => setOpen(false)}><span className="block text-sm font-medium group-hover:text-primary">{link.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{link.note}</span></Link>)}</div></section>)}</div>
            </div>}
          </div>
          <Link href="/arbitrators" className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary">Arbitrators</Link>
          <Link href="/resources" className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary">Resources</Link>
          <Link href="/facilities" className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary">Facilities</Link>
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex"><Button variant="outline" size="sm" render={<Link href="/login" />}>Portal Login</Button><Button size="sm" render={<Link href="/refer-dispute" />}>Refer a Dispute</Button></div>
        <div className="ml-auto lg:hidden"><MobileNavigation /></div>
      </div>
    </header>
  </>
}
