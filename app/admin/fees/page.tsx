import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export default async function Page() {
  await requireRole("ADMIN")
  const [schedules, paymentSummary] = await Promise.all([prisma.feeSchedule.findMany({ orderBy: [{ isActive: "desc" }, { effectiveDate: "desc" }] }), prisma.feePayment.groupBy({ by: ["status"], _count: true })])
  return <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8"><header><p className="text-sm text-muted-foreground">Financial configuration</p><h1 className="font-serif text-4xl font-semibold">Fee schedules</h1><p className="mt-2 text-muted-foreground">Maintain institutional rates and review manually reconciled payment records.</p></header><section className="grid gap-4 sm:grid-cols-3">{paymentSummary.map((item) => <Card key={item.status}><CardHeader><CardDescription>{item.status.replaceAll("_", " ")}</CardDescription><CardTitle className="font-serif text-3xl">{item._count}</CardTitle></CardHeader></Card>)}</section><Card><CardHeader><CardTitle>Schedules</CardTitle><CardDescription>{schedules.length} configured fee items</CardDescription></CardHeader><CardContent className="overflow-x-auto px-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Fee</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Effective</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{schedules.map((schedule) => <TableRow key={schedule.id}><TableCell className="pl-6 font-medium">{schedule.label}</TableCell><TableCell>{schedule.category.replaceAll("_", " ")}</TableCell><TableCell>{schedule.currency} {schedule.amount.toString()}</TableCell><TableCell>{schedule.effectiveDate.toLocaleDateString("en-IN")}</TableCell><TableCell><Badge variant={schedule.isActive ? "secondary" : "outline"}>{schedule.isActive ? "Active" : "Inactive"}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></main>
}
