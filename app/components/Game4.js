'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function FlappyQuizGame() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [birdPosition, setBirdPosition] = useState({ x: 10, y: 50 });
  const [velocity, setVelocity] = useState(0);
  const [answerPositions, setAnswerPositions] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const gameAreaRef = useRef(null);
  const router = useRouter();
  const answeredRef = useRef(false);

  // Adjusted game constants for slower movement
  const GRAVITY = 0.3;        // Reduced gravity for slower falling
  const JUMP_FORCE = -5;       // Reduced jump force for lower jumps
  const BIRD_SPEED = 1;        // Slower horizontal movement
  const BIRD_ROTATION = 1.5;   // Reduced rotation sensitivity

  // Load question and options (unchanged)
  useEffect(() => {
    const storedQuestion = localStorage.getItem('current_Q_text');
    const storedOptions = JSON.parse(localStorage.getItem('current_Q_ops')) || [];
    const correctAns = storedOptions[0];

    if (!storedQuestion || !storedOptions.length) {
      router.push('/viewquestions');
      return;
    }

    setQuestion(storedQuestion);
    setOptions(storedOptions);
    setCorrectAnswer(correctAns);

    // Position answers in a column on the right side
    const positions = storedOptions.map((_, index) => ({
      x: 70 + (index % 2) * 15,
      y: 20 + index * 20,
    }));
    setAnswerPositions(positions);
  }, []);

  // Game loop with adjusted physics
  useEffect(() => {
    if (!gameStarted || answeredRef.current) return;

    const gameLoop = setInterval(() => {
      setVelocity(v => v + GRAVITY);
      setBirdPosition(pos => ({
        x: pos.x + BIRD_SPEED,
        y: Math.max(0, Math.min(pos.y + velocity, 90)) // Keep bird within bounds
      }));

      // Collision detection
      const birdRect = {
        x: birdPosition.x,
        y: birdPosition.y,
        width: 5,
        height: 5
      };

      answerPositions.forEach((pos, index) => {
        const answerRect = {
          x: pos.x,
          y: pos.y,
          width: 15,
          height: 15
        };

        if (
          birdRect.x < answerRect.x + answerRect.width &&
          birdRect.x + birdRect.width > answerRect.x &&
          birdRect.y < answerRect.y + answerRect.height &&
          birdRect.y + birdRect.height > answerRect.y
        ) {
          answeredRef.current = true;
          const isCorrect = options[index] === correctAnswer;
          
          // First verify the answer
          fetch('/api/auth/verifyanswer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              questionId: localStorage.getItem('current_Q_id'),
              selectedAnswer: options[index] 
            }),
          })
          .then(res => res.json())
          .then(data => {
            // Then record the answer
            return fetch('/api/auth/recordAnswer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                questionId: localStorage.getItem('current_Q_id'),
                isCorrect: data.isCorrect
              }),
            });
          })
          .then(() => {
            router.push('/viewquestions');
          });

          clearInterval(gameLoop);
        }
      });

      // Wrap around if bird goes off screen
      if (birdPosition.x > 100) {
        setBirdPosition({ x: 0, y: 50 });
      }
    }, 20); // Keep the same frame rate

    return () => clearInterval(gameLoop);
  }, [gameStarted, birdPosition, velocity, answerPositions]);

  const handleJump = () => {
    if (!gameStarted) setGameStarted(true);
    setVelocity(JUMP_FORCE);
  };

  return (
    <div className="w-screen h-screen bg-blue-200 flex flex-col items-center justify-center" onClick={handleJump}>
      <h1 className="text-2xl mb-2">🐦 Flappy Quiz!</h1>
      {!gameStarted && <p className="mb-4 text-lg">Tap to start!</p>}
      <p className="mb-2 font-bold text-center max-w-md">{question}</p>

      <div ref={gameAreaRef} className="relative w-full h-3/4 bg-blue-300 border-2 border-blue-500 rounded-lg overflow-hidden">
        {/* Bird with adjusted size */}
        <div 
          className="absolute left-4 bg-yellow-400 w-6 h-6 rounded-full"
          style={{
            left: `${birdPosition.x}%`,
            top: `${birdPosition.y}%`,
            transform: `rotate(${velocity * BIRD_ROTATION}deg)`
          }}
        >
          <div className="absolute right-0 top-1 w-3 h-1 bg-orange-500 rounded-full"></div>
        </div>

        {/* Answers */}
        {options.map((option, index) => {
          const pos = answerPositions[index];
          return pos ? (
            <div
              key={index}
              className={`absolute flex items-center justify-center w-16 h-8 rounded-lg ${
                option === correctAnswer ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span className="text-xs text-white">{option}</span>
            </div>
          ) : null;
        })}
      </div>
      <p className="mt-4 text-sm">Tap to flap!</p>
    </div>
  );
}