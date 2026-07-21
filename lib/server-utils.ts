import { createHash, randomBytes } from "node:crypto"

export const MAX_FILE_BYTES = 15 * 1024 * 1024

export function assertFileSize(contentBase64: string) {
  const data = contentBase64.includes(",") ? contentBase64.split(",")[1] : contentBase64
  if (Buffer.byteLength(data, "base64") > MAX_FILE_BYTES) throw new Error("File exceeds the 15 MB limit")
}

export function createSetupToken() {
  const token = randomBytes(32).toString("hex")
  return { token, hash: createHash("sha256").update(token).digest("hex") }
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function getNextCaseNumber(count: () => Promise<number>) {
  const year = new Date().getFullYear()
  const sequence = (await count()) + 1
  return `ARB/${year}/${String(sequence).padStart(4, "0")}`
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}
