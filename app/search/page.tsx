import SearchResults from "@/components/searchResults/searchResults"
import { NO_SHOWS } from "@/constants"
import { searchShows } from "@/lib/search"
import { ShowLite } from "@/types/ShowLite"
import { ShowSearch } from "@/types/ShowSearch"
import { redirect } from "next/navigation"

const SearchPage = async ({searchParams}: {searchParams: Promise<{ [key: string]: string }>}) => {
    const query = (await searchParams).q ?? ""
    
    try {
        const data: ShowSearch = await searchShows(query)

        const results: ShowLite[] = (data.results ?? []).map(item => ({
            id: item.id,
            name: item.name || "Untitled",
            poster_path: item.poster_path
        }))
        return (
            <SearchResults results={results} query={query} />
        )
    } catch (err) {
        console.error("Search Error", err)
        redirect("/error")
    }
}

export default SearchPage