import ShowPage from '@/components/show/Show'
import ShowHeader from '@/components/show/ShowHeader'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'
import { fetchPeople, fetchSeasons, fetchShow } from '@/utils/fetchUtils'
import { getMostEpisodes, sortCredits } from '@/utils/showUtils'
import { Show } from '@/types/Show'
import { getYear } from 'date-fns'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default async function Shows({ params }: { params: Promise<{ id: number }> }) {
    const { id } = await params
    const showInfo = await fetchShow(id)

    if (!showInfo) {
        console.error("fetchShow returned undefined for ID", id)
        notFound()
    }

    const start = getYear(showInfo.first_air_date).toString()
    const end = showInfo.status === "Ended" ? getYear(showInfo.last_air_date).toString() : "now"

    return (
        <div className="flex flex-col relative">
            <Navbar />
            <div className="flex flex-col justify-center items-center px-8">
                <ShowHeader showInfo={showInfo} start={start} end={end} />
                <Suspense fallback={<ShowSkeleton />}>
                    <ShowDataLoader showInfo={showInfo} id={id} />
                </Suspense>
            </div>
            <Footer />
        </div>
    )
}

async function ShowDataLoader({ showInfo, id }: { showInfo: Show, id: number }) {
    const seasonPromise = await fetchSeasons(showInfo, id)

    if (!seasonPromise) {
        console.error("fetchSeasons returned undefined for ID", id)
        notFound()
    }

    const { seasonInfo, boxHeight, boxWidth, heightSVG, widthSVG, marginSize } = seasonPromise

    const peopleInfo = await fetchPeople(seasonInfo, id)

    if (!peopleInfo) {
        console.error("fetchPeople returned undefined for ID", id)
        notFound()
    }

    const credits = sortCredits(peopleInfo)
    const numEps = getMostEpisodes(seasonInfo)

    return (
        <ShowPage
            seasons={seasonInfo}
            boxHeight={boxHeight}
            boxWidth={boxWidth}
            heightSVG={heightSVG}
            widthSVG={widthSVG}
            marginSize={marginSize}
            credits={credits}
            numEps={numEps}
        />
    )
}

function ShowSkeleton() {
    return (
        <div className="flex flex-col items-center w-full gap-8 pb-8">
            <div className="flex flex-row gap-2 w-screen px-8 overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="shrink-0 w-16 h-24 rounded-2xl border-2 border-transparent bg-alabaster/20 animate-pulse"
                    />
                ))}
            </div>
            <div className="w-full bg-alabaster/20 rounded animate-pulse" style={{ height: 600 }} />
        </div>
    )
}
