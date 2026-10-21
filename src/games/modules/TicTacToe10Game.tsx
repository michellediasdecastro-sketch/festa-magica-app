import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateTicTacToeChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const images = context.gameImages.length >= 2 ? context.gameImages : ["❌", "⭕"];
  const playerIcon = images[0];
  const aiIcon = images[1];
  
  // Primeiros 5 jogos são 3x3. Depois muda para 4x4.
  const size = history.length < 5 ? 3 : 4;
  
  return {
    id: `tictactoe-${Date.now()}`,
    instruction: size === 3 ? "Ganhe o jogo fechando 3 na linha!" : "Desafio Difícil: Feche 4 na linha para ganhar!",
    spokenText: "Sua vez! Tente alinhar suas figuras antes do sistema.",
    data: { size, playerIcon, aiIcon }
  };
};

const checkWin = (board: (string | null)[], size: number, player: string) => {
  // Linhas e Colunas
  for (let i = 0; i < size; i++) {
    let rowWin = true;
    let colWin = true;
    for (let j = 0; j < size; j++) {
      if (board[i * size + j] !== player) rowWin = false;
      if (board[j * size + i] !== player) colWin = false;
    }
    if (rowWin || colWin) return true;
  }
  // Diagonais
  let diag1Win = true;
  let diag2Win = true;
  for (let i = 0; i < size; i++) {
    if (board[i * size + i] !== player) diag1Win = false;
    if (board[i * size + (size - 1 - i)] !== player) diag2Win = false;
  }
  return diag1Win || diag2Win;
};

// IA Heurística: 1. Tenta Vencer -> 2. Tenta Bloquear -> 3. Joga Aleatório
const getBestMove = (board: (string | null)[], size: number, ai: string, player: string) => {
  const emptyIndices = board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  if (emptyIndices.length === 0) return -1;

  // 1. Tenta Vencer
  for (let i of emptyIndices) {
    const tempBoard = [...board];
    tempBoard[i] = ai;
    if (checkWin(tempBoard, size, ai)) return i;
  }

  // 2. Tenta Bloquear
  for (let i of emptyIndices) {
    const tempBoard = [...board];
    tempBoard[i] = player;
    if (checkWin(tempBoard, size, player)) return i;
  }

  // 3. Prioriza o centro se estiver vazio (apenas para 3x3)
  if (size === 3 && board[4] === null) return 4;

  // 4. Joga Aleatório
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
};

const TicTacToeComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { size, playerIcon, aiIcon } = challenge.data;
  const [board, setBoard] = useState<(string | null)[]>(Array(size * size).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setBoard(Array(size * size).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
  }, [challenge.id, size]);

  const renderIcon = (content: string | null) => {
    if (!content) return null;
    if (content.startsWith('http')) return <img src={content} alt="icon" className="w-3/4 h-3/4 object-contain drop-shadow-md" />;
    return <span className={size === 4 ? "text-3xl" : "text-5xl"}>{content}</span>;
  };

  const handlePlayerMove = (index: number) => {
    if (board[index] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = playerIcon;
    setBoard(newBoard);
    setIsPlayerTurn(false);

    if (checkWin(newBoard, size, playerIcon)) {
      setGameOver(true);
      setTimeout(() => onAnswer(true, size === 4 ? 60 : 40), 1000);
      return;
    }

    if (!newBoard.includes(null)) {
      setGameOver(true);
      setTimeout(() => onAnswer(false, 0), 1000); // Empate/Derrota reinicia
      return;
    }

    // Turno da IA
    setTimeout(() => {
      const aiMove = getBestMove(newBoard, size, aiIcon, playerIcon);
      if (aiMove !== -1) {
        newBoard[aiMove] = aiIcon;
        setBoard([...newBoard]);
        
        if (checkWin(newBoard, size, aiIcon)) {
          setGameOver(true);
          setTimeout(() => onAnswer(false, 0), 1000); // IA Venceu
          return;
        }
        if (!newBoard.includes(null)) {
          setGameOver(true);
          setTimeout(() => onAnswer(false, 0), 1000); // Empate
          return;
        }
      }
      setIsPlayerTurn(true);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className={`grid gap-2 w-full aspect-square bg-black/40 p-3 rounded-2xl border border-white/20`} 
           style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handlePlayerMove(index)}
            disabled={cell !== null || !isPlayerTurn || gameOver}
            className={`flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors border border-white/10 shadow-inner 
              ${cell === null && isPlayerTurn && !gameOver ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
          >
            {renderIcon(cell)}
          </button>
        ))}
      </div>
      <div className="text-center font-bold text-[#bef264] h-6">
        {!isPlayerTurn && !gameOver && "O sistema está pensando..."}
        {gameOver && "Fim de Jogo!"}
      </div>
    </div>
  );
};

export const TicTacToeGameModule: GameModule = {
  id: "tictactoe-10",
  title: "Jogo da Velha",
  categoryId: "raciocinio-10",
  supportedAges: ["10-11"],
  generateChallenge: generateTicTacToeChallenge,
  component: TicTacToeComponent
};
