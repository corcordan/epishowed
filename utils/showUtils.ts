import { Season } from "@/types/Season"

export const getOrder = (hoverCredit: number | null, selectedCreds: Map<number, number[]>) => {
    if (hoverCredit) return [hoverCredit]
    return Array.from(selectedCreds.keys())
}

export const getMostEpisodes = (seasons: Season[]) => {
    let maxEps = 0
    seasons.forEach(season => {
        if (season.episodes.length > maxEps) {
            maxEps = season.episodes.length
        }
    })
    return maxEps
}