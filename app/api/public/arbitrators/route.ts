import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") ?? undefined
  const sector = searchParams.get("sector") as never
  const profiles = await prisma.arbitratorProfile.findMany({ where: { empanelmentStatus: "APPROVED", ...(q ? { OR: [{ user: { name: { contains: q } } }, { bio: { contains: q } }] } : {}), ...(sector ? { specializations: { some: { specialization: sector } } } : {}) }, select: { id: true, slug: true, title: true, bio: true, isProminent: true, photoBase64: true, user: { select: { name: true } }, specializations: { select: { specialization: true } } }, take: 50 })
  return Response.json({ data: profiles })
}
