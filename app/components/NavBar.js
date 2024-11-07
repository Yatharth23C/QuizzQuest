'use client';
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
    const [isOpen, setisOpen] = useState(false);
    const router = useRouter();
    
    const ToggleMenu = () => {
        setisOpen(!isOpen);
        console.log(isOpen);
    };

    const HandleHome = () => {
        router.push('/');
    };

    return (
        <>
            <div className="w-full flex items-center fixed top-0 left-0 h-16 bg-black text-white text-2xl z-50 px-6">
                {/* Home Button */}
                <div>
                    <Image 
                        onClick={HandleHome} 
                        className="home hover:cursor-pointer" 
                        src="/house.png" 
                        alt="home button" 
                        width={30} 
                        height={30} 
                    />
                </div>
                <div>
                   <button className="hover:cursor-pointer ml-10    p-2 rounded-full">Rankings</button>
                </div>

                {/* Title */}
                <div className="ml-auto mr-auto font-semibold select-none">QuizQuest</div>

                {/* Right side buttons */}
                <div className="flex items-center space-x-4">
                    
                    <Image 
                        onClick={ToggleMenu} 
                        className="menubar hover:cursor-pointer" 
                        src="/ham_menu.svg" 
                        alt="menu bar" 
                        width={30} 
                        height={30} 
                    />
                </div>
            </div>

            {/* Side Menu */}
            <div className={`flex flex-col fixed top-0 right-0 bg-black text-white w-40 h-screen gap-5 pt-16 px-4 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-40`}>
                <div onClick={() => router.push('/profile')} className="p-2 hover:bg-gray-800 rounded-md hover:cursor-pointer text-lg">
                    My Profile
                </div>
                <div className="p-2 hover:bg-gray-800 rounded-md hover:cursor-pointer text-lg">
                    About Us
                </div>
                <div className="p-2 hover:bg-gray-800 rounded-md hover:cursor-pointer text-lg">
                    Settings
                </div>
            </div>
        </>
    );
}
