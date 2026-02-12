'use client'

import { PAGE_SHOWS, TMDB_IMAGE_BASE } from "@/constants"
import { ShowLite } from "@/types/ShowLite"
import { FileExclamationPoint } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Footer from "../footer/Footer"
import Navbar from "../navbar/Navbar"

type SearchResultsProps = {
    results: ShowLite[]
    query: string
}


const SearchResults = ({ results, query }: SearchResultsProps) => {
    return (
        <div className="flex flex-col">
            <Navbar />
            <div className="flex flex-col justify-center items-center w-full">
                <p className="my-4">Showing {results.length} results for <span className="font-bold text-tomato">{query}</span></p>
                {results.length > 0 && (
                    <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-md text-tomato top-20">
                        <ul>
                            {results.map((result, i) => (
                                <li key={result.id} className="mb-2 flex flex-col justify-start items-stretch space-y-2">
                                    <div className="flex flex-row justify-start items-center space-x-2">
                                        {result.poster_path ? (
                                            <Image
                                                src={`${TMDB_IMAGE_BASE}/w200${result.poster_path}`}
                                                alt={`Image for ${result.name}`}
                                                width={40}
                                                height={40}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-300 rounded-md flex items-center justify-center py-6">
                                                <FileExclamationPoint color="#F06543" />
                                            </div>
                                        )
                                        }
                                        <Link
                                            href={`/show/${result.id}`}
                                            className="text-tomato hover:underline"
                                            target="_self"
                                            rel="noopener noreferrer"
                                        >
                                            {result.name}
                                        </Link>
                                    </div>
                                    
                                    {i !== PAGE_SHOWS - 1 && (
                                        <div className="h-0.5 bg-tomato/25 rounded-full w-full" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default SearchResults