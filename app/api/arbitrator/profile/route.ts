import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
const schema=z.object({bio:z.string().max(4000),title:z.string().max(100).nullable().optional(),externalProfileUrl:z.string().url().nullable().optional(),specializations:z.array(z.enum(["COMMERCIAL","BANKING","FINANCIAL","INFRASTRUCTURE","LOAN_RECOVERY","OTHER"]))})
export async function PATCH(request:Request){const user=(await auth())?.user;if(!user||user.role!=="ARBITRATOR")return NextResponse.json({error:"Forbidden"},{status:403});const {specializations,...data}=schema.parse(await request.json());const profile=await prisma.arbitratorProfile.update({where:{userId:user.id},data:{...data,specializations:{deleteMany:{},create:specializations.map(specialization=>({specialization}))}},include:{specializations:true}});return NextResponse.json(profile)}
