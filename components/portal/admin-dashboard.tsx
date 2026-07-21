'use client'

import { useState } from 'react'
import { ArrowRight, CalendarPlus, CheckCircle2, ChevronRight, Clock3, FilePlus2, Gavel, MoreHorizontal, Plus, UserCheck } from 'lucide-react'
import { cases, activity, hearings } from '@/lib/dashboard-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const stats = [
  { label: 'Active cases', value: '38', note: '+4 this month', icon: Gavel },
  { label: 'Pending intake', value: '12', note: '5 require action', icon: FilePlus2 },
  { label: 'Panel arbitrators', value: '84', note: '6 applications pending', icon: UserCheck },
  { label: 'Hearings this week', value: '9', note: '3 rooms booked', icon: CalendarPlus },
]

function StatusBadge({ stage }: { stage: string }) {
  const variant = stage.includes('Awaiting') ? 'outline' : stage.includes('Award') ? 'secondary' : 'default'
  return <Badge variant={variant}>{stage}</Badge>
}

export function AdminDashboard() {
  const [period, setPeriod] = useState('week')

  return (
    <main className="flex-1 overflow-x-hidden bg-muted/30">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 p-4 md:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">Monday, 20 July 2026</p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">Good morning, Ananya.</h1>
            <p className="mt-2 text-muted-foreground">Here&apos;s what needs the Secretariat&apos;s attention today.</p>
          </div>
          <Button size="lg"><Plus data-icon="inline-start" />New matter</Button>
        </section>

        <section aria-label="Case summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="shadow-none">
              <CardHeader className="flex-row items-start justify-between pb-2">
                <CardDescription className="font-medium text-foreground">{stat.label}</CardDescription>
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><stat.icon className="size-4" aria-hidden="true" /></div>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl font-semibold">{stat.value}</p>
                <p className={index === 1 ? 'mt-2 text-xs font-medium text-accent-foreground' : 'mt-2 text-xs text-muted-foreground'}>{stat.note}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.7fr)]">
          <Card className="min-w-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between">
              <div><CardTitle className="font-serif text-xl">Case docket</CardTitle><CardDescription>Recently updated arbitration matters</CardDescription></div>
              <Button variant="ghost">View all <ArrowRight data-icon="inline-end" /></Button>
            </CardHeader>
            <CardContent className="overflow-x-auto px-0">
              <Table>
                <TableHeader><TableRow><TableHead className="pl-6">Matter</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                <TableBody>
                  {cases.map((item) => (
                    <TableRow key={item.id} className="cursor-pointer">
                      <TableCell className="pl-6"><p className="font-medium">{item.title}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{item.id}</p></TableCell>
                      <TableCell className="text-muted-foreground">{item.type}</TableCell>
                      <TableCell><StatusBadge stage={item.stage} /></TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{item.updated}</TableCell>
                      <TableCell><Button variant="ghost" size="icon-sm" aria-label={`Open ${item.id}`}><ChevronRight /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader><CardTitle className="font-serif text-xl">Action queue</CardTitle><CardDescription>Items awaiting review or decision</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-1">
              {[
                ['Empanelment reviews', '6', '3 older than 7 days'],
                ['Referral screening', '4', '2 received today'],
                ['Tribunal appointments', '3', 'Consent pending'],
                ['Booking requests', '5', '1 scheduling conflict'],
              ].map(([label, count, note], index) => (
                <button key={label} className="group flex items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-muted">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border font-serif font-semibold">{count}</div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium">{label}</p><p className={index === 3 ? 'truncate text-xs text-destructive' : 'truncate text-xs text-muted-foreground'}>{note}</p></div>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="shadow-none">
            <CardHeader className="flex-row items-center justify-between">
              <div><CardTitle className="font-serif text-xl">Upcoming hearings</CardTitle><CardDescription>Next seven days across all venues</CardDescription></div>
              <Tabs value={period} onValueChange={(value) => setPeriod(value as string)}><TabsList><TabsTrigger value="week">Week</TabsTrigger><TabsTrigger value="month">Month</TabsTrigger></TabsList></Tabs>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {hearings.map((hearing) => (
                <div key={hearing.case} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground"><span className="text-[10px] font-semibold tracking-widest">{hearing.month}</span><strong className="font-serif text-lg leading-none">{hearing.day}</strong></div>
                  <div className="min-w-0 flex-1"><p className="font-medium">{hearing.title}</p><p className="mt-1 truncate text-xs text-muted-foreground"><span className="font-mono">{hearing.case}</span> · {hearing.venue}</p></div>
                  <div className="hidden text-right sm:block"><p className="text-sm font-medium">{hearing.time}</p><p className="mt-1 text-xs text-muted-foreground">IST</p></div>
                  <Button variant="ghost" size="icon-sm" aria-label="More hearing options"><MoreHorizontal /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader><CardTitle className="font-serif text-xl">Recent activity</CardTitle><CardDescription>A live record of Secretariat actions</CardDescription></CardHeader>
            <CardContent className="flex flex-col">
              {activity.map((item, index) => (
                <div key={item.title + item.time} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < activity.length - 1 && <div className="absolute left-[15px] top-7 h-full w-px bg-border" />}
                  <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full border bg-background"><CheckCircle2 className="size-4 text-accent-foreground" /></div>
                  <div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="text-sm font-medium">{item.title}</p><span className="whitespace-nowrap text-xs text-muted-foreground">{item.time}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p><p className="mt-1 font-mono text-[11px] text-muted-foreground">{item.case}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden border-primary bg-primary text-primary-foreground shadow-none">
          <CardContent className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10"><Clock3 /></div><div><p className="font-serif text-lg font-semibold">Quarterly caseload review</p><p className="mt-1 text-sm text-primary-foreground/70">74% of active matters are progressing within target timelines.</p></div></div>
            <div className="flex min-w-64 items-center gap-4"><Progress value={74} className="bg-primary-foreground/20" /><span className="font-serif text-2xl font-semibold">74%</span></div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
