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
    }
  }, [session]);

  return (
    <>  
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 p-6 mainbg">
        <NavBar />
        
        <div className="max-w-3xl text-center space-y-6 mt-12">
          <h1 className="text-4xl font-bold text-yellow-400">Welcome to QuizQuest!</h1>
          
          <p className="bg-gray-800 rounded-lg p-4 bg-transparent text-xl font-bold text-white">
            QuizQuest is an online platform to solve quizzes in a fun and interactive way.
          </p>
          
          <p className="bg-gray-800 rounded-lg p-4 bg-transparent text-xl font-bold text-white">
            We offer a platform for teachers and students to engage in a healthy competitive environment.
          </p>
          
          <p className="bg-gray-800 rounded-lg p-4 bg-transparent text-xl font-bold text-white">
            Our aim is to make quizzes more enjoyable, encouraging students to discover answers by playing a variety of games.
          </p>

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
                className="bg-red-600 relative right-2 text-gray-900 py-2 px-6 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-orange-400 transition duration-200"
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
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-blue-600 text-gray-900 py-2 px-6 rounded-lg font-semibold hover:bg-blue-500 transition duration-200"
                  >
                    Create Questions
                  </button>
                  <button
                    onClick={handleViewQuestions}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-purple-600 text-gray-900 py-2 px-6 rounded-lg font-semibold hover:bg-purple-500 transition duration-200"
                  >
                    View Questions
                  </button>
                </div>
              )}

              {/* Render Student-specific button */}
              {role === 'student' && (
                <div className="mt-4">
                  <button
                    onClick={handleSolveQuestions}
                    className="bg-indigo-600 text-gray-900 py-2 px-6 rounded-lg font-semibold hover:bg-indigo-500 transition duration-200"
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
