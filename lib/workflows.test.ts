import { describe, expect, it } from "vitest"
import { canTransitionCase, canTransitionEmpanelment, decodedBase64Bytes, MAX_FILE_BYTES } from "./workflows"
describe("workflow guards", () => {
  it("allows only adjacent forward case transitions", () => {
    expect(canTransitionCase("FILED", "UNDER_REVIEW")).toBe(true)
    expect(canTransitionCase("FILED", "CLOSED")).toBe(false)
    expect(canTransitionCase("CLOSED", "FILED")).toBe(false)
  })
  it("prevents approval before interview and reopening final decisions", () => {
    expect(canTransitionEmpanelment("APPLIED", "APPROVED")).toBe(false)
    expect(canTransitionEmpanelment("INTERVIEW_SCHEDULED", "APPROVED")).toBe(true)
    expect(canTransitionEmpanelment("APPROVED", "REJECTED")).toBe(false)
  })
  it("measures padded and data URL Base64 uploads", () => {
    expect(decodedBase64Bytes("YWJjZA==")).toBe(4)
    expect(decodedBase64Bytes("data:text/plain;base64,YWJj")).toBe(3)
    expect(MAX_FILE_BYTES).toBe(15_728_640)
  })
})
