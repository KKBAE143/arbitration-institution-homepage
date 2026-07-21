import { z } from 'zod'

export const MAX_FILE_SIZE = 15 * 1024 * 1024

export const caseFilingSchema = z.object({
  title: z.string().trim().min(5).max(180),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(50).max(10_000),
  fastTrack: z.boolean().default(false),
  emergency: z.boolean().default(false),
})

export const documentSchema = z.object({
  name: z.string().trim().min(1).max(220),
  mimeType: z.enum(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
  type: z.enum(['FILING', 'EVIDENCE', 'ORDER', 'AWARD']),
})

export const bookingSchema = z.object({
  caseId: z.string().min(1),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  venue: z.string().trim().min(2).max(120),
  virtualUrl: z.url().optional(),
}).refine((value) => value.endsAt > value.startsAt, { message: 'End time must be after start time', path: ['endsAt'] })

export const tribunalSchema = z.object({
  members: z.array(z.object({ arbitratorId: z.string().min(1), role: z.enum(['SOLE', 'CHAIR', 'CO_ARBITRATOR', 'EMERGENCY']) })).min(1).max(3),
}).superRefine(({ members }, context) => {
  const roles = members.map((member) => member.role)
  const validSole = roles.length === 1 && roles[0] === 'SOLE'
  const validPanel = roles.length === 3 && roles.filter((role) => role === 'CHAIR').length === 1 && roles.filter((role) => role === 'CO_ARBITRATOR').length === 2
  const validEmergency = roles.length === 1 && roles[0] === 'EMERGENCY'
  if (!validSole && !validPanel && !validEmergency) context.addIssue({ code: 'custom', message: 'Tribunal must be a sole arbitrator, a chair with two co-arbitrators, or one emergency arbitrator' })
})
