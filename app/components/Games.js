'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import kaboom from 'kaboom';

export default function FetchAnswer() {
    const [question, setQuestion] = useState('');
    const [questionId, setQuestionId] = useState('');
    const [questionOptions, setQuestionOptions] = useState([]);
    const [resultMessage, setResultMessage] = useState('');
    const [score, setScore] = useState(() => Number(localStorage.getItem('score')) || 0);
    const kRef = useRef(null);
    const router = useRouter();
    let activeOption = null; // Track the currently displayed option

    useEffect(() => {
        const storedQuestion = localStorage.getItem('current_Q_text');
        const storedOptions = JSON.parse(localStorage.getItem('current_Q_ops'));
        const storedQuestionId = localStorage.getItem('current_Q_id');

        if (!storedQuestion || !storedOptions || !storedQuestionId) {
            router.push('/viewquestions');
            return;
        }

        setQuestion(storedQuestion);
        setQuestionOptions(storedOptions);
        setQuestionId(storedQuestionId);

        if (!kRef.current) {
            kRef.current = kaboom({
                global: false,
                width: 1255,
                height: 755,
                canvas: document.getElementById('gameCanvas'),
            });

            const k = kRef.current;
            const minY = 100;
            const maxY = 510;
            k.setGravity(880);

            const holes = [
                k.add([k.rect(150, 150), k.color(0, 0, 0), k.pos(k.rand(50, 150), k.rand(minY, maxY)), k.body({ isStatic: true }), k.area()]),
                k.add([k.rect(150, 150), k.color(0, 0, 0), k.pos(k.rand(400, 450), k.rand(minY, maxY)), k.body({ isStatic: true }), k.area()]),
                k.add([k.rect(150, 150), k.color(0, 0, 0), k.pos(k.rand(600, 650), k.rand(minY, maxY)), k.body({ isStatic: true }), k.area()]),
                k.add([k.rect(150, 150), k.color(0, 0, 0), k.pos(k.rand(800, 850), k.rand(minY, maxY)), k.body({ isStatic: true }), k.area()]),
            ];

            function showOptionInHole() {
                if (activeOption) {
                    setTimeout(() => {
                        if (activeOption) {
                            activeOption.destroy();
                            activeOption = null;
                        }
                    }, 1500); // Wait 1.5 seconds before destroying the previous option
                }

                const randomHole = holes[Math.floor(Math.random() * holes.length)];
                const randomOption = storedOptions[Math.floor(Math.random() * storedOptions.length)];

                activeOption = k.add([
                    k.text(randomOption, { size: 24 }),
                    k.color(255, 255, 255),
                    k.pos(randomHole.pos.x + 60, randomHole.pos.y + 60),
                    k.area(),
                    "option",
                    { value: randomOption },
                ]);

                activeOption.onClick(() => {
                    verifyAnswer(randomOption);
                });
            }

            k.loop(2, showOptionInHole); // Spawns a new option every 2 seconds
        }

        return () => {
            if (kRef.current) {
                try {
                    kRef.current.destroy();
                    kRef.current.loop(0,()=>{})
                } catch (error) {
                    console.error("Error destroying Kaboom instance:", error);
                }
                kRef.current = null;
            }
        };
    }, [router]);

    const verifyAnswer = async (selectedAnswer) => {
        console.log(`Selected: ${selectedAnswer}`);
        const storedQuestionId = localStorage.getItem('current_Q_id');

        if (!storedQuestionId) {
            console.error("Error: Question ID is missing");
            return;
        }

        try {
            const response = await fetch('/api/auth/verifyanswer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: storedQuestionId,
                    selectedAnswer,
                }),
            });

            const data = await response.json();

            if (data.isCorrect) {
                setResultMessage('✅ Correct Answer!');
                alert("Correct");
                const newScore = score + 1;
                setScore(newScore);
                localStorage.setItem('score', newScore);
                setTimeout(() => router.push('/viewquestions'), 10);
            } else {
                alert("Wrong");
                setResultMessage('❌ Wrong Answer! Game Over.');
                setTimeout(() => router.push('/viewquestions'), 2000);
            }
        } catch (error) {
            console.error('Error verifying answer:', error);
        }
    };

    return (
        <div>
            <div className='absolute text-2xl p-1 w-screen text-center z-10 top-0 '>
                <span className='bg-slate-300 p-2 rounded-md'>{question} </span>
            </div>
            <canvas id="gameCanvas" className="absolute top-0 left-0"></canvas>
        </div>
    );
}
