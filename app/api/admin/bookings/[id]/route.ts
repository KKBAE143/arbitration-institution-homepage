import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/server-utils"
import { z } from "zod"

const schema = z.object({ status: z.enum(["CONFIRMED", "REJECTED", "CANCELLED"]), virtualMeetingUrl: z.string().url().optional().or(z.literal("")), assignedStaffName: z.string().optional() })
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (session?.user.role !== "ADMIN") return apiError("Unauthorized", 401)
  const { id } = await context.params
  try {
    const data = schema.parse(await request.json())
    const booking = await prisma.facilityBooking.findUnique({ where: { id } }); if (!booking) return apiError("Booking not found", 404)
    if (data.status === "CONFIRMED") {
      if (booking.bookingType !== "PHYSICAL_ROOM" && !data.virtualMeetingUrl) return apiError("A virtual meeting URL is required")
      const conflict = await prisma.facilityBooking.findFirst({ where: { id: { not: id }, facilityId: booking.facilityId, status: "CONFIRMED", startTime: { lt: booking.endTime }, endTime: { gt: booking.startTime } } })
      if (conflict) return apiError("This facility is already booked for the requested time", 409)
    }
    return Response.json(await prisma.facilityBooking.update({ where: { id }, data: { ...data, recordedByUserId: session.user.id } }))
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid update") }
}
