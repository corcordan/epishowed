import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url) 
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ results: [] }, { status: 400 })

    const externalRes = await fetch(`https://api.themoviedb.org/3/tv/${id}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
        },
    })
    const data = await externalRes.json()

    return NextResponse.json(data)
}