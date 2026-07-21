import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validations"
import { apiError } from "@/lib/server-utils"
import { z } from "zod"
import { rateLimitResponse } from "@/lib/rate-limit"

const availabilitySchema = z.object({ facilityId: z.string().min(1), startTime: z.coerce.date(), endTime: z.coerce.date() }).refine((value) => value.endTime > value.startTime)

async function hasOverlap(facilityId: string, startTime: Date, endTime: Date) {
  return Boolean(await prisma.facilityBooking.findFirst({
    where: { facilityId, status: "CONFIRMED", startTime: { lt: endTime }, endTime: { gt: startTime } },
    select: { id: true },
  }))
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const data = availabilitySchema.parse(Object.fromEntries(url.searchParams))
    return Response.json({ available: !(await hasOverlap(data.facilityId, data.startTime, data.endTime)) })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Invalid availability query")
  }
}

export async function POST(request: Request) {
  try {
    const data = bookingSchema.parse(await request.json())
    const session = await auth()
    if (!data.caseId) {
      const limited = rateLimitResponse(request, "booking", 10)
      if (limited) return limited
    }
    if (data.caseId && (!session?.user || session.user.role !== "PARTY")) return apiError("Authentication required", 401)
    if (data.caseId && !(await prisma.case.findFirst({ where: { id: data.caseId, partyId: session!.user.id } }))) return apiError("Case not found", 404)
    const facility = await prisma.facility.findFirst({ where: { id: data.facilityId, isActive: true }, select: { id: true } })
    if (!facility) return apiError("Facility not found", 404)
    if (await hasOverlap(data.facilityId, data.startTime, data.endTime)) return apiError("The facility is unavailable for this time", 409)
    const booking = await prisma.facilityBooking.create({ data: { ...data, source: data.caseId ? "CASE_LINKED" : "EXTERNAL_PUBLIC", isPriority: Boolean(data.caseId) }, select: { id: true, status: true } })
    return Response.json(booking, { status: 201 })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid request") }
}
