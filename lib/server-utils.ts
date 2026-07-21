import { createHash, randomBytes } from "node:crypto"

export const MAX_FILE_BYTES = 15 * 1024 * 1024

const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/
const MAX_BASE64_LENGTH = Math.ceil(MAX_FILE_BYTES / 3) * 4

export function parseBase64(contentBase64: string) {
  const separator = contentBase64.indexOf(",")
  const data = (separator >= 0 ? contentBase64.slice(separator + 1) : contentBase64).replace(/\s/g, "")
  if (data.length > MAX_BASE64_LENGTH) throw new Error("File exceeds the 15 MB limit")
  if (!data || data.length % 4 !== 0 || !BASE64_PATTERN.test(data)) throw new Error("File content is not valid Base64")
  const buffer = Buffer.from(data, "base64")
  if (buffer.byteLength > MAX_FILE_BYTES) throw new Error("File exceeds the 15 MB limit")
  return { data, buffer }
}

export function assertFileSize(contentBase64: string) {
  parseBase64(contentBase64)
}

export function safeFileName(value: string) {
  return value.replace(/[\r\n"\\/]/g, "_").slice(0, 220) || "download"
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
