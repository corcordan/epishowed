'use client'

import { TMDB_IMAGE_BASE } from '@/constants'
import { ColorAllocator } from '@/lib/ColorAllocator'
import { Credit } from '@/types/Credit'
import { User } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

type CreditBoxProps = {
    credit: Credit
    selectedCreds: Map<number, number[]>
    setSelectedCreds: React.Dispatch<React.SetStateAction<Map<number, number[]>>>
    hoverCredit: number | null
    setHoverCredit: React.Dispatch<React.SetStateAction<number | null>>
    allocator: ColorAllocator
}

const CreditBox = ({ credit, selectedCreds, setSelectedCreds, hoverCredit, setHoverCredit, allocator }: CreditBoxProps) => {
    const isSelected = selectedCreds.has(credit.id)
    const isHovered = hoverCredit === credit.id

    const handleMouseEnter = () => {
        if (selectedCreds.size > 0) return
        allocator.assign(credit.id)
        setHoverCredit(credit.id)
    }

    const handleMouseLeave = () => {
        if (isSelected) return
        allocator.release(credit.id)
        setHoverCredit(null)
    }

    const handleClick = () => {
        if (isSelected) {
            setSelectedCreds(prev => {
                const newMap = new Map(prev)
                newMap.delete(credit.id)
                return newMap
            })
            allocator.release(credit.id)
        } else if (selectedCreds.size < 5) {
            allocator.assign(credit.id)
            setSelectedCreds(prev => {
                const newMap = new Map(prev)
                newMap.set(credit.id, [...credit.episodes])
                return newMap
            })
            setHoverCredit(null)
        }
    }

    return (
        <button
            style={{
                borderColor: (isSelected || isHovered)
                    ? allocator.getAssignedColors().get(credit.id)
                    : "transparent"
            }}
            className={`border-2 rounded-2xl p-2 flex flex-col justify-between items-center mx-2`}
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
                <div className="pt-4">
                    <User color="#F06543" />
                </div>
            )}
            <p className="text-tomato whitespace-nowrap">{credit.name}</p>
        </button>
    )
}

export default CreditBox
