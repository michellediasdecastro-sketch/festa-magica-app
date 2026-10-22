import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateTicTacToeChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const images = context.gameImages.length >= 2 ? context.gameImages : ["❌", "⭕"];
  const playerIcon = images[0];
  const aiIcon = images[1];
  
  // history.length = 0 (1º jogo) -> size 3
  // history.length = 1 (2º jogo) -> size 3
  // history.length >= 2 (3º jogo em diante) -> size 4
  const size = history.length < 2 ? 3 : 4;
  
  return {
    id: `tictactoe-${Date.now()}-${Math.random()}`,
    instruction: size === 3 ? "Ganhe o jogo fechando 3 na linha!" : "Desafio Difícil: Feche 4 na linha para ganhar!",
    spokenText: "Sua vez! Tente alinhar suas figuras antes do sistema.",
    data: { size, playerIcon, aiIcon }
  };
};

const checkWin = (board: (string | null)[], size: number, player: string) => {
  // Verifica Linhas e Colunas
  for (let i = 0; i < size; i++) {
    let rowWin = true;
    let colWin = true;
    for (let j = 0; j < size; j++) {
      if (board[i * size + j] !== player) rowWin = false;
      if (board[j * size + i] !== player) colWin = false;
    }
    if (rowWin || colWin) return true;
  }
  // Verifica Diagonais
  let diag1Win = true;
  let diag2Win = true;
  for (let i = 0; i < size; i++) {
    if (board[i * size + i] !== player) diag1Win = false;
    if (board[i * size + (size - 1 - i)] !== player) diag2Win = false;
  }
  return diag1Win || diag2Win;
};

const getBestMove = (board: (string | null)[], size: number, ai: string, player: string) => {
  const emptyIndices = board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  if (emptyIndices.length === 0) return -1;

  // 1. O Sistema tenta ganhar imediatamente
  for (let i of emptyIndices) {
    const tempBoard = [...board];
    tempBoard[i] = ai;
    if (checkWin(tempBoard, size, ai)) return i;
  }

  // 2. O Sistema bloqueia a vitória iminente do jogador
  for (let i of emptyIndices) {
    const tempBoard = [...board];
    tempBoard[i] = player;
    if (checkWin(tempBoard, size, player)) return i;
  }

  // 3. Se for 3x3 e o centro estiver livre, domina o centro
  if (size === 3 && board[4] === null) return 4;

  // 4. Se for 4x4, tenta pegar os centros (índices 5, 6, 9, 10)
  if (size === 4) {
    const centers = [5, 6, 9, 10].filter(idx => board[idx] === null);
    if (centers.length > 0) return centers[Math.floor(Math.random() * centers.length)];
  }

  // 5. Jogada aleatória
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

  const renderIcon = (content: string | null) => {
    if (!content) return null;
    if (content.startsWith('http')) return <img src={content} alt="icon" className="w-3/4 h-3/4 object-contain drop-shadow-md pointer-events-none" />;
    return <span className={`${size === 4 ? "text-4xl" : "text-6xl"} pointer-events-none`}>{content}</span>;
  };

  // Função centralizada para terminar o jogo e avançar de tela sem travar
  const endGame = (playerWon: boolean, isDraw: boolean) => {
    setGameOver(true);
    if (playerWon) setMessage("Você Venceu!");
    else if (isDraw) setMessage("Empate!");
    else setMessage("O Sistema Venceu!");
    
    // O primeiro parâmetro (true) garante que o jogo avança sempre. 
    // O segundo parâmetro é a pontuação (0 se perder/empatar).
    setTimeout(() => onAnswer(true, playerWon ? (size === 4 ? 60 : 40) : 0), 2000);
  };

  const handlePlayerMove = (index: number) => {
    if (board[index] || !isPlayerTurn || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = playerIcon;
    setBoard(newBoard);
    setIsPlayerTurn(false);
    setMessage("O sistema está a pensar...");

    // Verifica se o jogador ganhou nesta jogada
    if (checkWin(newBoard, size, playerIcon)) {
      endGame(true, false);
      return;
    }

    // Verifica se empatou (sem espaços livres)
    if (!newBoard.includes(null)) {
      endGame(false, true);
      return;
    }

    // Turno da Inteligência Artificial
    setTimeout(() => {
      const aiMove = getBestMove(newBoard, size, aiIcon, playerIcon);
      if (aiMove !== -1) {
        newBoard[aiMove] = aiIcon;
        setBoard([...newBoard]);
        
        // Verifica se o Sistema ganhou nesta jogada
        if (checkWin(newBoard, size, aiIcon)) {
          endGame(false, false);
          return;
        }
        // Verifica empate após a jogada do Sistema
        if (!newBoard.includes(null)) {
          endGame(false, true);
          return;
        }
      }
      setIsPlayerTurn(true);
      setMessage("Sua vez!");
    }, 800); // 0.8 segundos de atraso para simular pensamento
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto select-none">
      
      {/* HUD de Mensagens */}
      <div className="flex justify-center w-full items-center px-4">
        <div className={`font-black text-sm px-6 py-2 rounded-full transition-all duration-300 ${isPlayerTurn && !gameOver ? 'bg-[#bef264] text-black shadow-[0_0_15px_#bef264]' : 'bg-white/20 text-white animate-pulse'}`}>
          {message}
        </div>
      </div>
      
      {/* Tabuleiro Dinâmico (Muda entre 3x3 e 4x4 automaticamente) */}
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
            {renderIcon(cell)}
          </button>
        ))}
      </div>
      
    </div>
  );
};

// Usa a mesma variável de exportação configurada no GameRegistry para não quebrar a compilação
export const TicTacToeNovo: GameModule = {
  id: "tictactoe-10",
  title: "Jogo da Velha",
  categoryId: "raciocinio-10",
  supportedAges: ["10-11"],
  generateChallenge: generateTicTacToeChallenge,
  component: TicTacToeComponent
};
