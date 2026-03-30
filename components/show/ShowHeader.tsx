import { TMDB_IMAGE_BASE } from '@/constants'
import { Show } from '@/types/Show'
import Image from 'next/image'

type ShowHeaderProps = {
    showInfo: Show
    start: string
    end: string
}

const ShowHeader = ({ showInfo, start, end }: ShowHeaderProps) => {
    return (
        <>
            <div className="flex flex-row justify-center items-center w-full px-8">
                <Image
                    src={`${TMDB_IMAGE_BASE}/w500${showInfo.poster_path}`}
                    alt={`Poster for ${showInfo.name}`}
                    width={250}
                    height={100}
                />
                <div className="flex flex-col space-y-8 justify-between items-start pl-10">
                    <div className="flex flex-row justify-between items-baseline w-full">
                        <p className="text-7xl">{showInfo.name}</p>
                        <p className="text-4xl">{start} - {end}</p>
                    </div>
                    <p>{showInfo.overview}</p>
                    <div className="flex flex-row space-x-4">
                        {showInfo.genres.map(g => (
                            <div
                                key={g.id}
                                className="bg-sandy text-white rounded-sm py-2 px-4 shadow-lg hover:scale-105 cursor-default"
                            >
                                {g.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="h-1 w-full rounded-full bg-tomato m-8" />
        </>
    )
}

export default ShowHeader
