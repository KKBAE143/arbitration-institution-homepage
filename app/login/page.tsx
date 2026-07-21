import Link from "next/link"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { signIn } from "@/auth"
import { Gavel, Scale, ShieldCheck, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const demoRoles = [
  { role: "ADMIN", label: "Administrator", description: "Secretariat operations and case administration", email: "demo.admin@ica.local", password: "demo-admin", redirectTo: "/admin", icon: ShieldCheck },
  { role: "ARBITRATOR", label: "Arbitrator", description: "Assigned matters, hearings, and documents", email: "demo.arbitrator@ica.local", password: "demo-arbitrator", redirectTo: "/arbitrator", icon: Gavel },
  { role: "PARTY", label: "Party panel", description: "Party matters, milestones, and case records", email: "demo.party@ica.local", password: "demo-party", redirectTo: "/portal", icon: UserRound },
] as const

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const query = await searchParams

  async function login(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: query.callbackUrl ?? "/dashboard" })
    } catch (error) {
      if (error instanceof AuthError) redirect("/login?error=credentials")
      throw error
    }
  }

  async function demoLogin(formData: FormData) {
    "use server"
    const role = String(formData.get("role"))
    const account = demoRoles.find((item) => item.role === role)
    if (!account) redirect("/login?error=credentials")
    await signIn("credentials", { email: account.email, password: account.password, redirectTo: account.redirectTo })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader>
            <Link href="/" className="mb-6 flex items-center gap-3 font-serif font-semibold">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Scale /></span>
              ICA Secure Portal
            </Link>
            <CardTitle className="font-serif text-3xl">Welcome back</CardTitle>
            <CardDescription>Sign in with your Secretariat-issued credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm font-medium">Email<Input name="email" type="email" autoComplete="email" required /></label>
              <label className="flex flex-col gap-2 text-sm font-medium">Password<Input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
              {query.error && <p role="alert" className="text-sm text-destructive">The email or password is incorrect. For preview access, choose a demo role.</p>}
              <Button type="submit" size="lg">Sign in securely</Button>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">Real accounts require the production database and authentication environment to be configured.</p>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary text-primary-foreground">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">Preview mode</Badge>
            <CardTitle className="font-serif text-3xl">Explore by role</CardTitle>
            <CardDescription className="text-primary-foreground/70">Choose a workspace to enter with a temporary demo session. Data is representative and changes are not saved.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {demoRoles.map((account) => (
              <form key={account.role} action={demoLogin}>
                <input type="hidden" name="role" value={account.role} />
                <Button type="submit" variant="secondary" size="lg" className="h-auto w-full justify-start p-4 text-left">
                  <account.icon data-icon="inline-start" />
                  <span className="flex flex-col items-start gap-1">
                    <span>{account.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">{account.description}</span>
                  </span>
                </Button>
              </form>
            ))}
            <p className="pt-2 text-xs leading-relaxed text-primary-foreground/70">Demo access is for interface evaluation only. It is not production authentication and should not be used for confidential case information.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
