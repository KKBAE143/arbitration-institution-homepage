"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Check, Clipboard, FileCheck2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export const modelClause = "Any dispute, controversy, or claim arising out of or relating to this contract, including its existence, validity, interpretation, performance, breach, or termination, shall be settled by arbitration in accordance with the Institutional Arbitration Rules of the Centre. The seat of arbitration shall be Hyderabad, India. The language of arbitration shall be English."

export function PanelSearch(){const [query,setQuery]=useState("");const router=useRouter();return <form onSubmit={event=>{event.preventDefault();router.push(`/arbitrators?q=${encodeURIComponent(query)}`)}} className="flex w-full max-w-2xl items-center gap-2 border border-border bg-card p-2"><Search className="ml-2 size-5 text-primary" aria-hidden="true"/><Input value={query} onChange={event=>setQuery(event.target.value)} className="border-0 bg-transparent shadow-none focus-visible:ring-0" placeholder="Search panel members by name, expertise, or background..." aria-label="Search arbitrators"/><Button type="submit" className="shrink-0">Search panel</Button></form>}

export function CopyClauseButton(){const [copied,setCopied]=useState(false);return <Button variant="outline" onClick={async()=>{await navigator.clipboard.writeText(modelClause);setCopied(true);window.setTimeout(()=>setCopied(false),2000)}}>{copied?<Check data-icon="inline-start"/>:<Clipboard data-icon="inline-start"/>}{copied?"Clause copied":"Copy to clipboard"}</Button>}

export function EmpanelmentDialog(){return <Dialog><DialogTrigger render={<Button variant="outline"/>}><FileCheck2 data-icon="inline-start"/>Review eligibility</DialogTrigger><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle className="font-serif text-xl">Empanelment eligibility</DialogTitle><DialogDescription>Applications are assessed independently by the Centre&apos;s credential committee.</DialogDescription></DialogHeader><div className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground"><p>Applicants should demonstrate substantial arbitration, judicial, commercial law, or sector-specific experience.</p><p>Submit qualifications, bar or judicial standing, professional references, conflict disclosures, and areas of expertise. Law firms and LLPs may apply as institutional partners.</p></div><Button render={<a href="/empanelment/apply"/>}>Begin application</Button></DialogContent></Dialog>}
