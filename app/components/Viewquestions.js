'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ViewQuestions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [solvedQuestions, setSolvedQuestions] = useState([]);
    const router = useRouter();

    // Fetch questions and solved status on mount
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

        // Load solved questions from localStorage
        const solved = JSON.parse(localStorage.getItem('solvedQuestions')) || [];
        setSolvedQuestions(solved);
    }, []);

    const handleQuestionClick = (id, ops) => {
        // Save question details to localStorage for the solving area
        localStorage.setItem('current_Q_id', id);
        localStorage.setItem('current_Q_ops', JSON.stringify(ops));

        // Update solved questions in localStorage and state
        const updatedSolvedQuestions = [...solvedQuestions, id];
        setSolvedQuestions(updatedSolvedQuestions);
        localStorage.setItem('solvedQuestions', JSON.stringify(updatedSolvedQuestions));

        // Navigate to solving area
        router.push(`/solvingarea`);
    };

    return (
        <div className="p-6">
            {loading ? (
                <p className="text-white text-lg">Loading...</p>
            ) : questions.length > 0 ? (
                questions.map((question, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 text-white p-4 mb-6 rounded-lg shadow-md"
                    >
                        <button
                            onClick={() => handleQuestionClick(question._id, question.Options)}
                            disabled={solvedQuestions.includes(question._id)} // Disable if solved
                            className={`text-xl font-semibold mb-3 ${
                                solvedQuestions.includes(question._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            Question {index + 1}: {question.question}
                        </button>
                        {/* <ul className="pl-4 mb-4 list-disc list-inside space-y-2">
                            {question.Options.map((option, i) => (
                                <li
                                    key={i}
                                    className="text-gray-300 bg-gray-900 p-2 rounded-md hover:bg-gray-700"
                                >
                                    {option}
                                </li>
                            ))}
                        </ul> */}
                        <p className="text-green-400 font-medium">
                            Correct Answer: {}
                        </p>
                        <hr className="border-gray-700 mt-4" />
                    </div>
                ))
            ) : (
                <p className="text-white text-lg">No questions found.</p>
            )}
        </div>
    );
}
