type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
}

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }
  if (current.count >= limit) return { allowed: false, remaining: 0, retryAfter: Math.ceil((current.resetAt - now) / 1000) }
  current.count += 1
  return { allowed: true, remaining: limit - current.count, retryAfter: 0 }
}

export function rateLimitResponse(request: Request, scope: string, limit = 10) {
  const result = checkRateLimit(`${scope}:${requestIp(request)}`, limit)
  if (result.allowed) return null
  return Response.json({ error: "Too many requests. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(result.retryAfter) } })
}
