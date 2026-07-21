import { NextResponse } from "next/server"
import { z } from "zod"
import { findAccessibleCase, requireApiUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { canTransitionCase } from "@/lib/workflows"
const include={statusHistory:{orderBy:{changedAt:"desc" as const}},documents:{select:{id:true,fileName:true,documentType:true,createdAt:true}},arbitrators:{include:{arbitrator:{include:{user:{select:{name:true}}}}}},bookings:true,feePayments:true}
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await requireApiUser()
  if ("response" in authorization) return authorization.response
  const { id } = await params
  const record = await findAccessibleCase(id, authorization.user)
  if (!record) return NextResponse.json({ error: "Case not found" }, { status: 404 })
  return NextResponse.json(await prisma.case.findUnique({ where: { id }, include }))
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await requireApiUser(["ADMIN"])
  if ("response" in authorization) return authorization.response
  const { id } = await params
  try {
    const data = z.object({
      status: z.enum(["DRAFT", "FILED", "UNDER_REVIEW", "ARBITRATOR_ASSIGNED", "IN_HEARING", "AWARD_PASSED", "CLOSED"]).optional(),
      note: z.string().trim().max(2000).optional(),
      isFastTrack: z.boolean().optional(),
      isEmergency: z.boolean().optional(),
    }).refine((value) => value.status !== undefined || value.isFastTrack !== undefined || value.isEmergency !== undefined, "No changes supplied").parse(await request.json())
    const record = await prisma.case.findUnique({ where: { id } })
    if (!record) return NextResponse.json({ error: "Case not found" }, { status: 404 })
    if (data.status && !canTransitionCase(record.status, data.status)) return NextResponse.json({ error: "Invalid status transition" }, { status: 409 })
    const value = await prisma.$transaction(async (tx) => {
      const updated = await tx.case.update({ where: { id }, data: { status: data.status, isFastTrack: data.isFastTrack, isEmergency: data.isEmergency } })
      if (data.status) await tx.caseStatusHistory.create({ data: { caseId: id, status: data.status, note: data.note, changedByUserId: authorization.user.id } })
      return updated
    })
    return NextResponse.json(value)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 })
  }
}
