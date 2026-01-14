import { Season } from "./Season"

export type fetchSeasonsResult = {
    seasonInfo: Season[],
    boxHeight: number,
    boxWidth: number,
    heightSVG: number,
    widthSVG: number,
    marginSize: number
}