import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validations"
import { apiError } from "@/lib/server-utils"

export async function POST(request: Request) {
  try {
    const data = bookingSchema.parse(await request.json())
    const session = await auth()
    if (data.caseId && (!session?.user || session.user.role !== "PARTY")) return apiError("Authentication required", 401)
    if (data.caseId && !(await prisma.case.findFirst({ where: { id: data.caseId, partyId: session!.user.id } }))) return apiError("Case not found", 404)
    const booking = await prisma.facilityBooking.create({ data: { ...data, source: data.caseId ? "CASE_LINKED" : "EXTERNAL_PUBLIC", isPriority: Boolean(data.caseId) }, select: { id: true, status: true } })
    return Response.json(booking, { status: 201 })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid request") }
}
