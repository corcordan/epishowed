import { EpisodeLite } from "./EpisodeLite"

export type Season = {
    air_date: string
    episodes: EpisodeLite[]
    name: string
    overview: string
    id: number
    season_number: number
}