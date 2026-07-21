import { prisma } from "@/lib/prisma"
import { referralSchema } from "@/lib/validations"
import { apiError } from "@/lib/server-utils"
import { sendMail } from "@/lib/mailer"

export async function POST(request: Request) {
  try {
    const data = referralSchema.parse(await request.json())
    const referral = await prisma.disputeReferral.create({ data, select: { id: true, status: true } })
    await Promise.all([sendMail({ to: data.referrerEmail, subject: "Dispute referral received", text: `Reference: ${referral.id}` }), sendMail({ to: process.env.ADMIN_NOTIFICATION_EMAIL ?? "admin@ica.local", subject: "New dispute referral", text: `${data.referrerName} submitted ${referral.id}` })])
    return Response.json(referral, { status: 201 })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid referral") }
}
