import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export default async function Page() {
  await requireRole("ADMIN")
  const facilities = await prisma.facility.findMany({ include: { _count: { select: { bookings: true } } }, orderBy: [{ isActive: "desc" }, { name: "asc" }] })
  return <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
    <header><p className="text-sm text-muted-foreground">Venue management</p><h1 className="font-serif text-4xl font-semibold text-balance">Facilities</h1><p className="mt-2 text-muted-foreground">Manage active hearing rooms and monitor booking demand.</p></header>
    <Card><CardHeader><CardTitle>Facility inventory</CardTitle><CardDescription>{facilities.length} configured facilities</CardDescription></CardHeader><CardContent className="overflow-x-auto px-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Facility</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead><TableHead>Rate</TableHead><TableHead>Bookings</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{facilities.map((facility) => <TableRow key={facility.id}><TableCell className="pl-6 font-medium">{facility.name}</TableCell><TableCell>{facility.type.replaceAll("_", " ")}</TableCell><TableCell>{facility.capacity ?? "—"}</TableCell><TableCell>{facility.indicativeRate ? `${facility.indicativeRate.toString()} INR` : "On request"}</TableCell><TableCell>{facility._count.bookings}</TableCell><TableCell><Badge variant={facility.isActive ? "secondary" : "outline"}>{facility.isActive ? "Active" : "Inactive"}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </main>
}
