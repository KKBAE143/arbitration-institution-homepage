"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
export function CaseFilingForm(){ const router=useRouter(); const [error,setError]=useState(""); async function submit(formData:FormData){ setError(""); const response=await fetch("/api/cases",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(formData))}); const body=await response.json(); if(!response.ok){setError(body.error??"Unable to file matter");return} router.push(`/portal/cases/${body.id}`) } return <Card className="mx-auto max-w-2xl"><CardHeader><CardTitle className="font-serif text-2xl">File a new matter</CardTitle><CardDescription>Submit the essential case details. The Secretariat will review the filing and reconcile fees manually.</CardDescription></CardHeader><CardContent><form action={submit} className="flex flex-col gap-5">{[["title","Matter title"],["claimantName","Claimant"],["respondentName","Respondent"]].map(([name,label])=><div key={name} className="flex flex-col gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} required /></div>)}<div className="flex flex-col gap-2"><Label htmlFor="description">Dispute summary</Label><Textarea id="description" name="description" required /></div>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit">Submit filing</Button></form></CardContent></Card> }
