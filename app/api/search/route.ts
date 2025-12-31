import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url) 
    const query = searchParams.get("q")

    if (!query) return NextResponse.json({ results: [] }, { status: 400 })

    const externalRes = await fetch(`https://api.themoviedb.org/3/search/tv?query=${query}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
        },
    })
    const data = await externalRes.json()

    return NextResponse.json(data)
}