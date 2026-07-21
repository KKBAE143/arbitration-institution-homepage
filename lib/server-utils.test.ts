import { describe, expect, it } from "vitest"
import { MAX_FILE_BYTES, parseBase64, safeFileName } from "./server-utils"

describe("file boundaries", () => {
  it("accepts strict Base64 and data URLs", () => {
    expect(parseBase64("YWJjZA==").buffer.toString()).toBe("abcd")
    expect(parseBase64("data:text/plain;base64,YWJj").buffer.byteLength).toBe(3)
  })
  it("rejects malformed and oversized input", () => {
    expect(() => parseBase64("not-base64!" )).toThrow("valid Base64")
    const oversized = Buffer.alloc(MAX_FILE_BYTES + 1).toString("base64")
    expect(() => parseBase64(oversized)).toThrow("15 MB")
  })
  it("sanitizes response filenames", () => {
    expect(safeFileName("award\r\n.pdf")).toBe("award__.pdf")
  })
})
