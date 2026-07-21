import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, createSetupToken } from "@/lib/server-utils"
import { sendMail } from "@/lib/mailer"
import { hash } from "bcryptjs"
import { z } from "zod"
const schema = z.object({ stage: z.enum(["DOCUMENT_VERIFIED", "INTERVIEW_SCHEDULED", "APPROVED", "REJECTED"]), reviewerNotes: z.string().optional(), interviewScheduledAt: z.coerce.date().optional() })
const allowed: Record<string, string[]> = { APPLIED: ["DOCUMENT_VERIFIED", "REJECTED"], DOCUMENT_VERIFIED: ["INTERVIEW_SCHEDULED", "REJECTED"], INTERVIEW_SCHEDULED: ["APPROVED", "REJECTED"] }
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (session?.user.role !== "ADMIN") return apiError("Unauthorized", 401)
  const { id } = await context.params
  try {
    const data = schema.parse(await request.json()); const application = await prisma.empanelmentApplication.findUnique({ where: { id } }); if (!application) return apiError("Application not found", 404)
    if (!allowed[application.stage]?.includes(data.stage)) return apiError(`Transition from ${application.stage} to ${data.stage} is not allowed`, 409)
    let setupToken: string | undefined
    await prisma.$transaction(async (tx) => {
      await tx.empanelmentApplication.update({ where: { id }, data })
      if (data.stage === "APPROVED") { const generated = createSetupToken(); setupToken = generated.token; const user = await tx.user.create({ data: { email: application.applicantEmail.toLowerCase(), name: application.applicantName, phone: application.applicantPhone, role: "ARBITRATOR", passwordHash: await hash(crypto.randomUUID(), 12), setupTokenHash: generated.hash, setupTokenExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000) } }); const slug = `${application.applicantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(-5)}`; await tx.arbitratorProfile.create({ data: { userId: user.id, slug, bio: application.professionalBackground, applicationId: id, empanelmentStatus: "APPROVED", specializations: { create: (application.proposedSpecializations as string[]).map((specialization) => ({ specialization: specialization as never })) } } }) }
    })
    const suffix = setupToken ? ` Set up your account: ${process.env.APP_URL ?? new URL(request.url).origin}/account/setup?token=${setupToken}` : ""
    await sendMail({ to: application.applicantEmail, subject: `Empanelment update: ${data.stage.replaceAll("_", " ")}`, text: `Your application is now ${data.stage}.${suffix}` })
    return Response.json({ id, stage: data.stage })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid transition") }
}
