import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { accessibleCase } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { canTransitionCase } from "@/lib/workflows"
const include={statusHistory:{orderBy:{changedAt:"desc" as const}},documents:{select:{id:true,fileName:true,documentType:true,createdAt:true}},arbitrators:{include:{arbitrator:{include:{user:{select:{name:true}}}}}},bookings:true,feePayments:true}
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const user=(await auth())?.user;if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const{id}=await params;await accessibleCase(id,user);return NextResponse.json(await prisma.case.findUnique({where:{id},include}))}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const user=(await auth())?.user;if(!user||user.role!=="ADMIN")return NextResponse.json({error:"Forbidden"},{status:403});const{id}=await params;const{status}=z.object({status:z.enum(["DRAFT","FILED","UNDER_REVIEW","ARBITRATOR_ASSIGNED","IN_HEARING","AWARD_PASSED","CLOSED"])}).parse(await request.json());const record=await prisma.case.findUniqueOrThrow({where:{id}});if(!canTransitionCase(record.status,status))return NextResponse.json({error:"Invalid status transition"},{status:409});return NextResponse.json(await prisma.$transaction(async tx=>{const value=await tx.case.update({where:{id},data:{status}});await tx.caseStatusHistory.create({data:{caseId:id,status,changedByUserId:user.id}});return value}))}
