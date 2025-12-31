import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url) 
    const seriesID = searchParams.get("showID")
    const seasonNo = searchParams.get("seasonNo")

    if (!seriesID || !seasonNo) return NextResponse.json({ results: [] }, { status: 400 })

    const externalRes = await fetch(`https://api.themoviedb.org/3/tv/${seriesID}/season/${seasonNo}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
        },
    })
    const data = await externalRes.json()

    return NextResponse.json(data)
}