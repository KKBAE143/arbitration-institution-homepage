import "dotenv/config"
import { hash } from "bcryptjs"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient, FeeCategory, FacilityType, ResourceCategory } from "../lib/generated/prisma/client"

const url = new URL(process.env.DATABASE_URL ?? "mysql://arbitration:arbitration_dev@127.0.0.1:3306/arbitration")
const prisma = new PrismaClient({ adapter: new PrismaMariaDb({ host: url.hostname, port: Number(url.port || 3306), user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database: url.pathname.slice(1) }) })

async function main() {
  const passwordHash = await hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!", 12)
  await prisma.user.upsert({ where: { email: process.env.ADMIN_EMAIL ?? "admin@ica.local" }, update: {}, create: { email: process.env.ADMIN_EMAIL ?? "admin@ica.local", name: process.env.ADMIN_NAME ?? "ICA Secretariat", passwordHash, role: "ADMIN" } })
  const facilities = [
    { name: "Tribunal Chamber One", type: FacilityType.ARBITRATION_ROOM, floorLabel: "Level 4", capacity: 12, indicativeRate: 18000, description: "Private hearing room with breakout access and secure presentation facilities." },
    { name: "Conference Suite", type: FacilityType.CONFERENCE_ROOM, floorLabel: "Level 3", capacity: 8, indicativeRate: 9500, description: "Flexible conference room for procedural meetings and mediation sessions." },
    { name: "Grand Hearing Hall", type: FacilityType.MEETING_HALL, floorLabel: "Level 2", capacity: 36, indicativeRate: 32000, description: "Large hearing hall with hybrid hearing and transcription support." },
  ]
  for (const facility of facilities) if (!(await prisma.facility.findFirst({ where: { name: facility.name } }))) await prisma.facility.create({ data: facility })
  const fees = [
    [FeeCategory.FILING, "Case filing fee", 25000], [FeeCategory.REGISTRATION, "Panel registration fee", 7500], [FeeCategory.ANNUAL_RENEWAL, "Annual panel renewal", 5000], [FeeCategory.ROOM_RENTAL, "Standard hearing room day rate", 18000],
  ] as const
  for (const [category, label, amount] of fees) if (!(await prisma.feeSchedule.findFirst({ where: { category, label } }))) await prisma.feeSchedule.create({ data: { category, label, amount, effectiveDate: new Date() } })
  await prisma.contentBlock.upsert({ where: { key: "home_intro" }, update: {}, create: { key: "home_intro", title: "Resolve with confidence", body: "Institutional arbitration administered with independence, procedural rigour, and secure case management." } })
  await prisma.modelClauseTemplate.upsert({ where: { id: "default-commercial" }, update: {}, create: { id: "default-commercial", disputeType: "Commercial", seat: "New Delhi", clauseText: "Any dispute arising out of or in connection with this agreement shall be finally resolved by arbitration administered by the Institution in accordance with its rules. The seat of arbitration shall be New Delhi and the language shall be English." } })
  void ResourceCategory.OTHER
}
main().finally(() => prisma.$disconnect())
