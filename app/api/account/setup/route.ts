import { prisma } from "@/lib/prisma"
import { apiError, hashToken } from "@/lib/server-utils"
import { hash } from "bcryptjs"
import { z } from "zod"
const schema = z.object({ token: z.string().min(32), password: z.string().min(10).regex(/[A-Z]/).regex(/[0-9]/) })
export async function POST(request: Request) {
  try {
    const data = schema.parse(await request.json())
    const user = await prisma.user.findFirst({ where: { setupTokenHash: hashToken(data.token), setupTokenExpiresAt: { gt: new Date() }, isActive: true } })
    if (!user) return apiError("This setup link is invalid or expired", 400)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(data.password, 12), setupTokenHash: null, setupTokenExpiresAt: null } })
    return Response.json({ success: true })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid request") }
}
