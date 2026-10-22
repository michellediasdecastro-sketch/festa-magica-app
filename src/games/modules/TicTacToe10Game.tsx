import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateTicTacToeChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const images = context.gameImages.length >= 2 ? context.gameImages : ["❌", "⭕"];
  const size = history.length < 2 ? 3 : 4;
  
  return {
    id: `tictactoe-${Date.now()}`,
    instruction: size === 3 ? "Feche 3 na linha!" : "Desafio: Feche 4 na linha!",
    spokenText: "Sua vez! Tente alinhar suas figuras.",
    data: { size, playerIcon: images[0], aiIcon: images[1] }
  };
};

const checkWin = (board: (string | null)[], size: number, player: string) => {
  for (let i = 0; i < size; i++) {
    let rowWin = true, colWin = true;
    for (let j = 0; j < size; j++) {
      if (board[i * size + j] !== player) rowWin = false;
      if (board[j * size + i] !== player) colWin = false;
    }
    if (rowWin || colWin) return true;
  }
  let diag1Win = true, diag2Win = true;
  for (let i = 0; i < size; i++) {
    if (board[i * size + i] !== player) diag1Win = false;
    if (board[i * size + (size - 1 - i)] !== player) diag2Win = false;
  }
  return diag1Win || diag2Win;
};

const getBestMove = (board: (string | null)[], size: number, ai: string, player: string) => {
  const emptyIndices = board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  if (emptyIndices.length === 0) return -1;

  for (let i of emptyIndices) {
    const tempBoard = [...board];
    tempBoard[i] = ai;
    if (checkWin(tempBoard, size, ai)) return i;
  }

  // 60% de chance de bloquear o jogador (equilibra a dificuldade)
  if (Math.random() < 0.6) {
    for (let i of emptyIndices) {
      const tempBoard = [...board];
      tempBoard[i] = player;
      if (checkWin(tempBoard, size, player)) return i;
    }
  }

  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
};

const TicTacToeComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { size, playerIcon, aiIcon } = challenge.data;
  const [board, setBoard] = useState<(string | null)[]>(Array(size * size).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Sua vez!");

  useEffect(() => {
    setBoard(Array(size * size).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setMessage("Sua vez!");
  }, [challenge.id, size]);

  const endGame = (playerWon: boolean, isDraw: boolean) => {
    setGameOver(true);
    if (playerWon) setMessage("Você Venceu!");
    else if (isDraw) setMessage("Empate!");
    else setMessage("O Sistema Venceu!");
    
    setTimeout(() => onAnswer(true, playerWon ? (size === 4 ? 60 : 40) : 0), 2000);
  };

  const handlePlayerMove = (index: number) => {
    if (board[index] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = playerIcon;
    setBoard(newBoard);
    setIsPlayerTurn(false);

    // Permite que o React renderize a peça antes de processar a vitória
    setTimeout(() => {
      if (checkWin(newBoard, size, playerIcon)) {
        endGame(true, false);
        return;
      }
      if (!newBoard.includes(null)) {
        endGame(false, true);
        return;
      }
      
      setMessage("O sistema está pensando...");
      setTimeout(() => {
        const aiMove = getBestMove(newBoard, size, aiIcon, playerIcon);
        if (aiMove !== -1) {
          newBoard[aiMove] = aiIcon;
          setBoard([...newBoard]);
          setTimeout(() => {
            if (checkWin(newBoard, size, aiIcon)) {
              endGame(false, false);
              return;
            }
            if (!newBoard.includes(null)) {
              endGame(false, true);
              return;
            }
            setIsPlayerTurn(true);
            setMessage("Sua vez!");
          }, 100);
        }
      }, 700);
    }, 50);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto select-none">
      <div className="flex justify-center w-full items-center px-4">
        <div className={`font-black text-sm px-6 py-2 rounded-full transition-all duration-300 ${isPlayerTurn && !gameOver ? 'bg-[#bef264] text-black shadow-[0_0_15px_#bef264]' : 'bg-white/20 text-white animate-pulse'}`}>
          {message}
        </div>
      </div>
      <div className={`grid gap-2 w-full aspect-square bg-black/40 p-3 rounded-2xl border border-white/20 shadow-inner`} 
           style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handlePlayerMove(index)}
            disabled={cell !== null || !isPlayerTurn || gameOver}
            className={`flex items-center justify-center bg-white/10 rounded-xl transition-all border border-white/10 shadow-lg
              ${cell === null && isPlayerTurn && !gameOver ? 'cursor-pointer active:scale-95 hover:bg-white/20 hover:shadow-[0_0_15px_#bef264]' : 'cursor-default'}`}
          >
            {cell && (cell.startsWith('http') ? <img src={cell} className="w-3/4 h-3/4 object-contain pointer-events-none" alt="icon" /> : <span className="text-4xl pointer-events-none">{cell}</span>)}
          </button>
        ))}
      </div>
    </div>
  );
};

export const TicTacToeNovo: GameModule = {
  id: "tictactoe-10",
  title: "Jogo da Velha",
  categoryId: "raciocinio-10",
  supportedAges: ["10-11"],
  generateChallenge: generateTicTacToeChallenge,
  component: TicTacToeComponent
};
