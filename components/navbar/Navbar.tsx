import SearchBar from '../search/SearchBar'
import Image from 'next/image'

type NavbarProps = {
    main?: boolean
}

const Navbar = ({main = false}: NavbarProps) => {
    return (
        <div className="flex flex-row justify-between items-center w-full mx-8 my-4">
            <Image
                src="/epilogo_fixed.png"
                alt="Logo"
                width={200}
                height={50}
            />
            <div className="flex flex-row">
                {!main &&
                    <SearchBar />
                }
            </div>
        </div>
    )
}

export default Navbar