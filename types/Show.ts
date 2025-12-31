import { SeasonLite } from "./SeasonLite"

export type Show = {
    backdrop_path: string
    first_air_date: string
    genres: {id: number, name: string}[]
    id: number
    last_air_date: string
    name: string
    overview: string
    poster_path: string
    seasons: SeasonLite[]
    status: string
}