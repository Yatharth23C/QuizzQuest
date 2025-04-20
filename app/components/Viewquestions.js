'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "./NavBar";

export default function ViewQuestions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [solvedQuestions, setSolvedQuestions] = useState([]);
    const [score, setScore] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/api/auth/questions');
                const data = await response.json();
                setQuestions(data.questions || []);
            } catch (error) {
                console.error('Error fetching questions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();

        // Load solved questions and score from localStorage
        const solved = JSON.parse(localStorage.getItem('solvedQuestions')) || [];
        setSolvedQuestions(solved);

        const savedScore = localStorage.getItem('score');
        if (savedScore) setScore(parseInt(savedScore, 10));
    }, []);

    const handleQuestionClick = (id, text, ops) => {
        // Save question details to localStorage
        localStorage.setItem('current_Q_id', id);
        localStorage.setItem('current_Q_text', text);  // ✅ Store question text
        localStorage.setItem('current_Q_ops', JSON.stringify(ops));

        // Update solved questions in localStorage and state
        if (!solvedQuestions.includes(id)) {
            const updatedSolvedQuestions = [...solvedQuestions, id];
            setSolvedQuestions(updatedSolvedQuestions);
            localStorage.setItem('solvedQuestions', JSON.stringify(updatedSolvedQuestions));
        }

        // Navigate to solving area
        router.push('/solvingarea');
    };

    return (<>
            <NavBar />
        <div className="p-6 h-screen" style={{ backgroundColor: 'black', color: '#FFFFFF' }}>
            <div style={{ paddingTop: '70px', paddingBottom: '20px', fontSize: '20px', color: '#FFFF00' }}>
                <p style={{ textAlign: 'center' }}>Score: {score}</p>
            </div>

            {loading ? (
                <p className="text-lg mt-20 text-white">Loading...</p>
            ) : questions.length > 0 ? (
                questions.map((question, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 text-white mt-12 p-4 mb-6 rounded-lg shadow-md"
                        style={{ border: '2px solid #8A2BE2' }}
                    >
                        <button
                            onClick={() => handleQuestionClick(question._id, question.question, question.ops)}
                            disabled={solvedQuestions.includes(question._id)}
                            className={`text-xl font-semibold mb-3 ${
                                solvedQuestions.includes(question._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            style={{
                                color: solvedQuestions.includes(question._id) ? 'blue' : 'yellow',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: solvedQuestions.includes(question._id) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Question {index + 1}: {question.question}
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-white text-lg">No questions found.</p>
            )}
        </div>
        </>
    );
}
