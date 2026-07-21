import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8) })

export const demoUsers = {
  "demo.admin@ica.local": { id: "demo-admin", name: "Ananya Mehra", role: "ADMIN" as const, password: "demo-admin" },
  "demo.arbitrator@ica.local": { id: "demo-arbitrator", name: "Justice R. Mehta", role: "ARBITRATOR" as const, password: "demo-arbitrator" },
  "demo.party@ica.local": { id: "demo-party", name: "Aster Infra Counsel", role: "PARTY" as const, password: "demo-party" },
}

export function isDemoUserId(userId: string) {
  return userId.startsWith("demo-")
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "ica-preview-demo-only-signing-secret-not-for-production",
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw)
      if (!parsed.success) return null

      const email = parsed.data.email.toLowerCase()
      const demoUser = demoUsers[email as keyof typeof demoUsers]
      if (demoUser && parsed.data.password === demoUser.password) {
        return { id: demoUser.id, email, name: demoUser.name, role: demoUser.role }
      }

      if (!process.env.DATABASE_URL) return null
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user?.isActive || !(await compare(parsed.data.password, user.passwordHash))) return null
      return { id: user.id, email: user.email, name: user.name, role: user.role }
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = user.id; token.role = user.role } return token },
    session({ session, token }) { if (session.user) { session.user.id = String(token.id); session.user.role = token.role as "ADMIN" | "ARBITRATOR" | "PARTY" } return session },
  },
})
