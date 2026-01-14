import { BOX_RATIO, BOX_RATIO_INV, EPISODE_OFFSET, MARGIN, MAX_BOX_HEIGHT, MAX_BOX_WIDTH, MIN_BOX_HEIGHT, MIN_BOX_WIDTH, SEASON_OFFSET, SVG_HEIGHT, SVG_WIDTH } from "@/constants"
import { Credit } from "@/types/Credit"
import { EpisodeCredits } from "@/types/EpisodeCredits"
import { fetchSeasonsResult } from "@/types/FetchSeason"
import { Season } from "@/types/Season"
import { Show } from "@/types/Show"

export const fetchShow = async (id: number) => {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}`, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
            cache: "force-cache",
        })

        if (!res.ok) throw new Error("Failed to fetch show results")

        const data: Show = await res.json()

        const result: Show = {
            backdrop_path: data.backdrop_path,
            first_air_date: data.first_air_date,
            genres: data.genres.map(g => ({
                id: g.id,
                name: g.name
            })),
            id: data.id,
            last_air_date: data.last_air_date,
            name: data.name,
            overview: data.overview,
            poster_path: data.poster_path,
            seasons: data.seasons.map(s => ({
                id: s.id,
                season_number: s.season_number
            })),
            status: data.status
        }

        return result
    } catch (err) {
        console.error("Error fetching Shows", err)
    }
}

export const fetchSeasons = async (showInfo: Show, id: number): Promise<fetchSeasonsResult | undefined> => {
    let boxHeight: number = 0
    let boxWidth: number = 0
    let heightSVG: number = SVG_HEIGHT
    let widthSVG: number = SVG_WIDTH
    let marginSize: number = MARGIN
    try {
        const seasonPromises = showInfo.seasons
            .filter(s => s.season_number !== 0)
            .map(async (s) => {
                const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${s.season_number}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                    },
                })
                if (!res.ok) throw new Error("Failed to fetch season results")
                const data: Season = await res.json()

                const result: Season = {
                    air_date: data.air_date,
                    episodes: data.episodes.map(e => ({
                        episode_number: e.episode_number,
                        id: e.id,
                        name: e.name
                    })),
                    name: data.name,
                    overview: data.overview,
                    id: data.id,
                    season_number: data.season_number
                }

                return result
            })
        
        const results = await Promise.all(seasonPromises)
        const fixedSeasons = results.filter(s => s.air_date).sort((a, b) => a.season_number - b.season_number)

        const maxEpisodes = Math.max(...fixedSeasons.map(s => s.episodes.length))

        const boxH = (SVG_HEIGHT - SEASON_OFFSET - (maxEpisodes - 1) * MARGIN) / maxEpisodes
        const boxW = (SVG_WIDTH - EPISODE_OFFSET - (fixedSeasons.length - 1) * MARGIN) / fixedSeasons.length

        const adjH = MIN_BOX_HEIGHT < boxH && boxH < MAX_BOX_HEIGHT ? boxH : boxH <= MIN_BOX_HEIGHT ? MIN_BOX_HEIGHT : MAX_BOX_HEIGHT
        const adjW = MIN_BOX_WIDTH < boxW && boxW < MAX_BOX_WIDTH ? boxW : boxW <= MIN_BOX_WIDTH ? MIN_BOX_WIDTH : MAX_BOX_WIDTH
        
        if (adjH === MIN_BOX_HEIGHT || adjW === MIN_BOX_WIDTH) {
            boxHeight = MIN_BOX_HEIGHT
            boxWidth = MIN_BOX_WIDTH
        }
        else {
            if (adjH <= adjW * BOX_RATIO) {
                boxHeight = adjH
                boxWidth = adjH * BOX_RATIO_INV
            }
            else {
                boxHeight = adjW * BOX_RATIO
                boxWidth = adjW
            }
            
        }

        if (adjH === MIN_BOX_HEIGHT) {
            const svgHTemp = SEASON_OFFSET + (MIN_BOX_HEIGHT * (maxEpisodes)) + (MARGIN * (maxEpisodes - 1))
            heightSVG = svgHTemp
        }

        if (adjW === MIN_BOX_WIDTH) {
            const svgWTemp = EPISODE_OFFSET + (MIN_BOX_WIDTH * fixedSeasons.length) + (MARGIN * (fixedSeasons.length - 1))
            widthSVG = svgWTemp
        }

        return { seasonInfo: fixedSeasons, boxHeight: boxHeight, boxWidth: boxWidth, heightSVG: heightSVG, widthSVG: widthSVG, marginSize: marginSize }
    } catch (err) {
        console.error("Error fetching Seasons", err)
    }
}

export const fetchPeople = async (seasons: Season[], id: number) => {
    try {
        const peoplePromises = seasons
            .map(async (s) => {
                const innerPromises = s.episodes.map(async (e) => {
                    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${s.season_number}/episode/${e.episode_number}/credits`, {
                        headers: {
                            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                        },
                    })
                    if (!res.ok) throw new Error("Failed to fetch credits results")
                    const data: EpisodeCredits = await res.json()

                    const result: EpisodeCredits = {
                        cast: data.cast.map(c => ({
                            id: c.id,
                            name: c.name,
                            profile_path: c.profile_path,
                            character: c.character,
                            order: c.order,
                            episodes: [e.id]
                        })),
                        guest_stars: data.guest_stars.map(g => ({
                            id: g.id,
                            name: g.name,
                            profile_path: g.profile_path,
                            character: g.character,
                            order: g.order,
                            episodes: [e.id]
                        })),
                        id: data.id
                    }
                    
                    return result
                })
            const innerResults = await Promise.all(innerPromises) 
            return innerResults 
            })

        const results = await Promise.all(peoplePromises)
        const peopleMap = new Map<number, Credit>()
        results.flat().forEach(ec => {
            const allPeople = [...ec.cast, ...ec.guest_stars]
            allPeople.forEach(person => {
                if (peopleMap.has(person.id)) {
                    const existing = peopleMap.get(person.id)
                    existing?.episodes.push(...person.episodes)
                    // Optionally remove duplicates
                    // existing.episodes = Array.from(new Set(existing?.episodes))
                }
                else {
                    peopleMap.set(person.id, { ...person })
                }
            })
        })

        const peopleArr = [...peopleMap.values()]

        return peopleArr


    } catch (err) {
        console.error("Error fetching People", err)
    }
}