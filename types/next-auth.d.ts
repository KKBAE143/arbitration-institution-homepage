import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User { role: "ADMIN" | "ARBITRATOR" | "PARTY" }
  interface Session { user: { id: string; role: "ADMIN" | "ARBITRATOR" | "PARTY"; name?: string | null; email?: string | null } }
}
declare module "next-auth/jwt" {
  interface JWT { id?: string; role?: "ADMIN" | "ARBITRATOR" | "PARTY" }
}
