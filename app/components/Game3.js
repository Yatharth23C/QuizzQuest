'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import kaboom from 'kaboom';

export default function ShootingQuizGame() {
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
            global: false,
            width: canvasWidth,
            height: canvasHeight,
            canvas: document.getElementById('gameCanvas'),
            background: [20, 20, 20],
            debug: false,
        });

        const k = kRef.current;

        // Show instructions popup
        const instructions = k.add([
            k.text("Use LEFT/RIGHT to move, SPACE to shoot!", { size: 24, width: canvasWidth, align: "center" }),
            k.pos(canvasWidth / 2, canvasHeight / 2),
            k.anchor("center"),
            k.color(255, 255, 255),
            "instructions",
        ]);

        // Remove instructions after 3 seconds
        k.wait(3, () => {
            instructions.destroy();
        });

        // Add the player (cylinder) at the bottom
        const player = k.add([
            k.rect(50, 20),
            k.pos(canvasWidth / 2, canvasHeight - 50),
            k.color(0, 255, 0),
            k.area(),
            "player",
        ]);

        // Move the player left and right
        k.onKeyDown("left", () => {
            player.move(-300, 0); // Increased speed
        });
        k.onKeyDown("right", () => {
            player.move(300, 0); // Increased speed
        });

        // Shoot bullets
        k.onKeyPress("space", () => {
            k.add([
                k.circle(5),
                k.pos(player.pos.x + 25, player.pos.y),
                k.color(255, 255, 255),
                k.area(),
                k.move(k.vec2(0, -1), 900), // Increased bullet speed
                "bullet",
            ]);
        });

        // Create moving boxes with options
        questionOptions.forEach((option, index) => {
            const startX = index % 2 === 0 ? 50 : canvasWidth - 150; // Alternate starting positions with padding
            const directionX = startX === 50 ? 1 : -1; // Move right if starting from left, otherwise move left
            const y = 50 + index * 60; // Stagger boxes vertically
            const speedX = 200 + Math.random() * 100; // Assign random horizontal speed

            const box = k.add([
                k.rect(100, 50),
                k.pos(startX, y),
                k.color(0, 0, 255),
                k.outline(2, k.rgb(255, 255, 255)),
                k.area(),
                "box",
                {
                    optionValue: option,
                    directionX,
                    speedX,
                },
            ]);

            // Add text label to the box
            const label = k.add([
                k.text(option, { size: 12, width: 90, align: "center" }),
                k.pos(box.pos.x + 50, box.pos.y + 25), // Center text inside the box
                k.anchor("center"),
                k.color(255, 255, 255),
                "boxText",
            ]);

            // Update the label position to follow the box
            box.onUpdate(() => {
                // Move the box horizontally
                box.pos.x += box.directionX * box.speedX * k.dt();

                // Bounce off the left and right walls
                if (box.pos.x <= 0 || box.pos.x + 100 >= canvasWidth) {
                    box.directionX *= -1; // Reverse horizontal direction
                }

                // Update label position
                label.pos = k.vec2(box.pos.x + 50, box.pos.y + 25);
            });
        });

        // Handle collisions between bullets and boxes
        k.onCollide("bullet", "box", (bullet, box) => {
            bullet.destroy();
            box.destroy();
            verifyAnswer(box.optionValue);
        });

        // End the game after 14 seconds
        k.wait(20, () => {
            router.push('/viewquestions');
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
                <span className='bg-slate-300 p-2 rounded-md'>{question || 'Shoot the correct answer!'}</span>
            </div>
            <div id="gameContainer" className='absolute top-0 left-0 w-full h-full'></div>
        </div>
    );
}
