import { findAccessibleCase, requireApiUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { parseBase64, safeFileName } from "@/lib/server-utils"

export async function GET(_: Request, context: { params: Promise<{ id: string; documentId: string }> }) {
  const authorization = await requireApiUser()
  if ("response" in authorization) return authorization.response
  const { id, documentId } = await context.params
  if (!(await findAccessibleCase(id, authorization.user))) return Response.json({ error: "Document not found" }, { status: 404 })
  const document = await prisma.caseDocument.findFirst({ where: { id: documentId, caseId: id } })
  if (!document) return Response.json({ error: "Document not found" }, { status: 404 })
  const { buffer } = parseBase64(document.contentBase64)
  return new Response(buffer, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": `attachment; filename="${safeFileName(document.fileName)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
