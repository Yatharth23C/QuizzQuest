'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Games() {
    const canvasRef = useRef(null);
    const holePositionsRef = useRef([]);
    const [gameOver, setGameOver] = useState(false);
    const [questionid, setQuestionid] = useState(null);
    const [questionops, setQuestionops] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [start, setStart] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [resultMessage, setResultMessage] = useState('');
    const [score, setScore] = useState(0);
    const [activeOption, setActiveOption] = useState(null);
    const [activeHole, setActiveHole] = useState(null);
    const router = useRouter();
    const animationRef = useRef(null);

    const shownOptionsRef = useRef(new Set()); // Track shown options to ensure each is displayed at least once

    // Function to randomly display an option
    const showOption = () => {
        if (gameOver || !questionops.length) return;

        // Ensure each option is displayed at least once
        let randomOption;
        if (shownOptionsRef.current.size < questionops.length) {
            // Select an option that hasn't been shown yet
            const remainingOptions = questionops
                .map((_, index) => index)
                .filter(index => !shownOptionsRef.current.has(index));
            randomOption = remainingOptions[Math.floor(Math.random() * remainingOptions.length)];
            shownOptionsRef.current.add(randomOption);
        } else {
            // All options have been shown, so we can select any option at random
            randomOption = Math.floor(Math.random() * questionops.length);
        }

        const randomHole = Math.floor(Math.random() * holePositionsRef.current.length);

        setActiveOption(randomOption);
        setActiveHole(randomHole);

        setTimeout(() => {
            if (!gameOver) {
                setActiveOption(null);
                setActiveHole(null);
            }
        }, 1500);
    };

    // Set up Game Objects and canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        canvas.width = innerWidth;
        canvas.height = innerHeight;

        holePositionsRef.current = [
            { x: canvas.width / 4, y: canvas.height / 2 },
            { x: canvas.width / 2, y: canvas.height / 2 },
            { x: (3 * canvas.width) / 4, y: canvas.height / 2 },
            { x: canvas.width / 2, y: canvas.height / 3 }
        ];

        const drawHoles = () => {
            c.fillStyle = '#1E1E1E';  // Dark gray for holes
            holePositionsRef.current.forEach(({ x, y }) => {
                c.beginPath();
                c.ellipse(x, y, 50, 30, 0, 0, Math.PI * 2);
                c.fill();
            });
        };

        const drawActiveOption = () => {
            if (activeOption === null || activeHole === null) return;
            const { x, y } = holePositionsRef.current[activeHole];

            c.fillStyle = '#8A2BE2';  // Purple for active option
            c.beginPath();
            c.ellipse(x, y - 40, 50, 30, 0, 0, Math.PI * 2);
            c.fill();

            c.fillStyle = '#FFFF00';  // Yellow for text
            c.font = '20px Arial';
            c.textAlign = 'center';
            c.fillText(questionops[activeOption], x, y - 35);
        };

        const animate = () => {
            if (gameOver) return;

            c.clearRect(0, 0, canvas.width, canvas.height);
            drawHoles();
            drawActiveOption();

            c.fillStyle = '#FFFFFF';  // White for score and timer text
            c.font = '20px Arial';
            c.fillText(`Time Left: ${timeLeft}s | Score: ${score}`, 20, 30);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationRef.current);
    }, [gameOver, questionops, activeOption, activeHole, timeLeft, score]);

    // Handle Game Over and check answer logic
    const clickHandler = async (e) => {
        if (gameOver) return;
    
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
    
        if (activeHole !== null) {
            const { x, y } = holePositionsRef.current[activeHole];
            const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - (y - 40)) ** 2);
    
            const wasCorrect = activeOption === correctAnswer - 1;
            setResultMessage(wasCorrect ? 'Correct Answer!' : 'Wrong Answer! Game Over');
            
            // Update score locally
            if (wasCorrect) {
                setScore(score + 1);
                localStorage.setItem('score', score + 1); // Save score locally
            }
    
            // Save answer result to the database
            await fetch('/api/auth/recordAnswer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: localStorage.getItem('userEmail'),
                    questionId: questionid,
                    isCorrect: wasCorrect,
                }),
            });
    
            setGameOver(true);
            router.push('/viewquestions');
        }
    };
    

    // Countdown timer and periodic option display
    useEffect(() => {
        if (!start) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setGameOver(true);
                    setStart(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const optionInterval = setInterval(showOption, 2000);

        return () => {
            clearInterval(timer);
            clearInterval(optionInterval);
        };
    }, [start]);

    // Load question data from localStorage and fetch correct answer
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
                if (matchedQuestion) setCorrectAnswer(matchedQuestion.answer);
            } catch (error) {
                console.error('Error fetching correct answer:', error);
            }
        };

        if (id) fetchCorrectAnswer();

        const savedScore = localStorage.getItem('score');
        if (savedScore) setScore(parseInt(savedScore, 10)); // Load score from localStorage
    }, []);

    return (
        <div style={{ position: 'relative', display: 'inline-block', backgroundColor: '#222222' }}>
            <canvas
                ref={canvasRef}
                style={{ border: '1px solid #8A2BE2', boxShadow: '0px 0px 10px 3px rgba(138, 43, 226, 0.8)' }}
                onClick={clickHandler}
            >
                Your browser does not support the canvas element.
            </canvas>
            {!start && !gameOver && (
                <button
                    onClick={() => {
                        if (questionid && correctAnswer !== null) {
                            setStart(true);
                            setGameOver(false);
                            setTimeLeft(10);
                            setResultMessage('');
                            shownOptionsRef.current.clear(); // Reset shown options
                        }
                    }}
                    style={{
                        position: 'absolute', top: '80%', left: '50%', transform: 'translate(-50%, -50%)',
                        padding: '10px 20px', backgroundColor: '#8A2BE2', color: 'white', border: 'none',
                        cursor: 'pointer', fontSize: '18px', borderRadius: '5px'
                    }}
                >
                    Start
                </button>
            )}
            {gameOver && <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '36px', fontWeight: 'bold', color: '#FF6347'  // Tomato red for game over
            }}>{resultMessage}</div>}
            {resultMessage && !gameOver && <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '24px', fontWeight: 'bold', color: '#00FF00'  // Lime green for correct
            }}>{resultMessage}</div>}
        </div>
    );
}
