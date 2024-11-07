'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Games() {
    const canvasRef = useRef(null);
    const gravity = 0.1;
    const slowdownDuration = 1000; // Duration for which the boxes slow down
    const normalFallSpeed = 4; // Normal fall speed after slowing down
    const [gameOver, setGameOver] = useState(false);
    const [questionid, setQuestionid] = useState(null);
    const [questionops, setQuestionops] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [start, setStart] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const [resultMessage, setResultMessage] = useState('');
    const [score, setScore] = useState(0);
    const router = useRouter();
    const objectsRef = useRef([]);
    const animationRef = useRef(null);

    // Load question data from localStorage and set correct answer from API
    useEffect(() => {
        const id = localStorage.getItem('current_Q_id');
        const ops = JSON.parse(localStorage.getItem('current_Q_ops'));

        if (id && ops) {
            setQuestionid(id);
            setQuestionops(ops);
        } else {
            router.push('/viewquestions');
        }

        const fetchCorrectAnswer = async () => {
            try {
                const response = await fetch('/api/auth/questions');
                const data = await response.json();
                const matchedQuestion = data.questions.find(q => q._id === id);
                if (matchedQuestion) setCorrectAnswer(Number(matchedQuestion.answer));
            } catch (error) {
                console.error('Error fetching correct answer:', error);
            }
        };

        if (id) fetchCorrectAnswer();
    }, []);

    class GameObject {
        constructor(c, canvas, x, y, optionText, index) {
            this.c = c;
            this.canvas = canvas;
            this.position = { x, y };
            this.velocity = { y: -6 }; // Initial velocity to make the box fly up
            this.width = 150;
            this.height = 150;
            this.slowdownEnd = null;
            this.optionText = optionText;
            this.realIndex = index + 1;
            this.hasSlowedDown = false; // Flag to check if the box has slowed down
        }

        draw() {
            this.c.fillStyle = 'red';
            this.c.fillRect(this.position.x, this.position.y, this.width, this.height);
            this.c.fillStyle = 'white';
            this.c.font = '20px Arial';
            this.c.textAlign = 'center';
            this.c.fillText(this.optionText, this.position.x + this.width / 2, this.position.y + this.height / 2);
        }

        update() {
            // Apply slowdown if within the slowdown duration
            if (this.slowdownEnd && Date.now() < this.slowdownEnd) {
                this.velocity.y = 0.8; // Slow speed during the slowdown phase
                this.hasSlowedDown = true;
            } else if (this.hasSlowedDown) {
                this.velocity.y = normalFallSpeed; // Normal fall speed after slowdown
            } else {
                // If not slowed down, check if it should start slowing down
                if (this.position.y <= innerHeight -600) { // Change this to the height you want to trigger slowdown
                    this.slowdownEnd = Date.now() + slowdownDuration; // Set when to stop slowing down
                }
            }

            // Update position based on velocity
            this.position.y += this.velocity.y;

            // Prevent going off the bottom of the canvas
            if (this.position.y > this.canvas.height) {
                this.position.y = this.canvas.height; // Ensure it doesn't go off-screen
            }
        }

        isClicked(mouseX, mouseY) {
            return mouseX >= this.position.x && mouseX <= this.position.x + this.width &&
                mouseY >= this.position.y && mouseY <= this.position.y + this.height;
        }
    }

    useEffect(() => {
        // Set up Game Objects
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        canvas.width = innerWidth;
        canvas.height = innerHeight;

        objectsRef.current = questionops.map((option, index) =>
            new GameObject(c, canvas, 100 + index * 300, innerHeight + 200, option, index) // Start below the canvas
        );

        const handleGameOver = () => {
            setGameOver(true);
            setStart(false);
            cancelAnimationFrame(animationRef.current);
        };

        const clickHandler = (e) => {
            if (gameOver) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            objectsRef.current.forEach((obj) => {
                if (obj.isClicked(mouseX, mouseY)) {
                    if (obj.realIndex === correctAnswer) {
                        setResultMessage('Correct Answer!');
                        setScore(prevScore => prevScore + 1);
                    } else {
                        setResultMessage('Wrong Answer! Game Over');
                        handleGameOver();
                    }
                }
            });
        };

        canvas.addEventListener('click', clickHandler);

        return () => {
            canvas.removeEventListener('click', clickHandler);
            cancelAnimationFrame(animationRef.current);
        };
    }, [gameOver, questionops, correctAnswer]);

    // Animation Loop (runs independently of the timer)
    useEffect(() => {
        if (!start) return;

        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');

        function animate() {
            if (gameOver) return;

            c.clearRect(0, 0, canvas.width, canvas.height);

            c.fillStyle = 'black';
            c.font = '20px Arial';
            c.fillText(`Time Left: ${timeLeft}s | Score: ${score}`, 20, 30);

            objectsRef.current.forEach((obj) => {
                obj.update();
                obj.draw();
            });

            animationRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => cancelAnimationFrame(animationRef.current);
    }, [start, gameOver]);

    // Countdown Timer (independent of animation)
    useEffect(() => {
        if (!start) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    setGameOver(true);
                    setStart(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [start]);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <canvas ref={canvasRef} style={{ border: '1px solid black' }}>Your browser does not support the canvas element.</canvas>
            {!start && !gameOver && (
                <button
                    onClick={() => {
                        if (questionid && correctAnswer !== null) {
                            setStart(true);
                            setGameOver(false);
                            setTimeLeft(10);
                            setResultMessage('');
                        }
                    }}
                    style={{
                        position: 'absolute', top: '80%', left: '50%', transform: 'translate(-50%, -50%)',
                        padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none',
                        cursor: 'pointer', fontSize: '18px', borderRadius: '5px'
                    }}
                >
                    Start
                </button>
            )}
            {gameOver && <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '36px', fontWeight: 'bold', color: 'red'
            }}>{resultMessage}</div>}
            {resultMessage && !gameOver && <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '24px', fontWeight: 'bold', color: 'green'
            }}>{resultMessage}</div>}
        </div>
    );
}
