'use client'

import Footer from '../footer/Footer'
import Navbar from '../navbar/Navbar'
import Image from 'next/image'
import CreditBox from '../CreditBox'
import { useRef, useState } from 'react'
import { Show } from '@/types/Show'
import { Season } from '@/types/Season'
import { Credit } from '@/types/Credit'
import { BACKGROUND_WHITE, EPISODE_OFFSET, SEASON_OFFSET, TMDB_IMAGE_BASE } from '@/constants'
import { ColorAllocator } from '@/lib/ColorAllocator'
import { getOrder } from '@/utils/showUtils'

type ShowPageProps = {
    start: string
    end: string
    showInfo: Show
    seasons: Season[]
    boxHeight: number
    boxWidth: number
    heightSVG: number
    widthSVG: number
    marginSize: number
    credits: Credit[]
    numEps: number
}

const ShowPage = ({ start, end, showInfo, seasons, boxHeight, boxWidth, heightSVG, widthSVG, marginSize, credits, numEps }: ShowPageProps) => {
    const [selectedCreds, setSelectedCreds] = useState<Map<number, number[]>>(new Map())
    const [hoverCredit, setHoverCredit] = useState<number | null>(null)

    const allocatorRef = useRef<ColorAllocator | null>(null)
    
        if (!allocatorRef.current) {
            allocatorRef.current = new ColorAllocator()
        }
    
        const allocator = allocatorRef.current

    if (!showInfo) return <div>No show</div>

    return (
        <div className="flex flex-col relative">
            <Navbar />
            <div className="flex flex-col justify-center items-center px-8">
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
                                    className="bg-sandy text-white rounded-sm py-2 px-4 shadow-lg hover:scale-105"
                                >
                                    {g.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-1 w-full rounded-full bg-tomato m-8" />

                <div className="flex flex-row w-screen overflow-x-auto overflow-hidden">
                    {credits.map(c => (
                        <CreditBox 
                            key={c.id}
                            credit={c}
                            selectedCreds={selectedCreds}
                            setSelectedCreds={setSelectedCreds}
                            hoverCredit={hoverCredit}
                            setHoverCredit={setHoverCredit}
                            allocator={allocator}
                        />
                    ))}
                </div>

                <svg 
                    className=""
                    width={widthSVG}
                    height={heightSVG}
                >
                    <defs>
                        {seasons.map((s, i) => (
                            s.episodes.map((e, j) => {
                                const x = EPISODE_OFFSET + i * (boxWidth + marginSize)
                                const y = SEASON_OFFSET + j * (boxHeight + marginSize)
                                return (
                                    <clipPath id={`clip-${e.id}`} key={`clip-${e.id}`}>
                                        <rect x={x} y={y} width={boxWidth} height={boxHeight} rx={10} />
                                    </clipPath>
                                )
                            })
                        ))}
                    </defs>

                    <g>
                        {Array.from({ length: numEps}, (_, i) => 1 + i).map(num => (
                            <text
                                key={num}
                                fill={BACKGROUND_WHITE}
                                x={15} y={(num - 1) * (boxHeight + marginSize) + SEASON_OFFSET + (boxHeight / 2)}
                                className=""
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                    E{num}
                            </text>
                        ))}
                    </g>
                    <g>
                        {Array.from({ length: seasons.length }, (_, i) => 1 + i).map(num => (
                            <text
                                key={num}
                                fill={BACKGROUND_WHITE}
                                x={(num - 1) * (boxWidth + marginSize) + EPISODE_OFFSET + (boxWidth / 2)} y = {15}
                                className=""
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                    S{num}
                            </text>
                        ))}
                    </g>

                    {seasons.map((season, i) => (                       // Iterate through seasons
                        season.episodes.map((episode, j) => {           // Iterate through episodes
                            const effectiveOrder = getOrder(hoverCredit, selectedCreds)           // Get the effective order of selected/hovered credits
                            const presentCredits = effectiveOrder.filter(creditID => {          // Filter to those present in this episode
                                const fromMap = selectedCreds.get(creditID)
                                if (fromMap) {
                                    return fromMap.includes(episode.id)
                                }
                                const fromCredits = credits.find(credit => credit.id === creditID)
                                return fromCredits ? fromCredits.episodes.includes(episode.id) : false
                            })
                            
                            // Determine sizing
                            const rectWidth = presentCredits.length > 0 ? (boxWidth / Math.min(5, presentCredits.length)) : 0

                            const baseX = EPISODE_OFFSET + i * (boxWidth + marginSize)
                            const baseY = SEASON_OFFSET + j * (boxHeight + marginSize)

                            return (
                                <g
                                    key={episode.id}
                                    className={`hover:scale-110 transition-transform duration-150`}
                                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                                >
                                    <rect
                                        x={baseX}
                                        y={baseY}
                                        width={boxWidth}
                                        height={boxHeight}
                                        rx="10"
                                        fill={BACKGROUND_WHITE}
                                    />

                                    <g clipPath={`url(#clip-${episode.id}`}>
                                        {presentCredits.map((creditID, index) => {
                                            const color = allocator.getAssignedColors().get(creditID)
                                            return (
                                                <rect 
                                                    key={`${episode.id}-${creditID}`}
                                                    x={baseX + index * rectWidth}
                                                    y={baseY}
                                                    width={rectWidth}
                                                    height={boxHeight}
                                                    fill={color}
                                                />
                                            )
                                        })
                                        }
                                    </g>
                                </g>
                            ) 
                        })
                    ))}   
                </svg>
            </div>
            <Footer />
        </div>
    )
}

export default ShowPage