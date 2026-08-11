import { NextRequest, NextResponse } from "next/server"

import { buildProfileContext, type Language } from "@/lib/profile"

const MAX_MESSAGE_LENGTH = 500
const MAX_HISTORY_MESSAGES = 6
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 10

/**
 * In-memory sliding window. This process is the only thing it protects, so on a
 * multi-instance or serverless deployment each instance keeps its own counter and the
 * effective limit is higher than the constant suggests. It still turns an unbounded
 * public proxy into a bounded one; move to a shared store (Redis) if the endpoint ever
 * needs a hard guarantee.
 */
const requestLog = new Map<string, number[]>()

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}

function isRateLimited(key: string) {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS

  // Drop stale keys so the map cannot grow without bound.
  for (const [entryKey, timestamps] of requestLog) {
    const alive = timestamps.filter((timestamp) => timestamp > cutoff)
    if (alive.length === 0) requestLog.delete(entryKey)
    else requestLog.set(entryKey, alive)
  }

  const hits = requestLog.get(key) ?? []
  if (hits.length >= RATE_LIMIT_MAX_REQUESTS) return true

  requestLog.set(key, [...hits, now])
  return false
}

type IncomingMessage = { role?: unknown; text?: unknown }

function sanitizeHistory(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((entry): entry is IncomingMessage => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      role: entry.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: typeof entry.text === "string" ? entry.text.slice(0, MAX_MESSAGE_LENGTH) : "",
    }))
    .filter((entry) => entry.content.length > 0)
}

export async function POST(request: NextRequest) {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW_MS / 1000) } }
    )
  }

  const body = (await request.json().catch(() => null)) as
    | { message?: unknown; language?: unknown; history?: unknown }
    | null

  const rawMessage = typeof body?.message === "string" ? body.message.trim() : ""
  if (!rawMessage) return NextResponse.json({ error: "A message is required." }, { status: 400 })
  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` },
      { status: 413 }
    )
  }

  const language: Language = body?.language === "en" ? "en" : "fr"
  const history = sanitizeHistory(body?.history)

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 })

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Dieu Donné Portfolio",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free",
        temperature: 0.25,
        max_tokens: 360,
        messages: [
          {
            role: "system",
            content: `${buildProfileContext(language)}\nRespond in ${language === "fr" ? "French" : "English"} only.`,
          },
          ...history,
          { role: "user", content: rawMessage },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    })

    const data = (await upstream.json().catch(() => null)) as
      | { choices?: Array<{ message?: { content?: unknown } }> }
      | null
    const content = data?.choices?.[0]?.message?.content
    if (!upstream.ok || typeof content !== "string" || !content.trim()) throw new Error("Invalid AI response")

    return NextResponse.json({ content: content.trim() })
  } catch {
    return NextResponse.json({ error: "AI service is temporarily unavailable." }, { status: 502 })
  }
}
