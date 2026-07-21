import { describe, expect, it } from "vitest"
import { checkRateLimit } from "./rate-limit"

describe("public intake rate limiting", () => {
  it("blocks requests after the configured allowance", () => {
    const key = `test-${crypto.randomUUID()}`
    expect(checkRateLimit(key, 2).allowed).toBe(true)
    expect(checkRateLimit(key, 2).allowed).toBe(true)
    const blocked = checkRateLimit(key, 2)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })
})
