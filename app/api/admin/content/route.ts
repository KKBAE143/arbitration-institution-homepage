import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
const schema = z.object({ key: z.string().min(2).max(100), title: z.string().min(2), body: z.string().min(1), published: z.boolean().default(false) })
export async function GET() { await requireRole("ADMIN"); return NextResponse.json(await prisma.contentBlock.findMany({ orderBy: { updatedAt: "desc" } })) }
export async function POST(request: Request) { await requireRole("ADMIN"); const data = schema.parse(await request.json()); return NextResponse.json(await prisma.contentBlock.upsert({ where: { key: data.key }, update: data, create: data }), { status: 201 }) }
