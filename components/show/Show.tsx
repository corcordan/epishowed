'use client'

import CreditBox from '../CreditBox'
import { useMemo, useState } from 'react'
import { Season } from '@/types/Season'
import { Credit } from '@/types/Credit'
import { BACKGROUND_WHITE, EPISODE_OFFSET, SEASON_OFFSET } from '@/constants'
import { ColorAllocator } from '@/lib/ColorAllocator'
import { getOrder } from '@/utils/showUtils'

type ShowPageProps = {
    seasons: Season[]
    boxHeight: number
    boxWidth: number
    heightSVG: number
    widthSVG: number
    marginSize: number
    credits: Credit[]
    numEps: number
}

const ShowPage = ({ seasons, boxHeight, boxWidth, heightSVG, widthSVG, marginSize, credits, numEps }: ShowPageProps) => {
    const [selectedCreds, setSelectedCreds] = useState<Map<number, number[]>>(new Map())
    const [hoverCredit, setHoverCredit] = useState<number | null>(null)

    const allocator = useMemo(() => new ColorAllocator(), [])

    return (
        <>
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
                    {Array.from({ length: numEps }, (_, i) => 1 + i).map(num => (
                        <text
                            key={num}
                            fill={BACKGROUND_WHITE}
                            x={15} y={(num - 1) * (boxHeight + marginSize) + SEASON_OFFSET + (boxHeight / 2)}
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
                            x={(num - 1) * (boxWidth + marginSize) + EPISODE_OFFSET + (boxWidth / 2)} y={15}
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            S{num}
                        </text>
                    ))}
                </g>

                {seasons.map((season, i) => (
                    season.episodes.map((episode, j) => {
                        const effectiveOrder = getOrder(hoverCredit, selectedCreds)
                        const presentCredits = effectiveOrder.filter(creditID => {
                            const fromMap = selectedCreds.get(creditID)
                            if (fromMap) {
                                return fromMap.includes(episode.id)
                            }
                            const fromCredits = credits.find(credit => credit.id === creditID)
                            return fromCredits ? fromCredits.episodes.includes(episode.id) : false
                        })

                        const rectWidth = presentCredits.length > 0 ? (boxWidth / Math.min(5, presentCredits.length)) : 0

                        const baseX = EPISODE_OFFSET + i * (boxWidth + marginSize)
                        const baseY = SEASON_OFFSET + j * (boxHeight + marginSize)

                        return (
                            <g
                                key={episode.id}
                                className="hover:scale-110 transition-transform duration-150"
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
                                    })}
                                </g>
                            </g>
                        )
                    })
                ))}
            </svg>
        </>
    )
}

export default ShowPage
