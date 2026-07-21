import type { CaseStatus, EmpanelmentStage } from "@/lib/generated/prisma/client"

const caseTransitions: Record<CaseStatus, CaseStatus[]> = {
  DRAFT: ["FILED"], FILED: ["UNDER_REVIEW"], UNDER_REVIEW: ["ARBITRATOR_ASSIGNED"],
  ARBITRATOR_ASSIGNED: ["IN_HEARING"], IN_HEARING: ["AWARD_PASSED"], AWARD_PASSED: ["CLOSED"], CLOSED: [],
}
const empanelmentTransitions: Record<EmpanelmentStage, EmpanelmentStage[]> = {
  APPLIED: ["DOCUMENT_VERIFIED", "REJECTED"], DOCUMENT_VERIFIED: ["INTERVIEW_SCHEDULED", "REJECTED"],
  INTERVIEW_SCHEDULED: ["APPROVED", "REJECTED"], APPROVED: [], REJECTED: [],
}
export const canTransitionCase = (from: CaseStatus, to: CaseStatus) => caseTransitions[from].includes(to)
export const canTransitionEmpanelment = (from: EmpanelmentStage, to: EmpanelmentStage) => empanelmentTransitions[from].includes(to)
export function decodedBase64Bytes(value: string) { const payload = value.includes(",") ? value.slice(value.indexOf(",") + 1) : value; return Buffer.byteLength(payload.replace(/\s/g, ""), "base64") }
export const MAX_FILE_BYTES = 15 * 1024 * 1024
