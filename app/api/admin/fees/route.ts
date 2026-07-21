import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
const schema=z.object({label:z.string().min(2),category:z.enum(["ADMINISTRATIVE","FILING","ARBITRATOR","ROOM_RENTAL","REGISTRATION","ANNUAL_RENEWAL","MEMBERSHIP"]),amount:z.coerce.number().nonnegative(),currency:z.string().length(3).default("INR"),effectiveDate:z.coerce.date(),isActive:z.boolean().default(true)})
export async function GET(){await requireRole("ADMIN");return NextResponse.json(await prisma.feeSchedule.findMany({orderBy:{createdAt:"desc"}}))}
export async function POST(request:Request){await requireRole("ADMIN");return NextResponse.json(await prisma.feeSchedule.create({data:schema.parse(await request.json())}),{status:201})}
