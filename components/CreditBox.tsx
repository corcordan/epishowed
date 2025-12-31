'use client'

import { TMDB_IMAGE_BASE } from '@/constants'
import { ColorAllocator } from '@/lib/ColorAllocator'
import { Credit } from '@/types/Credit'
import { User } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

type CreditBoxProps = {
    credit: Credit
    selectedCreds: Map<number, number[]>
    setSelectedCreds: React.Dispatch<React.SetStateAction<Map<number, number[]>>>
    hoverCredit: number | null
    setHoverCredit: React.Dispatch<React.SetStateAction<number | null>>
    allocator: ColorAllocator
}

const CreditBox = ({ credit, selectedCreds, setSelectedCreds, hoverCredit, setHoverCredit, allocator }: CreditBoxProps) => {
    const [clicked, setClicked] = useState(false)
    const isSelected = selectedCreds.has(credit.id)
    const isHoveredPrev = hoverCredit === credit.id
    const hoverAllowed = selectedCreds.size === 0 || isHoveredPrev

    const handleMouseEnter = () => {
        if (!hoverAllowed) return
        if (isSelected) return
        setHoverCredit(credit.id)
        setSelectedCreds(new Map([[credit.id, credit.episodes]]))
        allocator.assign(credit.id)
    }

    const handleMouseLeave = () => {
        if (!hoverAllowed) return
        if (hoverCredit === credit.id) setHoverCredit(null)
        setSelectedCreds(new Map())
        allocator.release(credit.id)
    }

    const handleClick = () => {
        setSelectedCreds(prev => {
            const newMap = new Map(prev ?? [])

            if (newMap.has(credit.id) && clicked) {
                newMap.delete(credit.id)
                allocator.release(credit.id)
            }
            else if (!newMap.has(credit.id)) {
                if (newMap.size < 5) {
                    newMap.set(credit.id, [...credit.episodes])
                    allocator.assign(credit.id)
                }
                else {
                    // optionally: could provide UI feedback; for now we silently ignore additional clicks
                }
            }

            return newMap
        })
        if (hoverCredit === credit.id) {
            setHoverCredit(null)
        }
        setClicked(!clicked)
    }

    return (
        <button
            style={{
                borderColor:
                (isSelected || isHoveredPrev)
                    ? allocator.getAssignedColors().get(credit.id)
                    : "transparent"
            }}
            className={`border-2 rounded-2xl p-2 flex flex-col justify-center items-center mx-2`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            type="button"
            onClick={handleClick}
        >
            {credit.profile_path ? (
                <Image 
                    src={`${TMDB_IMAGE_BASE}/w45${credit.profile_path}`}
                    alt={`Profile picture for ${credit.name}`}
                    width={40}
                    height={60}
                />
            ) : (
                <User color="#F06543" />
            )}
            <p className="text-tomato whitespace-nowrap">{credit.name}</p>
        </button>
    )
}

export default CreditBox