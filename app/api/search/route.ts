import { NextRequest, NextResponse } from "next/server"
import { searchShows } from "@/lib/search"
import { rateLimit } from "@/lib/rateLimit"

export async function GET(request: NextRequest) {
    const limited = rateLimit(request, 30, 60_000)
    if (limited) return limited

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") ?? ""

    const data = await searchShows(query)

    return NextResponse.json(data)
}