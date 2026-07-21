import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { apiError, createSetupToken } from "@/lib/server-utils"
import { sendMail } from "@/lib/mailer"
import { z } from "zod"
import { hash } from "bcryptjs"

const schema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional() })
export async function POST(request: Request) {
  const session = await auth(); if (session?.user.role !== "ADMIN") return apiError("Unauthorized", 401)
  try {
    const data = schema.parse(await request.json()); const { token, hash: setupTokenHash } = createSetupToken()
    const user = await prisma.user.create({ data: { ...data, email: data.email.toLowerCase(), role: "PARTY", passwordHash: await hash(crypto.randomUUID(), 12), setupTokenHash, setupTokenExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000) }, select: { id: true, email: true } })
    const url = `${process.env.APP_URL ?? new URL(request.url).origin}/account/setup?token=${token}`
    await sendMail({ to: user.email, subject: "Your ICA portal invitation", text: `Set your password within 72 hours: ${url}` })
    return Response.json(user, { status: 201 })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Could not create invitation") }
}
