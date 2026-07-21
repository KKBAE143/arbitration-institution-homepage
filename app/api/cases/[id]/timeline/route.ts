import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/server-utils"

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return apiError("Unauthorized", 401)
  const { id } = await context.params
  const record = await prisma.case.findFirst({ where: { id, ...(session.user.role === "PARTY" ? { partyId: session.user.id } : session.user.role === "ARBITRATOR" ? { arbitrators: { some: { arbitrator: { userId: session.user.id } } } } : {}) }, select: { statusHistory: { orderBy: { changedAt: "desc" } }, bookings: { where: { status: "CONFIRMED", startTime: { gte: new Date() } }, select: { id: true, startTime: true, endTime: true, bookingType: true, virtualMeetingUrl: true, facility: { select: { name: true } } }, orderBy: { startTime: "asc" } } } })
  if (!record) return apiError("Case not found", 404)
  return Response.json({ statusHistory: record.statusHistory, upcomingHearings: record.bookings })
}
