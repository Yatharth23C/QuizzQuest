'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import kaboom from 'kaboom';

export default function MazeQuizGame() {
    const [question, setQuestion] = useState('');
    const [questionId, setQuestionId] = useState('');
    const [questionOptions, setQuestionOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const router = useRouter();
    const kRef = useRef(null);

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
        setCorrectAnswer(storedOptions[0]); // Assume the first option is the correct answer
        setQuestionOptions(storedOptions);
    }, [router]);

    useEffect(() => {
        if (questionOptions.length === 0) return;

        // Cleanup previous Kaboom instance
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

        // Initialize Kaboom with dynamic canvas size
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        kRef.current = kaboom({
            global: true, // Enable global mode for kaboom functions
            width: canvasWidth,
            height: canvasHeight,
            canvas: document.getElementById('gameCanvas'),
            background: [0, 0, 0], // Set a default black background
        });

        const k = kRef.current;

        const paddle = k.add([
            k.rect(100, 20),
            k.pos(canvasWidth / 2 - 50, canvasHeight - 30),
            k.color(0, 255, 0),
            k.area(),
            "paddle",
        ]);

        k.onKeyDown("left", () => {
            paddle.move(-300, 0);
        });

        k.onKeyDown("right", () => {
            paddle.move(300, 0);
        });

        questionOptions.forEach((option, index) => {
            k.loop(1 + index * 0.5, () => {
                const fallingAnswer = k.add([
                    k.rect(80, 40),
                    k.pos(k.rand(0, canvasWidth - 80), 0),
                    k.color(option === correctAnswer ? 0 : 255, option === correctAnswer ? 255 : 0, 0),
                    k.area(),
                    "answer",
                    { optionValue: option },
                ]);

                const answerText = k.add([
                    k.text(option, { size: 16 }),
                    k.pos(fallingAnswer.pos.x + 10, fallingAnswer.pos.y + 10), // Center text inside the box
                    "text",
                ]);

                fallingAnswer.onUpdate(() => {
                    fallingAnswer.move(0, 200); // Move the box downward
                    answerText.pos = fallingAnswer.pos.add(10, 10); // Sync text position with the box
                    if (fallingAnswer.pos.y > canvasHeight) {
                        k.destroy(fallingAnswer);
                        k.destroy(answerText);
                    }
                });

                fallingAnswer.onCollide("paddle", () => {
                    verifyAnswer(fallingAnswer.optionValue).catch((error) => {
                        console.error('Error verifying answer:', error);
                    });
                    k.destroy(fallingAnswer);
                    k.destroy(answerText);
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
                alert("Correct!");
            } else {
                alert("Wrong!");
            }

            router.push('/viewquestions');
        } catch (error) {
            console.error('Error verifying answer:', error);
        }
    };

    return (
        <div>
            <div className='absolute text-2xl p-1 w-screen text-center z-10 top-0'>
                <span className='bg-slate-300 p-2 rounded-md'>{question || 'Navigate the maze to find the correct answer!'}</span>
            </div>
            <div id="gameContainer" className='absolute top-0 left-0 w-full h-full'></div>
        </div>
    );
}