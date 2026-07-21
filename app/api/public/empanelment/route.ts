import { prisma } from "@/lib/prisma"
import { empanelmentSchema } from "@/lib/validations"
import { assertFileSize, apiError } from "@/lib/server-utils"
import { sendMail } from "@/lib/mailer"

export async function POST(request: Request) {
  try {
    const data = empanelmentSchema.parse(await request.json())
    data.documents.forEach((file) => assertFileSize(file.contentBase64))
    const application = await prisma.empanelmentApplication.create({ data: { applicantName: data.applicantName, applicantEmail: data.applicantEmail, applicantPhone: data.applicantPhone, professionalBackground: data.professionalBackground, proposedSpecializations: data.proposedSpecializations, documents: { create: data.documents } }, select: { id: true, stage: true } })
    await sendMail({ to: data.applicantEmail, subject: "Empanelment application received", text: `Your application ${application.id} has been received.` })
    return Response.json(application, { status: 201 })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid application") }
}
