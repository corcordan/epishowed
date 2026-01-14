import ShowPage from '@/components/show/Show'
import { fetchPeople, fetchSeasons, fetchShow } from '@/utils/fetchUtils'
import { getYear } from 'date-fns'

export default async function Shows({ params }: { params: Promise<{ id: number }> }) {

    const { id } = await params
    const showInfo = await fetchShow(id)

    if (!showInfo) return

    const start = getYear(showInfo.first_air_date).toString()
    const end = showInfo.status === "Ended" ? getYear(showInfo.last_air_date).toString() : "now"

    const seasonPromise = await fetchSeasons(showInfo, id)

    if (!seasonPromise) return

    const { seasonInfo, boxHeight, boxWidth, heightSVG, widthSVG, marginSize } = seasonPromise

    const peopleInfo = await fetchPeople(seasonInfo, id)

    if (!peopleInfo) return

    return (
        <ShowPage 
            start={start}
            end={end}
            showInfo={showInfo}
            seasons={seasonInfo}
            boxHeight={boxHeight}
            boxWidth={boxWidth}
            heightSVG={heightSVG}
            widthSVG={widthSVG}
            marginSize={marginSize}
            credits={peopleInfo}
        />
    )
}