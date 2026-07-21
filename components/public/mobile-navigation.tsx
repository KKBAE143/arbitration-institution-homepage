"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const publicLinks=[{label:"About Us",href:"/about"},{label:"Panel of Arbitrators",href:"/arbitrators"},{label:"Empanelment",href:"#empanelment"},{label:"Rules & Procedures",href:"#rules"},{label:"Fee Schedule",href:"#fees"},{label:"Model Clause",href:"#rules"},{label:"Facilities & Tech",href:"#facilities"}]

export function MobileNavigation(){return <Dialog><DialogTrigger render={<Button variant="outline" size="icon" className="lg:hidden"/>}><Menu/><span className="sr-only">Open navigation</span></DialogTrigger><DialogContent className="inset-y-0 right-0 left-auto top-0 h-dvh max-w-sm translate-x-0 translate-y-0 rounded-none p-6"><DialogTitle className="font-serif text-xl">Navigation</DialogTitle><nav className="flex flex-col gap-1" aria-label="Mobile navigation">{publicLinks.map(item=><DialogClose key={item.label} render={<Link href={item.href} className="border-b border-border py-4 text-sm font-medium"/>}>{item.label}</DialogClose>)}</nav><div className="mt-auto flex flex-col gap-3"><Button render={<Link href="/refer-dispute"/>}>Refer a Dispute</Button><Button variant="outline" render={<Link href="/login"/>}>Portal Login</Button></div></DialogContent></Dialog>}
