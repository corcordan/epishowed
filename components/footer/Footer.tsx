import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer className="flex flex-row justify-between items-center w-full px-8 py-4 mt-8">
        <p>This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p>
        <div className="flex flex-row items-center space-x-4">
            <p>All data from:</p>
            <Link 
                href="https://www.themoviedb.org/"
            >
                <Image 
                    src="/tmdb_logo.svg"
                    alt="TMDB Logo"
                    width={100}
                    height={50}
                />
            </Link>
        </div>
    </footer>
  )
}

export default Footer