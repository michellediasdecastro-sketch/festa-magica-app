import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

interface DominoPiece {
  id: string;
  left: number;
  right: number;
  flipped?: boolean;
}

const generateDominoesChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const themeImage = context.gameImages.length > 0 ? context.gameImages[0] : null;
  return {
    id: `dominoes-${Date.now()}`,
    instruction: "Jogue contra o Sistema! Seja o primeiro a ficar sem peças.",
    spokenText: "O jogo começou! Jogue suas peças combinando os desenhos nas pontas.",
    data: { themeImage }
  };
};

// Gera as 28 peças oficiais de um dominó
const generateDeck = (): DominoPiece[] => {
  const deck: DominoPiece[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      deck.push({ id: `p-${i}-${j}`, left: i, right: j });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const DominoesComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const [playerHand, setPlayerHand] = useState<DominoPiece[]>([]);
  const [aiHand, setAiHand] = useState<DominoPiece[]>([]);
  const [board, setBoard] = useState<DominoPiece[]>([]);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [message, setMessage] = useState("Sua vez!");
  const [gameOver, setGameOver] = useState(false);

  // Inicia o jogo
  useEffect(() => {
    const deck = generateDeck();
    setPlayerHand(deck.slice(0, 7));
    setAiHand(deck.slice(7, 14));
    // Coloca a primeira peça no tabuleiro para começar o jogo mais fácil
    setBoard([{ ...deck[14], flipped: false }]);
    setTurn('player');
    setGameOver(false);
    setMessage("Sua vez!");
  }, [challenge.id]);

  const getBoardEnds = () => {
    if (board.length === 0) return { leftEnd: -1, rightEnd: -1 };
    const leftPiece = board[0];
    const rightPiece = board[board.length - 1];
    return {
      leftEnd: leftPiece.flipped ? leftPiece.right : leftPiece.left,
      rightEnd: rightPiece.flipped ? leftPiece.left : rightPiece.right
    };
  };

  const checkPlayable = (piece: DominoPiece, ends: { leftEnd: number, rightEnd: number }) => {
    return piece.left === ends.leftEnd || piece.right === ends.leftEnd || 
           piece.left === ends.rightEnd || piece.right === ends.rightEnd;
  };

  // Motor principal de jogada
  const playPiece = (piece: DominoPiece, isPlayer: boolean) => {
    const { leftEnd, rightEnd } = getBoardEnds();
    let newBoard = [...board];
    let played = false;

    // Tenta encaixar na direita primeiro
    if (piece.left === rightEnd) {
      newBoard.push({ ...piece, flipped: false }); played = true;
    } else if (piece.right === rightEnd) {
      newBoard.push({ ...piece, flipped: true }); played = true;
    } 
    // Tenta encaixar na esquerda
    else if (piece.right === leftEnd) {
      newBoard.unshift({ ...piece, flipped: false }); played = true;
    } else if (piece.left === leftEnd) {
      newBoard.unshift({ ...piece, flipped: true }); played = true;
    }

    if (!played) return false;

    setBoard(newBoard);
    
    if (isPlayer) {
      const newHand = playerHand.filter(p => p.id !== piece.id);
      setPlayerHand(newHand);
      if (newHand.length === 0) {
        endGame(true, "Você Venceu!");
        return true;
      }
      setTurn('ai');
      setMessage("O Sistema está a pensar...");
    } else {
      const newHand = aiHand.filter(p => p.id !== piece.id);
      setAiHand(newHand);
      if (newHand.length === 0) {
        endGame(false, "O Sistema Venceu!");
        return true;
      }
      setTurn('player');
      setMessage("Sua vez!");
    }
    return true;
  };

  const endGame = (playerWon: boolean, msg: string) => {
    setGameOver(true);
    setMessage(msg);
    setTimeout(() => onAnswer(playerWon, playerWon ? 60 : 0), 2000);
  };

  const handlePlayerMove = (piece: DominoPiece) => {
    if (turn !== 'player' || gameOver) return;
    const { leftEnd, rightEnd } = getBoardEnds();
    if (!checkPlayable(piece, { leftEnd, rightEnd })) return;
    playPiece(piece, true);
  };

  const handlePassTurn = () => {
    if (turn !== 'player' || gameOver) return;
    setTurn('ai');
    setMessage("Você passou a vez. Sistema está jogando...");
  };

  // Lógica da Inteligência Artificial
  useEffect(() => {
    if (turn === 'ai' && !gameOver) {
      const timer = setTimeout(() => {
        const ends = getBoardEnds();
        const playablePiece = aiHand.find(p => checkPlayable(p, ends));
        
        if (playablePiece) {
          playPiece(playablePiece, false);
        } else {
          // IA não tem peça, passa a vez
          const playerCanPlay = playerHand.some(p => checkPlayable(p, ends));
          if (!playerCanPlay) {
            // Jogo trancado para os dois
            endGame(false, "Jogo Bloqueado! Ninguém tem peças válidas.");
          } else {
            setTurn('player');
            setMessage("O sistema passou a vez. É a sua vez!");
          }
        }
      }, 1500); // 1.5 segundos de "pensamento"
      return () => clearTimeout(timer);
    }
  }, [turn, aiHand, playerHand, board, gameOver]);

  // Função para saber se a criança tem jogadas (para mostrar ou não o botão "Passar")
  const playerHasMoves = () => {
    const ends = getBoardEnds();
    return playerHand.some(p => checkPlayable(p, ends));
  };

  // Renderização dos pontos do dominó
  const renderDots = (value: number, iconUrl: string | null) => {
    const dots = [];
    const positions: Record<number, number[]> = {
      0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
    };
    for (let i = 0; i < 9; i++) {
      if (positions[value]?.includes(i)) {
        dots.push(
          <div key={i} className="flex items-center justify-center">
            {iconUrl ? (
              <img src={iconUrl} alt="dot" className="w-3.5 h-3.5 object-contain drop-shadow-md pointer-events-none" />
            ) : (
              <div className="w-3 h-3 bg-white rounded-full shadow-sm pointer-events-none" />
            )}
          </div>
        );
      } else {
        dots.push(<div key={i} className="pointer-events-none" />);
      }
    }
    return <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1 gap-0.5 pointer-events-none">{dots}</div>;
  };

  // Componente de Peça
  const PieceRender = ({ p, isHorizontal = false, isBoard = false }: { p: DominoPiece, isHorizontal?: boolean, isBoard?: boolean }) => {
    const leftVal = p.flipped ? p.right : p.left;
    const rightVal = p.flipped ? p.left : p.right;
    const isDouble = leftVal === rightVal;
    
    // As buchas (duplos) ficam sempre verticais no tabuleiro
    const layoutVertical = isBoard ? isDouble : !isHorizontal;

    return (
      <div className={`flex bg-white/10 backdrop-blur-md rounded-lg border border-white/30 shadow-lg shrink-0 
        ${layoutVertical ? 'flex-col w-12 h-24' : 'flex-row w-24 h-12'}
      `}>
        <div className={`w-12 h-12 flex items-center justify-center ${layoutVertical ? 'border-b' : 'border-r'} border-white/20`}>
          {renderDots(leftVal, challenge.data.themeImage)}
        </div>
        <div className="w-12 h-12 flex items-center justify-center">
          {renderDots(rightVal, challenge.data.themeImage)}
        </div>
      </div>
    );
  };

  const ends = getBoardEnds();

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      
      {/* HUD Superior (Mensagem e Peças do AI) */}
      <div className="flex justify-between w-full items-center px-4">
        <div className="text-white/60 text-xs font-bold uppercase tracking-wider">
          Peças do Sistema: <span className="text-[#bef264] text-sm">{aiHand.length}</span>
        </div>
        <div className={`font-black text-sm px-4 py-1.5 rounded-full ${turn === 'player' ? 'bg-[#bef264] text-black' : 'bg-white/20 text-white animate-pulse'}`}>
          {message}
        </div>
      </div>

      {/* Tabuleiro Real (Scrollável) */}
      <div className="w-full h-40 bg-black/40 border border-white/20 rounded-2xl flex items-center px-4 overflow-x-auto overflow-y-hidden gap-1 hide-scrollbar shadow-inner">
        {board.map(p => (
           <PieceRender key={p.id} p={p} isHorizontal={true} isBoard={true} />
        ))}
      </div>

      {/* Mão do Jogador */}
      <div className="w-full bg-black/40 border border-white/20 rounded-2xl p-4 flex flex-col gap-2">
        <div className="text-center text-white/50 text-xs font-bold uppercase mb-2">Suas Peças</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {playerHand.map(p => {
            const playable = checkPlayable(p, ends) && turn === 'player' && !gameOver;
            return (
              <div 
                key={p.id} 
                onClick={() => playable && handlePlayerMove(p)}
                className={`transition-all duration-300 ${playable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_15px_#bef264] scale-105' : 'opacity-40 cursor-not-allowed scale-95'}`}
              >
                <PieceRender p={p} isHorizontal={false} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão de Passar Vez */}
      {turn === 'player' && !playerHasMoves() && !gameOver && (
        <button onClick={handlePassTurn} className="px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white font-black rounded-xl border border-white/20 shadow-lg animate-bounce">
          NÃO TENHO A PEÇA - PASSAR VEZ
        </button>
      )}

    </div>
  );
};

export const DominoesNovo: GameModule = {
  id: "dominoes-10",
  title: "Dominó Temático",
  categoryId: "raciocinio-10",
  supportedAges: ["10-11"],
  generateChallenge: generateDominoesChallenge,
  component: DominoesComponent
};
