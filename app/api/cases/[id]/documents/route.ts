import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { documentSchema } from "@/lib/validations"
import { apiError, assertFileSize } from "@/lib/server-utils"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return apiError("Unauthorized", 401)
  const { id } = await context.params
  const record = await prisma.case.findFirst({ where: { id, ...(session.user.role === "PARTY" ? { partyId: session.user.id } : session.user.role === "ARBITRATOR" ? { arbitrators: { some: { arbitrator: { userId: session.user.id } } } } : {}) } })
  if (!record) return apiError("Case not found", 404)
  try {
    const data = documentSchema.parse(await request.json())
    const allowed = session.user.role === "ADMIN" || (session.user.role === "PARTY" && ["FILING", "EVIDENCE"].includes(data.documentType)) || (session.user.role === "ARBITRATOR" && ["ORDER", "AWARD"].includes(data.documentType))
    if (!allowed) return apiError("Document type is not permitted for this role", 403)
    assertFileSize(data.contentBase64)
    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.caseDocument.create({ data: { ...data, caseId: id, uploadedByUserId: session.user.id }, select: { id: true, fileName: true, mimeType: true, documentType: true, createdAt: true } })
      if (data.documentType === "AWARD") { await tx.case.update({ where: { id }, data: { status: "AWARD_PASSED" } }); await tx.caseStatusHistory.create({ data: { caseId: id, status: "AWARD_PASSED", note: "Final award uploaded", changedByUserId: session.user.id } }) }
      return doc
    })
    return Response.json(document, { status: 201 })
  } catch (error) { return apiError(error instanceof Error ? error.message : "Invalid document") }
}
