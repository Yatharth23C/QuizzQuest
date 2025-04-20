'use client';
import { useState } from 'react';
import NavBar from "../../components/NavBar";

export default function Page() {
    const [options, setOptions] = useState([]);
    const [currentOption, setCurrentOption] = useState('');
    const [questions, setQuestions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [question, setQuestion] = useState('');
    const [similarQuestions, setSimilarQuestions] = useState([]);

    const handleAddOption = () => {
        if (options.length < 4 && currentOption.trim() !== '') {
            setOptions([...options, currentOption]);
            setCurrentOption('');
        }
    };

    const handleProblem = () => {
        if (correctAnswer.trim() !== '' && options.length === 4 && question.trim() !== '') {
            setQuestions(prevQuestions => [
                ...prevQuestions,
                { question, options: options.slice(), answer: correctAnswer }
            ]);

            setTimeout(() => {
                setOptions([]);
                setQuestion('');
                setCorrectAnswer('');
            }, 100);
        }
    };

    const handleSubmitSet = async () => {
        if (questions.length === 0) {
            console.warn("No questions to submit!");
            return;
        }

        try {
            const formattedQuestions = questions.map(q => ({
                question: q.question,
                ops: [...q.options],
                answer: q.answer
            }));

            const response = await fetch('/api/auth/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ questions: formattedQuestions })
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Questions added successfully:', data);
                setQuestions([]);
            } else {
                console.error('Error adding questions:', data.error);
            }
        } catch (error) {
            console.error('Failed to send questions', error);
        }
    };

    const fetchSimilarQuestions = async (input) => {
        if (!input.trim()) {
            setSimilarQuestions([]);
            return;
        }

        try {
            const response = await fetch('/api/auth/getsimilarquestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: input }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSimilarQuestions(data.similarQuestions.slice(0, 3)); // Limit to 3 suggestions
            } else {
                console.error('Error fetching similar questions:', data.error);
                setSimilarQuestions([]);
            }
        } catch (error) {
            console.error('Failed to fetch similar questions', error);
            setSimilarQuestions([]);
        }
    };

    return (
        <>
            <NavBar />
            <div
                style={{
                    backgroundImage: `url("/wavy_smoothed.png")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backdropFilter: "blur(10px)",
                    width: "100%",
                    height: "91.5vh"
                }}
                className="flex flex-col  items-center min-h-full"
            >
                <div className='flex flex-row items-center justify-center min-h-full min-w-full backdrop-blur-md'>
                    <div className="flex flex-col  relative left-40  items-center bg-black text-white rounded-lg shadow-lg p-8 min-w-[500px]">
                        <input
                            onChange={(e) => {
                                setQuestion(e.target.value);
                                fetchSimilarQuestions(e.target.value);
                            }}
                            value={question}
                            className="outline-none min-w-[400px] border text-black rounded-md m-2 p-3 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your question"
                        />
                        <input
                            value={currentOption}
                            className="outline-none border text-black rounded-md m-2 p-3 focus:ring-2 focus:ring-blue-500 min-w-[300px]"
                            onChange={(e) => setCurrentOption(e.target.value)}
                            placeholder="Enter an option"
                        />
                        <input
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            className="outline-none border text-black rounded-md m-2 p-3 focus:ring-2 focus:ring-blue-500 min-w-[300px]"
                            placeholder="Enter the correct answer"
                        />
                        <div className="flex space-x-3 mt-4">
                            <button className="bg-stone-600 text-white rounded-md px-6 py-2 hover:bg-blue-800" onClick={handleProblem}>
                                Add problem
                            </button>
                            <button className="bg-stone-600 text-white rounded-md px-6 py-2 hover:bg-blue-800" onClick={handleAddOption}>
                                Add option
                            </button>
                            <button className="bg-yellow-500 text-black rounded-md px-6 py-2 hover:bg-yellow-600" onClick={handleSubmitSet}>
                                Submit this set
                            </button>
                        </div>
                        {options.length > 0 && (
                            <div className="overflow-y-auto max-h-[200px] w-full mt-4">
                                {options.map((option, i) => (
                                    <div className="m-1 p-2 rounded border border-yellow-400 min-w-[300px]" key={i}>
                                        {i + 1}. {option}
                                    </div>
                                ))}
                            </div>
                        )}
                        {questions.length > 0 && (
                            <div className="mt-5 w-full">
                                {questions.map((q, index) => (
                                    <div className="flex flex-col text-white rounded-md m-2 p-4 border border-gray-700" key={index}>
                                        <div className="text-lg font-semibold text-yellow-300"><strong>Question:</strong> {q.question}</div>
                                        <ul className="flex flex-col space-y-2 mt-2">
                                            {q.options.map((option, i) => (
                                                <li className="m-1 p-1" key={i}>{i + 1}. {option}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col relative right-[-160px] bg-gray-800 text-white rounded-md p-4 ml-4 w-[300px]">
                        <h3 className="text-yellow-400 font-semibold mb-2">Similar Questions:</h3>
                        {similarQuestions.length > 0 ? (
                            <ul className="list-disc list-inside text-lg">
                                {similarQuestions.map((q, index) => (
                                    <li key={index} className="text-sm">{q}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400">No suggestions available.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
