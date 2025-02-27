import { useState, useEffect } from "react";
import axios from "axios";

export default function RockPaperScissors() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [gameState, setGameState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("player1");
  const [choice, setChoice] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForPlayer2, setWaitingForPlayer2] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameState();
  }, []);

  const fetchGameState = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/state");
      if (response.data && response.data.player1) {
        setGameState(response.data);
        setLoading(false);
        
        if (response.data.player2) {
          setGameStarted(true);
          setWaitingForPlayer2(false);
          setCurrentPlayer(response.data.turn);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/start", {
        player1,
      });
      setGameState(response.data.game_state);
      setWaitingForPlayer2(true);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const joinGame = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/join", {
        player2,
      });
      setGameState(response.data.game_state);
      setGameStarted(true);
      setWaitingForPlayer2(false);
      setCurrentPlayer("player1");
      fetchGameState();
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  const playRound = async (selectedChoice) => {
    if (!gameState) return;

    setChoice(selectedChoice);
    try {
      await axios.post("http://localhost:8000/api/play", {
        player: gameState[currentPlayer],
        choice: selectedChoice,
      });

      setTimeout(fetchGameState, 500);
    } catch (error) {
      console.error("Error playing round:", error);
    }
  };

  if (loading) {
    return <p className="text-center text-lg font-semibold">Loading game state...</p>;
  }

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Rock Paper Scissors</h1>

      {!gameStarted ? (
        <div>
          {!waitingForPlayer2 ? (
            <div>
              <input
                type="text"
                placeholder="Enter Player 1 Name"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                className="border p-2 mb-2 w-full"
              />
              <button
                onClick={startGame}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Start Game
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Enter Player 2 Name"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                className="border p-2 mb-2 w-full"
              />
              <button
                onClick={joinGame}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Join Game
              </button>
            </div>
          )}
        </div>
      ) : gameState ? (
        <div>
          <h2 className="text-lg font-semibold">
            {gameState.turn === "player1"
              ? `${gameState.player1}, it's your turn!`
              : `${gameState.player2}, it's your turn!`}
          </h2>
          <div className="flex justify-center gap-4 my-4">
            {["rock", "paper", "scissors"].map((option) => (
              <button
                key={option}
                onClick={() => playRound(option)}
                className="bg-gray-200 p-2 rounded"
                disabled={
                  (currentPlayer === "player1" &&
                    gameState.turn !== "player1") ||
                  (currentPlayer === "player2" &&
                    gameState.turn !== "player2")
                }
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>

          {gameState.rounds.length > 0 && (
            <div className="mt-4">
              <p className="font-bold">
                {gameState.rounds[gameState.rounds.length - 1].winner === "tie"
                  ? "It's a tie!"
                  : `${gameState.rounds[gameState.rounds.length - 1].winner === "player1" ? gameState.player1 : gameState.player2} wins!`}
              </p>
              <p>Scores:</p>
              <ul>
                <li>{gameState.player1}: {gameState.scores.player1}</li>
                <li>{gameState.player2}: {gameState.scores.player2}</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-lg font-semibold">Loading game state...</p>
      )}
    </div>
  );
}