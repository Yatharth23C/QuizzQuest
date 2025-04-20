"use client";
import NavBar from "./NavBar";
import "../global.css";
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from 'react';

export default function Component() {
  const { data: session } = useSession();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSignup = () => {
    router.push('/signuppage');
  };

  // Handle navigation to different pages
  const handleCreateQuestion = () => {
    router.push('/teacher/questions');
  };
  const handleViewQuestions = () => {
    router.push('/viewquestions');
  };
  const handleSolveQuestions = () => {
    router.push('/viewquestions');
  };

  useEffect(() => {
    if (session) {
      // Save the user's profile picture and name to localStorage
      const profilePic = session.user?.image; // Adjust based on session data structure
      const userName = session.user?.name;

      if (profilePic) {
        localStorage.setItem("userProfilePic", profilePic);
      }
      if (userName) {
        localStorage.setItem("userName", userName);
      }

      // Fetch user role
      const fetchRole = async () => {
        try {
          const response = await fetch('/api/auth/user_roles', {
            method: 'GET',
          });
          const data = await response.json();
          if (response.ok) {
            setRole(data.role);
          } else {
            console.error(data.error);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchRole();
    } else {
      setLoading(false);
      localStorage.removeItem("userProfilePic"); 
    localStorage.removeItem("userName");
    }
  }, [session]);

  return (
    <>  
      <div className="min-h-screen flex flex-col   bg-gray-900 text-gray-200  mainbg">
        <NavBar />
        
        <div className="backdrop-blur-md  top-[0px] pt-10 flex flex-col space-y-6 items-center justify-center  w-full h-[92.2vh] rounded-xl  text-center">
          <h1 className="text-[5rem] text-gray-900 font-bold ">Welcome to QuizQuest!</h1>
          
          <h2 className="bg-gray-800 rounded-lg d-4 bg-transparent text-xl font-bold text-gray-900">
            QuizQuest is an online platform to solve quizzes in a fun and interactive way.
          </h2>
          
          <h2 className="bg-gray-800 rounded-lg p-4 bg-transparent text-xl font-bold text-gray-900">
            We offer a platform for teachers and students to engage in a healthy competitive environment.
          </h2>
          
          <h2 className="bg-gray-800 rounded-lg p-4 bg-transparent text-xl font-bold text-gray-900">
            Our aim is to make quizzes more enjoyable, encouraging students to discover answers by playing a variety of games.
          </h2>

          {!session ? (
            <button
              onClick={() => signIn()}
              className="bg-yellow-500 text-gray-900 py-2 px-6 rounded-lg font-semibold hover:bg-yellow-400 transition duration-200 bg-gradient-to-r from-yellow-500 to-yellow-200"
            >
              Login
            </button>
          ) : (
            <>
              <button 
                onClick={() => signOut()}
                className="bg-white max-w-fit  text-black relative right-2 py-2 px-6 rounded-lg font-semibold  transition duration-200"
              >
                Sign Out
              </button>

              {!loading && role === null && (
                <button
                  onClick={handleSignup}
                  className="bg-green-600 text-gray-900 py-2 px-6 rounded-lg font-semibold hover:bg-green-500 transition duration-200"
                >
                  Select Role
                </button>
              )}

              {/* Render Teacher-specific buttons */}
              {role === 'teacher' && (
                <div className="mt-4 space-x-4">
                  <button
                    onClick={handleCreateQuestion}
                    className="text-white bg-black   py-2 px-6 rounded-lg font-semibold  transition duration-200"
                  >
                    Create Questions
                  </button>
                  <button
                    onClick={handleViewQuestions}
                    className="bg-gradient-to-r from-yellow-500 to-white-600 bg-yellow-600 text-gray-900 py-2 px-6 rounded-lg font-semibold hover:bg-yellow-500 transition duration-200"
                  >
                    View Questions
                  </button>
                </div>
              )}

              {/* Render Student-specific button */}
              {role === 'student' && (
                <div className="mt-4 ">
                  <button
                    onClick={handleSolveQuestions}
                    className="bg-white  text-gray-900 py-2 px-6  rounded-lg font-semibold  transition duration-200"
                  >
                    Solve Questions
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
