'use client'
import { useState, useEffect } from "react";
import Game2 from "../components/Game2";
import Games from "../components/Games";

export default function Page() {
    // State to hold the selected game
    const [selectedGame, setSelectedGame] = useState(null);

    useEffect(() => {
        // Randomly decide whether to show Game2 or Games
        const gameChoice = Math.random() < 0.5 ? "Game2" : "Games";
        setSelectedGame(gameChoice);
    }, []); // Empty dependency array ensures this runs once when the component mounts

    return (
        <>
            {selectedGame === "Game2" ? <Game2 /> : <Games />}
        </>
    );
}
