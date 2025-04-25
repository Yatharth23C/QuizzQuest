'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CatchTheAnswerGame() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [basketPos, setBasketPos] = useState(50);
  const [fallingOptions, setFallingOptions] = useState([]);
  const [score, setScore] = useState(0);
  const gameAreaRef = useRef(null);
  const answeredRef = useRef(false);

  // Load question
  useEffect(() => {
    const q = localStorage.getItem('current_Q_text');
    const ops = JSON.parse(localStorage.getItem('current_Q_ops')) || [];
    if (!q || !ops.length) {
      router.push('/viewquestions');
      return;
    }
    setQuestion(q);
    setOptions(ops);
    setCorrectAnswer(ops[0]);
  }, []);

  // Spawn falling options
  useEffect(() => {
    if (!options.length || answeredRef.current) return;

    const spawnOption = () => {
      const option = options[Math.floor(Math.random() * options.length)];
      setFallingOptions(prev => [...prev, {
        option,
        x: Math.random() * 80 + 10, // 10-90% width
        y: 0,
        id: Date.now() + Math.random(),
        correct: option === correctAnswer
      }]);
    };

    const interval = setInterval(spawnOption, 1500);
    return () => clearInterval(interval);
  }, [options]);

  // Move falling options
  useEffect(() => {
    if (answeredRef.current) return;

    const moveOptions = () => {
      setFallingOptions(prev => 
        prev.map(opt => ({ ...opt, y: opt.y + 2 }))
          .filter(opt => {
            // Check if caught in basket
            if (opt.y > 80 && 
                opt.x > basketPos - 10 && 
                opt.x < basketPos + 10) {
              
              const isCorrect = opt.correct;
              
              // First verify the answer
              fetch('/api/auth/verifyanswer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  questionId: localStorage.getItem('current_Q_id'),
                  selectedAnswer: opt.option 
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
                if (isCorrect) {
                  setScore(s => s + 1);
                } else {
                  setScore(s => s - 1);
                }
                answeredRef.current = true;
                router.push('/viewquestions');
              })
              .catch(error => {
                console.error('Error processing answer:', error);
              });

              return false;
            }
            return opt.y < 100;
          })
      );
    };

    const gameLoop = setInterval(moveOptions, 50);
    return () => clearInterval(gameLoop);
  }, [basketPos]);

  // Handle mouse/touch movement
  useEffect(() => {
    const handleMove = (clientX) => {
      if (!gameAreaRef.current) return;
      const rect = gameAreaRef.current.getBoundingClientRect();
      const pos = ((clientX - rect.left) / rect.width) * 100;
      setBasketPos(Math.max(10, Math.min(90, pos)));
    };

    const mouseMove = (e) => handleMove(e.clientX);
    const touchMove = (e) => handleMove(e.touches[0].clientX);

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('touchmove', touchMove);
    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('touchmove', touchMove);
    };
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center bg-blue-100 p-4">
      <h1 className="text-2xl mb-2">🧺 Catch the Answer!</h1>
      <p className="mb-4 font-bold text-center">{question}</p>
      <p className="mb-2">Score: {score}</p>

      <div 
        ref={gameAreaRef}
        className="relative w-full h-3/4 bg-blue-200 border-2 border-blue-300 rounded-lg overflow-hidden"
      >
        {/* Falling options */}
        {fallingOptions.map(opt => (
          <div
            key={opt.id}
            className={`absolute w-12 h-12 flex items-center justify-center rounded-lg ${
              opt.correct ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              left: `${opt.x}%`,
              top: `${opt.y}%`,
              transition: 'top 0.05s linear'
            }}
          >
            <span className="text-xs text-white">{opt.option}</span>
          </div>
        ))}

        {/* Basket */}
        <div 
          className="absolute bottom-4 w-20 h-8 bg-brown-500"
          style={{
            left: `${basketPos - 10}%`,
            background: 'linear-gradient(to right, #8B4513, #A0522D)',
            clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)'
          }}
        ></div>
      </div>

      <p className="mt-4 text-sm">Move mouse/touch to control basket</p>
    </div>
  );
}