'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import kaboom from 'kaboom';

export default function MemoryQuizGame() {
    const [question, setQuestion] = useState('');
    const [questionId, setQuestionId] = useState('');
    const [questionOptions, setQuestionOptions] = useState([]);
    const [resultMessage, setResultMessage] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(() => {
        if (typeof window !== 'undefined') {
            return Number(localStorage.getItem('score')) || 0;
        }
        return 0;
    });
    const kRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const storedQuestion = localStorage.getItem('current_Q_text');
        const storedQuestionId = localStorage.getItem('current_Q_id');
        const storedOptions = JSON.parse(localStorage.getItem('current_Q_ops')) || [];

        if (!storedQuestion || !storedQuestionId) {
            router.push('/viewquestions');
            return;
        }

        setQuestion(storedQuestion);
        setQuestionId(storedQuestionId);

        async function fetchOptions() {
            try {
                const response = await fetch('/api/auth/getsimilaroptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: storedOptions }),
                });

                const data = await response.json();
                if (data.success) {
                    const mergedOptions = [...new Set([...storedOptions, ...data.options])];
                    setQuestionOptions(mergedOptions);
                } else {
                    setQuestionOptions(storedOptions);
                }
            } catch (error) {
                console.error('Error fetching options:', error);
                setQuestionOptions(storedOptions);
            }
        }
        fetchOptions();
    }, [router]);

    useEffect(() => {
        // Redirect after showing result message
        if (showResult) {
            const timer = setTimeout(() => {
                router.push('/viewquestions');
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [showResult, router]);

    useEffect(() => {
        if (questionOptions.length === 0) return;

        // Cleanup previous game instance if it exists
        if (kRef.current) {
            try {
                kRef.current.quit();
            } catch (e) {
                console.error("Error cleaning up kaboom:", e);
            }
            kRef.current = null;
        }

        // Create a new canvas element
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.id = 'gameCanvas';
            canvas.className = 'absolute top-0 left-0 w-full h-full';
            gameContainer.appendChild(canvas);
        }

        // Initialize Kaboom
        kRef.current = kaboom({
            global: false,
            width: 1800,
            height: 950,
            canvas: document.getElementById('gameCanvas'),
            background: [20, 20, 20],
            debug: false
        });

        const k = kRef.current;

        // Calculate the center of the screen
        const centerX = k.width() / 2;
        const centerY = k.height() / 2;

        // Box dimensions
        const boxWidth = 200;
        const boxHeight = 100;
        const boxSpacing = 50;

        // Calculate grid layout based on number of options
        const maxBoxesPerRow = 3;
        const numOptions = Math.min(questionOptions.length, 9);
        const numRows = Math.ceil(numOptions / maxBoxesPerRow);
        const numCols = Math.min(numOptions, maxBoxesPerRow);

        // Calculate total grid width and height
        const gridWidth = (numCols * boxWidth) + ((numCols - 1) * boxSpacing);
        const gridHeight = (numRows * boxHeight) + ((numRows - 1) * boxSpacing);

        // Calculate starting position (top-left of grid)
        const startX = centerX - (gridWidth / 2);
        const startY = centerY - (gridHeight / 2);

        const boxes = [];
        const textLabels = [];

        function flipCard(k, box, textLabel) {
            if (box.isFlipping) return; // Prevent multiple flips
            box.isFlipping = true;

            // Hide the text label
            if (textLabel) {
                textLabel.hidden = true;
            }

            // Animate the box shrinking horizontally
            k.tween(
                box.scale.x,
                0.1,
                0.25,
                (value) => {
                    box.scale.x = value;
                },
                () => {
                    // Change the box color to indicate it's flipped
                    box.color = k.rgb(50, 50, 150);
                    box.isFlipped = true;

                    // Animate the box expanding back to its original size
                    k.tween(
                        box.scale.x,
                        1,
                        0.25,
                        (value) => {
                            box.scale.x = value;
                        },
                        () => {
                            box.isFlipping = false;
                        }
                    );
                }
            );
        }

        // Create option boxes
        questionOptions.slice(0, 9).forEach((option, index) => {
            const row = Math.floor(index / maxBoxesPerRow);
            const col = index % maxBoxesPerRow;

            const x = startX + (col * (boxWidth + boxSpacing));
            const y = startY + (row * (boxHeight + boxSpacing));

            // Create box
            const box = k.add([
                k.rect(boxWidth, boxHeight),
                k.pos(x, y),
                k.color(0, 0, 0),
                k.outline(4, k.rgb(255, 255, 255)),
                k.area(),
                k.scale(1, 1), // Add the scale component
                "optionBox",
                {
                    optionValue: option,
                    isFlipped: false,
                    isFlipping: false,
                    originalWidth: boxWidth
                }
            ]);

            // Attach click handler to the box
            box.onClick(() => {
                if (!box.isFlipped && !box.isFlipping) {
                    const textLabel = textLabels.find((t) => t.boxRef === box);
                    flipCard(k, box, textLabel);
                }
                if (box.isFlipped) {
                    verifyAnswer(box.optionValue);
                }
            });

            boxes.push(box);

            // Create text label
            const label = k.add([
                k.text(option, {
                    size: 20,
                    width: 180,
                    align: "center"
                }),
                k.pos(x + boxWidth / 2, y + boxHeight / 2),
                k.anchor("center"),
                k.color(255, 255, 255),
                "optionText",
                {
                    boxRef: box
                }
            ]);

            textLabels.push(label);
        });

        // Show options for 4 seconds then flip all cards
        k.wait(4, () => {
            boxes.forEach((box, index) => {
                const textLabel = textLabels.find(t => t.boxRef === box);
                k.wait(index * 0.1, () => {
                    flipCard(k, box, textLabel);
                });
            });
        });

    }, [questionOptions]);

    const verifyAnswer = async (selectedAnswer) => {
        try {
            const response = await fetch('/api/auth/verifyanswer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId,
                    selectedAnswer,
                }),
            });

            const data = await response.json();

            if (data.isCorrect) {
                setIsCorrect(true);
                setResultMessage('Correct!');
                setShowResult(true);
                setScore((prevScore) => {
                    const newScore = prevScore + 1;
                    localStorage.setItem('score', newScore);
                    return newScore;
                });
            } else {
                setIsCorrect(false);
                setResultMessage('Wrong!');
                setShowResult(true);
            }
        } catch (error) {
            console.error('Error verifying answer:', error);
        }
    };

    return (
        <div>
            <div className='absolute text-2xl p-1 w-screen text-center z-10 top-0'>
                <span className='bg-slate-300 p-2 rounded-md'>{question || 'Select the correct option'}</span>
            </div>

            {showResult && (
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-6xl font-bold p-8 rounded-xl shadow-2xl animate-bounce ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {resultMessage}
                </div>
            )}

            <div id="gameContainer" className='absolute top-0 left-0 w-full h-full'></div>
        </div>
    );
}