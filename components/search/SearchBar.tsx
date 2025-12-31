'use client'

import { NO_SHOWS, TMDB_IMAGE_BASE } from '@/constants'
import { ShowLite } from '@/types/ShowLite'
import { ShowSearch } from '@/types/ShowSearch'
import { Mic, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

const SearchBar = () => {
	const [searchTerm, setSearchTerm] = useState("")
	const [searchResults, setSearchResults] = useState<ShowLite[]>([])
	const [loading, setLoading] = useState(false)

	const debounce = (
		func: (term: string) => void,
		delay: number
	): ((term: string) => void) => {
		let timeoutID: ReturnType<typeof setTimeout>

		return (term: string) => {
			clearTimeout(timeoutID)
			timeoutID = setTimeout(() => func(term), delay)
		}
	}

	const handleSearch = useCallback(
		debounce(async (term: string) => {
			if (term.trim() === "") {
				setSearchResults([])
				return;
			}

			setLoading(true)

			try {
				const res = await fetch(`/api/search?q=${term}`)
				if (!res.ok) throw new Error("Failed to fetch search results")
				const data: ShowSearch = await res.json()

				const results: ShowLite[] = (data.results ?? []).map(item => ({
					id: item.id,
					name: item.name || "Untitled",
					poster_path: item.poster_path
				})).slice(0, NO_SHOWS)

				setSearchResults(results)
			} catch (err) {
				console.error("Search Error", err)
			}
			setLoading(false)
		}, 300),
		[],
	)

	useEffect(() => {
		handleSearch(searchTerm)
	}, [searchTerm, handleSearch])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}

	return (
		<div className="flex flex-col px-16 items-center relative">
			<form
				onSubmit={(e) => e.preventDefault()}
				className="w-full max-w-2xl"
			>
				<div className="relative">
					<input
						type="text"
						value={searchTerm}
						onChange={handleInputChange}
						className="w-full rounded-full border border-tomato bg-tomato px-5 py-3 pr-20 text-base shadow-md transition-shadow duration-200 hover:shadow-lg focus:border-white focus:outline-1 text-white"
						placeholder="Search EpiShowed"
					/>
					<div className="absolute right-0 top-0 mr-4 mt-3 flex items-center">
						<button
							type="button"
							className="mr-3 text-white hover:text-sandy cursor-pointer"
							onClick={() =>
								alert('Voice search is unsupported in this demo.\nTry implementing this feature yourself')
							}
						>
							<Mic size={20} />
						</button>
						<button type="submit" className="text-white hover:text-sandy cursor-pointer">
							<Search size={20} />
						</button>
					</div>
				</div>
			</form>
			{loading && <div className="text-white mb-2 absolute top-20">Loading...</div>}

			{searchResults.length === 0 && searchTerm.trim().length > 0 && !loading &&
				<div className="w-full text-center max-w-2xl rounded-lg bg-white p-4 shadow-md text-tomato absolute top-20">No shows match the search</div>
			}

			{searchResults.length > 0 && (
				<div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-md text-tomato absolute top-20">
					<ul>
						{searchResults.map((result, i) => (
							<li key={result.id} className="mb-2 flex flex-col justify-start items-stretch space-y-2">
								<div className="flex flex-row justify-start items-center space-x-2">
									<Image
										src={`${TMDB_IMAGE_BASE}/w200${result.poster_path}`}
										alt={`Image for ${result.name}`}
										width={40}
										height={40}
									/>
									<Link
										href={`/show/${result.id}`}
										className="text-tomato hover:underline"
										target="_self"
										rel="noopener noreferrer"
									>
										{result.name}
									</Link>
								</div>
								
								{i !== NO_SHOWS - 1 && (
									<div className="h-0.5 bg-tomato/25 rounded-full w-full" />
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
		
	)
}

export default SearchBar