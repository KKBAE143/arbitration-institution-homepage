import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { caseSchema } from "@/lib/validations"
import { apiError, getNextCaseNumber } from "@/lib/server-utils"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "PARTY") return apiError("Unauthorized", 401)
  try {
    const data = caseSchema.parse(await request.json())
    const record = await prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear()
      const caseNumber = await getNextCaseNumber(() => tx.case.count({ where: { caseNumber: { startsWith: `ARB/${year}/` } } }))
      return tx.case.create({ data: { ...data, caseNumber, partyId: session.user.id, status: "FILED", statusHistory: { create: { status: "FILED", note: "Case filed through Party portal", changedByUserId: session.user.id } } }, select: { id: true, caseNumber: true, status: true } })
    })
    return Response.json(record, { status: 201 })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid filing") }
}
