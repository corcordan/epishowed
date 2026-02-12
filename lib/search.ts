export async function searchShows(query: string) {
    const res = await fetch(`https://api.themoviedb.org/3/search/tv?query=${query}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
        },
        next: { revalidate: 60 },
    })
    
    if (!res.ok) {
        throw new Error("TMDB fetch failed");
    }

    return res.json()
}