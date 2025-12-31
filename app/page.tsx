import Navbar from "@/components/navbar/Navbar";
import SearchBar from "@/components/search/SearchBar";

export default function Home() {
    return (
		<div className="flex flex-col h-dvh font-sans">
			<Navbar main={true} />
			<div className="flex flex-col justify-center items-center w-full space-y-4 mt-32">
				<div className="text-7xl">EpiShowed</div>
				<div className="text-3xl">Search your favorite shows!</div>
				<SearchBar />
			</div>
		</div>
    );
}
