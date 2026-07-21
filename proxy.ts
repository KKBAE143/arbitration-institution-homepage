import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((request) => {
  const path = request.nextUrl.pathname
  const role = request.auth?.user?.role
  const required = path.startsWith("/admin") ? "ADMIN" : path.startsWith("/arbitrator") ? "ARBITRATOR" : path.startsWith("/portal") ? "PARTY" : null
  if (!request.auth && required) return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, request.url))
  if (required && role !== required) return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : role === "ARBITRATOR" ? "/arbitrator" : "/portal", request.url))
  return NextResponse.next()
})

export const config = { matcher: ["/admin/:path*", "/arbitrator/:path*", "/portal/:path*"] }
