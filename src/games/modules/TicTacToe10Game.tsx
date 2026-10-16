import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateTicTacToeChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  // Conta quantas vezes o jogo da velha já foi jogado nesta sessão
  const roundsPlayed = history.filter(h => h.includes('tictactoe10')).length;
  
  // Primeiras 10 rodadas (0 a 9) = 3x3. Da 11ª em diante = 4x4.
  const size = roundsPlayed >= 10 ? 4 : 3; 
  
  return {
    id: `tictactoe10-${size}x${size}-${Date.now()}`,
    instruction: "Vença o Computador!",
    spokenText: "Jogue o clássico Jogo da Velha contra o sistema. Consegue ganhar?",
    data: { size }
  };
};

const TicTacToe10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { size } = challenge.data;
  const [board, setBoard] = useState<string[]>(Array(size * size).fill(""));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [message, setMessage] = useState("Sua vez! Você é o X");

  useEffect(() => {
    setBoard(Array(size * size).fill(""));
    setIsPlayerTurn(true);
    setMessage(`Sua vez! Você é o X (Junte ${size}!)`);
  }, [challenge.id, size]);

  const checkWinner = (squares: string[]) => {
    const lines: number[][] = [];
    
    // Linhas e Colunas
    for (let i = 0; i < size; i++) {
      lines.push(Array.from({length: size}, (_, k) => i * size + k)); // Linha
      lines.push(Array.from({length: size}, (_, k) => k * size + i)); // Coluna
    }
    // Diagonais
    lines.push(Array.from({length: size}, (_, k) => k * size + k));
    lines.push(Array.from({length: size}, (_, k) => k * size + (size - 1 - k)));

    for (let line of lines) {
      const first = squares[line[0]];
      if (first && line.every(idx => squares[idx] === first)) return first;
    }
    if (!squares.includes("")) return "DRAW";
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== "" || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const winner = checkWinner(newBoard);
    if (winner) {
      finishGame(winner);
    } else {
      setMessage("O sistema está a pensar...");
      setTimeout(() => makeAIMove(newBoard), 600);
    }
  };

  const makeAIMove = (currentBoard: string[]) => {
    const available = currentBoard.map((val, idx) => val === "" ? idx : null).filter(val => val !== null) as number[];
    if (available.length === 0) return;

    // AI Simples: Escolhe um espaço aleatório
    const randomMove = available[Math.floor(Math.random() * available.length)];
    
    const newBoard = [...currentBoard];
    newBoard[randomMove] = "O";
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      finishGame(winner);
    } else {
      setIsPlayerTurn(true);
      setMessage(`Sua vez! Você é o X (Junte ${size}!)`);
    }
  };

  const finishGame = (winner: string) => {
    if (winner === "X") {
      setMessage("🎉 Você Venceu!");
      setTimeout(() => onAnswer(true, 50), 1000);
    } else if (winner === "O") {
      setMessage("💻 O Sistema Venceu!");
      setTimeout(() => {
        onAnswer(false, 0);
      }, 1000);
    } else {
      setMessage("🤝 Empate! Tente novamente.");
      setTimeout(() => {
        setBoard(Array(size * size).fill(""));
        setIsPlayerTurn(true);
        setMessage(`Sua vez! Você é o X (Junte ${size}!)`);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="bg-black/60 px-6 py-3 rounded-2xl border border-white/20 shadow-md text-center">
        <div className={`text-lg font-black tracking-widest ${isPlayerTurn ? 'text-[#bef264]' : 'text-red-400'}`}>
          {message}
        </div>
      </div>

      <div 
        className="grid gap-2 bg-black/40 p-4 rounded-3xl border border-white/20 w-full shadow-inner aspect-square"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={!isPlayerTurn || cell !== ""}
            className={`flex items-center justify-center text-5xl sm:text-6xl font-black rounded-2xl transition-all
              ${cell === "" ? 'bg-white/5 hover:bg-white/10 active:scale-95 cursor-pointer' : 'bg-black/50 cursor-default'}
              ${cell === "X" ? 'text-[#bef264] drop-shadow-[0_0_8px_rgba(190,242,100,0.5)]' : ''}
              ${cell === "O" ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : ''}
            `}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

export const TicTacToe10GameModule: GameModule = {
  id: "tictactoe-10",
  title: "Jogo da Velha",
  categoryId: "velha-10",
  supportedAges: ["10-11"],
  generateChallenge: generateTicTacToeChallenge,
  component: TicTacToe10Component
};
