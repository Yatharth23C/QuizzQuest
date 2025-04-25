'use client'

import { useEffect, useState } from 'react'
import Game1 from "../components/Games";
import Game2 from "../components/Game2";
import Game3 from "../components/Game3";
import Game4 from "../components/Game4";

export default function Page() {
  const [randomNumber, setRandomNumber] = useState(null);

  useEffect(() => {
    const rand = Math.floor(Math.random() * 4); // 0 to 2
    setRandomNumber(rand);
  }, []);

  const renderGame = () => {
    if (randomNumber === 1) return <Game1 />;
    if (randomNumber === 0) return <Game2 />;
    if (randomNumber === 2) return <Game3 />;
    if (randomNumber === 3) return <Game4 />;
    return null;
  };

  return (
    <div>
      {randomNumber !== null ? renderGame() : <p>Loading...</p>}
    </div>
  );
}
