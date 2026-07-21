"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNavigation } from "@/components/public/mobile-navigation"
import { ThemeToggle } from "@/components/theme-toggle"

type MenuName = "about" | "explore" | "arbitrators" | "resources" | "facilities"
type Menu = { label: string; eyebrow: string; title: string; description: string; groups: { title: string; links: { label: string; href: string; note: string }[] }[] }

const menus: Record<MenuName, Menu> = {
  about: { label: "About", eyebrow: "The institution", title: "Purpose, governance and people", description: "Learn how the Centre supports fair and efficient dispute resolution.", groups: [
    { title: "The Centre", links: [{ label: "About the Centre", href: "/about", note: "Mandate and institutional approach" }, { label: "Leadership & Governance", href: "/about#governance", note: "Standards, oversight and independence" }] },
    { title: "Work with us", links: [{ label: "Panel of Arbitrators", href: "/arbitrators", note: "Meet our distinguished legal experts" }, { label: "Join the Panel", href: "/empanelment/apply", note: "Apply for arbitrator empanelment" }] },
    { title: "Quick access", links: [{ label: "Contact & Location", href: "/about#contact", note: "Visit or speak with the secretariat" }, { label: "Case Portal", href: "/login", note: "Secure access for case participants" }] },
  ] },
  explore: { label: "Explore", eyebrow: "Navigate the Centre", title: "Institutional services and guidance", description: "Independent administration for efficient commercial dispute resolution.", groups: [
    { title: "The Centre", links: [{ label: "About the Centre", href: "/about", note: "Our mandate and institutional approach" }, { label: "Panel of Arbitrators", href: "/arbitrators", note: "Explore distinguished legal experts" }, { label: "Join the Panel", href: "/empanelment/apply", note: "Apply for arbitrator empanelment" }] },
    { title: "Dispute Services", links: [{ label: "Refer a Dispute", href: "/refer-dispute", note: "Start an institutional reference" }, { label: "Model Arbitration Clause", href: "/model-clause", note: "Contract-ready drafting guidance" }, { label: "Case Portal", href: "/login", note: "Track matters and exchange records" }] },
    { title: "Rules & Infrastructure", links: [{ label: "Rules & Resources", href: "/resources", note: "Procedures, schedules and downloads" }, { label: "Facilities & Technology", href: "/facilities", note: "Hearing rooms and virtual support" }, { label: "Book a Facility", href: "/facilities/book", note: "Request a hearing suite or VC setup" }] },
  ] },
  arbitrators: { label: "Arbitrators", eyebrow: "Arbitral panel", title: "Expertise for complex disputes", description: "Discover experienced practitioners and pathways to join the panel.", groups: [
    { title: "Find expertise", links: [{ label: "Browse Arbitrators", href: "/arbitrators", note: "Search the institutional panel" }, { label: "Practice Specialisms", href: "/arbitrators#specialisms", note: "Find relevant sector experience" }] },
    { title: "Empanelment", links: [{ label: "Apply to Join", href: "/empanelment/apply", note: "Submit an empanelment application" }, { label: "Selection Process", href: "/about#empanelment", note: "Review criteria and governance" }] },
    { title: "For members", links: [{ label: "Arbitrator Portal", href: "/login", note: "Cases, availability and profile" }, { label: "Rules & Guidance", href: "/resources", note: "Procedural reference materials" }] },
  ] },
  resources: { label: "Resources", eyebrow: "Knowledge centre", title: "Rules, clauses and practical guidance", description: "Authoritative materials for parties, counsel and arbitrators.", groups: [
    { title: "Rules", links: [{ label: "Rules & Procedures", href: "/resources", note: "Current institutional framework" }, { label: "Fee Schedule", href: "/resources#fees", note: "Administrative and tribunal fees" }] },
    { title: "Drafting", links: [{ label: "Model Arbitration Clause", href: "/model-clause", note: "Recommended contract language" }, { label: "Refer a Dispute", href: "/refer-dispute", note: "Begin a new reference" }] },
    { title: "Downloads", links: [{ label: "Resource Library", href: "/resources", note: "Forms, schedules and publications" }, { label: "Case Portal", href: "/login", note: "Access matter-specific documents" }] },
  ] },
  facilities: { label: "Facilities", eyebrow: "Hearings & technology", title: "Purpose-built spaces for proceedings", description: "Professional hearing rooms, virtual support and secretarial assistance.", groups: [
    { title: "Spaces", links: [{ label: "Explore Facilities", href: "/facilities", note: "Rooms, capacity and amenities" }, { label: "Virtual Hearings", href: "/facilities#technology", note: "Secure video and hybrid support" }] },
    { title: "Plan a hearing", links: [{ label: "Book a Facility", href: "/facilities/book", note: "Request dates and requirements" }, { label: "Indicative Rates", href: "/facilities#rates", note: "Review venue and service rates" }] },
    { title: "Assistance", links: [{ label: "Secretarial Support", href: "/facilities#support", note: "Administrative help for proceedings" }, { label: "Contact the Centre", href: "/about#contact", note: "Discuss a tailored setup" }] },
  ] },
}

