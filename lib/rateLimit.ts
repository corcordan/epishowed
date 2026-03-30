import { NextRequest, NextResponse } from "next/server"

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

export function rateLimit(request: NextRequest, limit: number, windowMs: number): NextResponse | null {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
    const key = `${request.nextUrl.pathname}:${ip}`
    const now = Date.now()

    const entry = store.get(key)

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs })
        return null
    }

    if (entry.count >= limit) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    entry.count++
    return null
}
