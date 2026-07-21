import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export default async function Page() {
  await requireRole("ADMIN")
  const cases = await prisma.case.findMany({ include: { party: { select: { name: true } }, _count: { select: { documents: true, bookings: true } } }, orderBy: { updatedAt: "desc" } })
  return <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8"><header><p className="text-sm text-muted-foreground">Case administration</p><h1 className="font-serif text-4xl font-semibold">Cases</h1><p className="mt-2 text-muted-foreground">Review every filed matter, procedural stage, and supporting record.</p></header><Card><CardHeader><CardTitle>Case docket</CardTitle><CardDescription>{cases.filter((item) => item.status !== "CLOSED").length} active matters</CardDescription></CardHeader><CardContent className="overflow-x-auto px-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Matter</TableHead><TableHead>Party</TableHead><TableHead>Claim</TableHead><TableHead>Records</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader><TableBody>{cases.map((item) => <TableRow key={item.id}><TableCell className="pl-6"><p className="font-medium">{item.title}</p><p className="font-mono text-xs text-muted-foreground">{item.caseNumber}</p></TableCell><TableCell>{item.party.name}</TableCell><TableCell>INR {Number(item.claimAmount).toLocaleString("en-IN")}</TableCell><TableCell>{item._count.documents} documents · {item._count.bookings} bookings</TableCell><TableCell><Badge variant="outline">{item.status.replaceAll("_", " ")}</Badge></TableCell><TableCell><Button render={<Link href={`/admin/cases/${item.id}`} />} size="sm" variant="ghost">Open</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></main>
}
