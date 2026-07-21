import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export type AppRole = "ADMIN" | "ARBITRATOR" | "PARTY"
export type AuthenticatedUser = { id: string; role: AppRole; email?: string | null; name?: string | null }

export async function requireRole(role: AppRole) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== role) redirect(session.user.role === "ADMIN" ? "/admin" : session.user.role === "ARBITRATOR" ? "/arbitrator" : "/portal")
  return session.user
}

export async function requireApiUser(roles?: AppRole[]) {
  const user = (await auth())?.user
  if (!user) return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) } as const
  if (roles && !roles.includes(user.role)) return { response: Response.json({ error: "Forbidden" }, { status: 403 }) } as const
  return { user: user as AuthenticatedUser } as const
}

export function caseAccessWhere(caseId: string, user: { id: string; role: string }) {
  return {
    id: caseId,
    ...(user.role === "PARTY"
      ? { partyId: user.id }
      : user.role === "ARBITRATOR"
        ? { arbitrators: { some: { arbitrator: { userId: user.id } } } }
        : {}),
  }
}

export async function findAccessibleCase(caseId: string, user: { id: string; role: string }) {
  return prisma.case.findFirst({ where: caseAccessWhere(caseId, user) })
}

export async function accessibleCase(caseId: string, user: { id: string; role: string }) {
  const record = await findAccessibleCase(caseId, user)
  if (!record) notFound()
  return record
}
