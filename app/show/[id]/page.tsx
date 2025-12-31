'use client'

import CreditBox from '@/components/CreditBox'
import Navbar from '@/components/navbar/Navbar'
import { TMDB_IMAGE_BASE } from '@/constants'
import { ColorAllocator } from '@/lib/ColorAllocator'
import { Credit } from '@/types/Credit'
import { EpisodeCredits } from '@/types/EpisodeCredits'
import { Season } from '@/types/Season'
import { Show } from '@/types/Show'
import { getDayOfYear, getYear } from 'date-fns'
import { Ephesis } from 'next/font/google'
import Image from 'next/image'
import React, { use, useEffect, useRef, useState } from 'react'

const backgroundWhite = "#E8E9EB"
const backgroundTomato = "#F06543"
const svgWidth = 1000
const svgHeight = 750
const margin = 10
const episodeOffset = 60
const seasonOffset = 20
const boxRatio = 3/5
const boxRatioInv = 5/3
const maxBoxWidth = 100
const maxBoxHeight = 60
const minBoxWidth = 50
const minBoxHeight = 30

const allocator = new ColorAllocator()

const ShowPage = ({ params }: { params: Promise<{ id: number }> }) => {
    const [loading, setLoading] = useState(false)
    const [showInfo, setShowInfo] = useState<Show | null>(null)
    const [seasons, setSeasons] = useState<Season[]>([])
    const [credits, setCredits] = useState<Credit[]>([])
    const [numEps, setNumEps] = useState(0)
    const [startYear, setStartYear] = useState("")
    const [endYear, setEndYear] = useState("")
    const [boxHeight, setBoxHeight] = useState(0)
    const [boxWidth, setBoxWidth] = useState(0)
    const [heightSVG, setHeightSVG] = useState(svgHeight)
    const [widthSVG, setWidthSVG] = useState(svgWidth)
    const [marginSize, setMarginSize] = useState(margin)
    const [selectedCreds, setSelectedCreds] = useState<Map<number, number[]>>(new Map())
    const [hoverCredit, setHoverCredit] = useState<number | null>(null)

    const allocatorRef = useRef<ColorAllocator | null>(null)

    if (!allocatorRef.current) {
        allocatorRef.current = new ColorAllocator()
    }

    const allocator = allocatorRef.current

    const { id } = use(params)

    useEffect(() => {
        const fetchShow = async () => {
            setLoading(true)
            
            try {
                const res = await fetch(`/api/show?id=${id}`)
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

                setShowInfo(result)
            } catch (err) {
                console.error("Error fetching Shows", err)
            }
            setLoading(false)
        }

        fetchShow()
    }, [])

    useEffect(() => {
        if (!showInfo) return

        const fetchSeasons = async () => {
            setLoading(true)

            try {
                const seasonPromises = showInfo.seasons
                    .filter(s => s.season_number !== 0)
                    .map(async (s) => {
                        const res = await fetch(`/api/season?showID=${id}&seasonNo=${s.season_number}`)
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
                setSeasons(fixedSeasons)

                const maxEpisodes = Math.max(...fixedSeasons.map(s => s.episodes.length))
                setNumEps(maxEpisodes)

                const boxH = (svgHeight - seasonOffset - (maxEpisodes - 1) * marginSize) / maxEpisodes
                const boxW = (svgWidth - episodeOffset - (fixedSeasons.length - 1) * marginSize) / fixedSeasons.length

                const adjH = minBoxHeight < boxH && boxH < maxBoxHeight ? boxH : boxH <= minBoxHeight ? minBoxHeight : maxBoxHeight
                const adjW = minBoxWidth < boxW && boxW < maxBoxWidth ? boxW : boxW <= minBoxWidth ? minBoxWidth : maxBoxWidth
                
                if (adjH === minBoxHeight || adjW === minBoxWidth) {
                    setBoxHeight(minBoxHeight)
                    setBoxWidth(minBoxWidth)
                }
                else {
                    if (adjH <= adjW * boxRatio) {
                        setBoxHeight(adjH)
                        setBoxWidth(adjH * boxRatioInv)
                    }
                    else {
                        setBoxHeight(adjW * boxRatio)
                        setBoxWidth(adjW)
                    }
                    
                }

                if (adjH === minBoxHeight) {
                    const svgHTemp = seasonOffset + (minBoxHeight * (maxEpisodes)) + (marginSize * (maxEpisodes - 1))
                    setHeightSVG(svgHTemp)
                }

                if (adjW === minBoxWidth) {
                    const svgWTemp = episodeOffset + (minBoxWidth * fixedSeasons.length) + (marginSize * (fixedSeasons.length - 1))
                    setWidthSVG(svgWTemp)
                }

            } catch (err) {
                console.error("Error fetching Seasons", err)
            }
            setLoading(false)
            
        }

        const start = getYear(showInfo.first_air_date).toString()
        const end = showInfo.status === "Ended" ? getYear(showInfo.last_air_date).toString() : "now"

        setStartYear(start)
        setEndYear(end)

        fetchSeasons()
    }, [showInfo])

    useEffect(() => {
        if (!seasons) return

        const fetchPeople = async () => {
            setLoading(true)

            try {
                const peoplePromises = seasons
                    .map(async (s) => {
                        const innerPromises = s.episodes.map(async (e) => {
                            const res = await fetch(`/api/credits?showID=${id}&seasonNo=${s.season_number}&episodeNo=${e.episode_number}`)
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

                setCredits(peopleArr)


            } catch (err) {
                console.error("Error fetching People", err)
            }
            setLoading(false)
        }

        fetchPeople()
    }, [seasons])

    const getOrder = () => {
        if (hoverCredit) return [hoverCredit]
        return Array.from(selectedCreds.keys())
    }

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
                            <p className="text-4xl">{startYear} - {endYear}</p>
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
                                const x = episodeOffset + i * (boxWidth + marginSize)
                                const y = seasonOffset + j * (boxHeight + marginSize)
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
                                fill={backgroundWhite}
                                x={15} y={(num - 1) * (boxHeight + marginSize) + seasonOffset + (boxHeight / 2)}
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
                                fill={backgroundWhite}
                                x={(num - 1) * (boxWidth + marginSize) + episodeOffset + (boxWidth / 2)} y = {15}
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
                            const effectiveOrder = getOrder()           // Get the effective order of selected/hovered credits
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

                            const baseX = episodeOffset + i * (boxWidth + marginSize)
                            const baseY = seasonOffset + j * (boxHeight + marginSize)

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
                                        fill={backgroundWhite}
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
        </div>
    )
}

export default ShowPage