export function PublicHeader() {
  const [activeMenu, setActiveMenu] = useState<MenuName | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeButton = useRef<HTMLButtonElement | null>(null)
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current) }
  const closeMenu = () => { cancelClose(); setActiveMenu(null) }
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setActiveMenu(null), 180) }
  const openMenu = (name: MenuName, button?: HTMLButtonElement | null) => { cancelClose(); if (button) activeButton.current = button; setActiveMenu(name) }

  useEffect(() => {
    if (!activeMenu) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { closeMenu(); activeButton.current?.focus() } }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [activeMenu])
  useEffect(() => () => cancelClose(), [])

  const menu = activeMenu ? menus[activeMenu] : null
  return <>
    {menu && <button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-30 hidden cursor-default bg-background/70 backdrop-blur-xl motion-safe:animate-in motion-safe:fade-in lg:block" onClick={closeMenu} />}
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur" onMouseLeave={scheduleClose}>
      <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={closeMenu}><span className="flex size-10 shrink-0 items-center justify-center border border-primary text-primary"><Scale className="size-5" /></span><span className="hidden max-w-56 font-serif text-sm font-bold leading-tight sm:block">Arbitration &amp; Dispute Resolution Centre</span></Link>
        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Primary navigation" onMouseEnter={cancelClose}>
          {(Object.entries(menus) as [MenuName, Menu][]).map(([name, item]) => <button key={name} type="button" className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary aria-expanded:text-primary" aria-expanded={activeMenu === name} aria-controls="public-mega-menu" onMouseEnter={(event) => openMenu(name, event.currentTarget)} onFocus={(event) => openMenu(name, event.currentTarget)} onClick={(event) => openMenu(name, event.currentTarget)}>{item.label}<ChevronDown className={`size-3 transition-transform motion-reduce:transition-none ${activeMenu === name ? "rotate-180" : ""}`} /></button>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex"><ThemeToggle /><Button variant="outline" size="sm" render={<Link href="/login" />}>Portal Login</Button><Button size="sm" render={<Link href="/refer-dispute" />}>Refer a Dispute</Button></div>
        <div className="ml-auto flex items-center gap-2 lg:hidden"><ThemeToggle /><MobileNavigation /></div>
      </div>
      {menu && <div id="public-mega-menu" className="absolute inset-x-0 top-full border-b border-border bg-card/98 shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="flex items-end justify-between gap-10 border-b border-border pb-6"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{menu.eyebrow}</p><h2 className="mt-2 font-serif text-3xl font-semibold text-balance">{menu.title}</h2></div><p className="max-w-80 text-right text-sm leading-6 text-muted-foreground">{menu.description}</p></div>
          <div className="grid grid-cols-3 gap-10 pt-6">{menu.groups.map((group) => <section key={group.title}><h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">{group.title}</h3><div className="mt-3 flex flex-col gap-1">{group.links.map((link) => <Link key={`${group.title}-${link.label}`} href={link.href} className="group border-l border-transparent px-4 py-2.5 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:border-primary focus-visible:bg-primary/5" onClick={closeMenu}><span className="block text-sm font-medium transition-colors group-hover:text-primary">{link.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{link.note}</span></Link>)}</div></section>)}</div>
        </div>
      </div>}
    </header>
  </>
}
