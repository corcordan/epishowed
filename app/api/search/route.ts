import { NextRequest, NextResponse } from "next/server"
import { searchShows } from "@/lib/search"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") ?? ""

    const data = await searchShows(query)

    return NextResponse.json(data)
}