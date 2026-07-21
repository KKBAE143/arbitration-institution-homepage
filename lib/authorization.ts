import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function requireRole(role: "ADMIN" | "ARBITRATOR" | "PARTY") {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== role) redirect(session.user.role === "ADMIN" ? "/admin" : session.user.role === "ARBITRATOR" ? "/arbitrator" : "/portal")
  return session.user
}

export async function accessibleCase(caseId: string, user: { id: string; role: string }) {
  const record = await prisma.case.findFirst({ where: { id: caseId, ...(user.role === "PARTY" ? { partyId: user.id } : user.role === "ARBITRATOR" ? { arbitrators: { some: { arbitrator: { userId: user.id } } } } : {}) } })
  if (!record) notFound()
  return record
}
