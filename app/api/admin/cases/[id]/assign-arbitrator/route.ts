import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { tribunalSchema } from "@/lib/validations"
import { apiError } from "@/lib/server-utils"
import { sendMail } from "@/lib/mailer"
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (session?.user.role !== "ADMIN") return apiError("Unauthorized", 401)
  const { id } = await context.params
  try {
    const data = tribunalSchema.parse(await request.json()); const record = await prisma.case.findUnique({ where: { id } }); if (!record) return apiError("Case not found", 404)
    const emergency = data.appointments[0].role === "EMERGENCY_ARBITRATOR"
    if (emergency && !record.isEmergency) return apiError("Emergency appointment is only available for emergency cases", 409)
    if (!emergency && record.status !== "UNDER_REVIEW") return apiError("The case must be under review before tribunal constitution", 409)
    const assigned = await prisma.$transaction(async (tx) => { await tx.caseArbitrator.createMany({ data: data.appointments.map((a) => ({ ...a, caseId: id })) }); if (!emergency) { await tx.case.update({ where: { id }, data: { status: "ARBITRATOR_ASSIGNED" } }); await tx.caseStatusHistory.create({ data: { caseId: id, status: "ARBITRATOR_ASSIGNED", note: "Tribunal constituted", changedByUserId: session.user.id } }) } return tx.arbitratorProfile.findMany({ where: { id: { in: data.appointments.map((a) => a.arbitratorId) } }, select: { user: { select: { email: true } } } }) })
    await Promise.all(assigned.map((a) => sendMail({ to: a.user.email, subject: `Appointment to ${record.caseNumber}`, text: `You have been appointed in ${record.title}.` })))
    return Response.json({ assigned: data.appointments.length }, { status: 201 })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid assignment") }
}
