import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

export default async function Page() {
  await requireRole("ADMIN")
  const resources = await prisma.resource.findMany({ select: { id: true, title: true, category: true, fileName: true, mimeType: true, isPublished: true, updatedAt: true }, orderBy: { updatedAt: "desc" } })
  return <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8"><header><p className="text-sm text-muted-foreground">Publishing</p><h1 className="font-serif text-4xl font-semibold">Resources</h1><p className="mt-2 text-muted-foreground">Published institutional documents stored in the on-premise database.</p></header><Card><CardHeader><CardTitle>Resource library</CardTitle><CardDescription>{resources.filter((item) => item.isPublished).length} published resources</CardDescription></CardHeader><CardContent className="overflow-x-auto px-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Title</TableHead><TableHead>Category</TableHead><TableHead>Updated</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Download</span></TableHead></TableRow></TableHeader><TableBody>{resources.map((resource) => <TableRow key={resource.id}><TableCell className="pl-6"><p className="font-medium">{resource.title}</p><p className="text-sm text-muted-foreground">{resource.fileName}</p></TableCell><TableCell>{resource.category.replaceAll("_", " ")}</TableCell><TableCell>{resource.updatedAt.toLocaleDateString("en-IN")}</TableCell><TableCell><Badge variant={resource.isPublished ? "secondary" : "outline"}>{resource.isPublished ? "Published" : "Draft"}</Badge></TableCell><TableCell><Button render={<Link href={`/api/public/resources/${resource.id}`} />} size="sm" variant="ghost">Download</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></main>
}
