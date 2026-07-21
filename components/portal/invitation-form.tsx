"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
export function InvitationForm(){const [message,setMessage]=useState("");async function submit(data:FormData){const response=await fetch("/api/admin/invitations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(data))});const body=await response.json();setMessage(response.ok?`Invitation created for ${body.email}`:(body.error??"Unable to create invitation"))}return <form action={submit} className="flex flex-col gap-4"><div className="flex flex-col gap-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required/></div><div className="flex flex-col gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required/></div><Button type="submit">Send account invitation</Button>{message&&<p role="status" className="text-sm text-muted-foreground">{message}</p>}</form>}
