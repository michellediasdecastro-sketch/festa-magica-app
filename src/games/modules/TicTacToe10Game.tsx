import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateTicTacToeChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const roundsPlayed = history.filter(h => h.includes('tictactoe10')).length;
  // Primeiras 10 rodadas = 3x3. Da 11ª em diante = 4x4.
  const size = roundsPlayed >= 10 ? 4 : 3; 
  
  return {
    id: `tictactoe10-${size}x${size}-${Date.now()}`,
    instruction: "Vença o Computador!",
    spokenText: "Jogue o clássico Jogo da Velha contra o sistema. Atenção, o computador é inteligente, mas comete erros!",
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

  const getLines = () => {
    const lines: number[][] = [];
    for (let i = 0; i < size; i++) {
      lines.push(Array.from({length: size}, (_, k) => i * size + k)); 
      lines.push(Array.from({length: size}, (_, k) => k * size + i)); 
    }
    lines.push(Array.from({length: size}, (_, k) => k * size + k));
    lines.push(Array.from({length: size}, (_, k) => k * size + (size - 1 - k)));
    return lines;
  };

  const checkWinner = (squares: string[]) => {
    const lines = getLines();
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
      setTimeout(() => makeAIMove(newBoard), 800);
    }
  };

  const findWinningMove = (currentBoard: string[], player: string) => {
    const lines = getLines();
    for (let line of lines) {
      const values = line.map(idx => currentBoard[idx]);
      const playerCount = values.filter(v => v === player).length;
      const emptyCount = values.filter(v => v === "").length;
      
      // Se falta apenas 1 para ganhar, encontra o índice vazio
      if (playerCount === size - 1 && emptyCount === 1) {
        return line[values.indexOf("")];
      }
    }
    return -1;
  };

  const makeAIMove = (currentBoard: string[]) => {
    const available = currentBoard.map((val, idx) => val === "" ? idx : null).filter(val => val !== null) as number[];
    if (available.length === 0) return;

    let chosenMove = -1;
    
    // IA EQUILIBRADA: 60% de probabilidade de jogar com inteligência máxima
    if (Math.random() < 0.6) {
      chosenMove = findWinningMove(currentBoard, "O"); // 1. Tenta Ganhar
      if (chosenMove === -1) {
        chosenMove = findWinningMove(currentBoard, "X"); // 2. Tenta Bloquear o Jogador
      }
    }

    // Se não encontrou jogada inteligente (ou caiu nos 40% de distração) joga à sorte
    if (chosenMove === -1) {
      chosenMove = available[Math.floor(Math.random() * available.length)];
    }
    
    const newBoard = [...currentBoard];
    newBoard[chosenMove] = "O";
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      finishGame(winner);
    } else {
      setIsPlayerTurn(true);
      setMessage(`Sua vez! Você é o X`);
    }
  };

  const finishGame = (winner: string) => {
    if (winner === "X") {
      setMessage("🎉 Você Venceu!");
      setTimeout(() => onAnswer(true, 50), 1000);
    } else if (winner === "O") {
      setMessage("💻 O Sistema Venceu!");
      setTimeout(() => {
        onAnswer(false, 0); // Ecrã vermelho de erro, a criança tentará noutra rodada
      }, 1500);
    } else {
      setMessage("🤝 Empate! Tente novamente.");
      setTimeout(() => {
        setBoard(Array(size * size).fill(""));
        setIsPlayerTurn(true);
        setMessage(`Sua vez! Você é o X`);
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
