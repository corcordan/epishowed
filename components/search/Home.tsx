'use client'

import Navbar from '../navbar/Navbar'
import SearchBar from './SearchBar'
import Footer from '../footer/Footer'

const HomePage = () => {
  return (
    <div className="flex flex-col h-dvh font-sans justify-between">
        <div>
            <Navbar main={true} />
            <div className="flex flex-col justify-center items-center w-full space-y-4 mt-32">
                <div className="text-7xl">EpiShowed</div>
                <div className="text-3xl">Search your favorite shows!</div>
                <SearchBar />
            </div>
        </div>
        <Footer />
    </div>
  )
}

export default HomePage