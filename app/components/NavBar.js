'use client';
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    
    // Check if user is logged in and get their profile picture URL
    const userProfilePic = localStorage.getItem("userProfilePic"); // Assuming the profile pic URL is stored in localStorage
    const userName = localStorage.getItem("userName"); // Assuming the user name is also stored in localStorage

    const ToggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const HandleHome = () => {
        router.push('/');
    };
    const HandleRankings = () => {
        router.push('/rankings');
    };
    const HandleAboutUs = () => {
        router.push('/aboutus');
    };
    const HandleProfile = () => {
        router.push('/profile');  // Navigate to profile page
    };

    return (
        <>
            <div className="w-full flex items-center fixed top-0 left-0 h-16 bg-black text-white text-2xl z-50 px-6">
                <div className="flex-none">
                    <Image 
                        onClick={HandleHome} 
                        className="hover:cursor-pointer" 
                        src="/house.png" 
                        alt="home button" 
                        width={30} 
                        height={30} 
                    />
                </div>
                <div className="flex-none ml-10">
                    <button 
                        onClick={HandleRankings} 
                        className="hover:cursor-pointer text-xl pt-3 pb-3 pr-4 pl-4 rounded-full text-black bg-yellow-500"
                    >
                        Rankings
                    </button>
                </div>

                {/* Centering QuizQuest text */}
                <div className="flex-grow flex justify-center font-semibold select-none text-2xl mr-[120px]">
                    QuizQuest
                </div>

                {/* Right-side Profile picture or hamburger menu */}
                <div className="flex-none flex items-center space-x-4">
                    {userProfilePic ? (
                        // Display user's profile picture
                        <div className="relative">
                            <Image 
                                onClick={ToggleMenu} 
                                className="hover:cursor-pointer rounded-full border-2 border-yellow-500" 
                                src={userProfilePic} 
                                alt="profile picture" 
                                width={40} 
                                height={40} 
                            />
                        </div>
                    ) : (
                        // Show hamburger menu if no profile picture
                        <Image 
                            onClick={ToggleMenu} 
                            className="hover:cursor-pointer" 
                            src="/ham_menu.svg" 
                            alt="menu bar" 
                            width={30} 
                            height={30} 
                        />
                    )}
                </div>
            </div>

            {/* Sidebar Menu */}
            <div className={`flex flex-col fixed top-0 right-0 bg-black text-white w-40 h-screen gap-5 pt-16 px-4 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-40`}>
                <div onClick={HandleProfile} className="p-2 hover:bg-gray-800 rounded-md hover:cursor-pointer text-lg">
                    My Profile
                </div>
                <div onClick={HandleAboutUs} className="p-2 hover:bg-gray-800 rounded-md hover:cursor-pointer text-lg">
                    About Us
                </div>
                <div className="p-2 hover:bg-gray-800 rounded-md hover:cursor-pointer text-lg">
                    Settings
                </div>
            </div>
        </>
    );
}
