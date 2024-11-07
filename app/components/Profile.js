"use client"
import { useSession } from "next-auth/react";
import Image from "next/image"
export default function page(){
const{data:session} = useSession();

if(session){
    return(
        <div className="flex flex-col items-center p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex flex-col items-center">
        <Image 
          height={80} 
          width={80} 
          src={`${session.user.image}`} 
          alt={`${session.user.email}'s profile picture`}
          className="rounded-full border-4 border-gray-700 mb-4"
        />
        <h2 className="text-xl font-semibold">{session.user.email}</h2>
      </div>

      <div className="w-full mt-4 text-center">
        <p className="text-gray-400 text-sm">Welcome to your profile page!</p>
      </div>

      <div className="w-full mt-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-400">Name</span>
          <span className="text-gray-300">{session.user.name || 'No name available'}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-400">Email</span>
          <span className="text-gray-300">{session.user.email}</span>
        </div>

        
      </div>

      <button className="mt-8 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow">
        Edit Profile
      </button>
    </div>
    
        
    
    )
}
return (<p>Not Signed in</p>)
}
