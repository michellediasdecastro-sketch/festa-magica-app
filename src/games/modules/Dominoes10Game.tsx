import React, { useState, useEffect, useRef } from "react";
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
    id: `dominoes-${Date.now()}-${Math.random()}`,
    instruction: "Arraste as peças para as pontas ou compre no monte!",
    spokenText: "Arraste suas peças para o tabuleiro. Se não tiver a peça certa, clique em Comprar Peça.",
    data: { themeImage }
  };
};

const generateDeck = (): DominoPiece[] => {
  const deck: DominoPiece[] = [];
  const uniqueId = Date.now();
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      deck.push({ id: `p-${i}-${j}-${uniqueId}`, left: i, right: j });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const DominoesComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const [playerHand, setPlayerHand] = useState<DominoPiece[]>([]);
  const [aiHand, setAiHand] = useState<DominoPiece[]>([]);
  const [boneyard, setBoneyard] = useState<DominoPiece[]>([]);
  const [board, setBoard] = useState<DominoPiece[]>([]);
  
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [message, setMessage] = useState("Sua vez!");
  const [gameOver, setGameOver] = useState(false);
  
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [errorPieceId, setErrorPieceId] = useState<string | null>(null);
  const [boardScale, setBoardScale] = useState(1);
  
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const boardContentRef = useRef<HTMLDivElement>(null);

  // Inicializa o jogo
  useEffect(() => {
    const deck = generateDeck();
    setPlayerHand(deck.slice(0, 7));
    setAiHand(deck.slice(7, 14));
    setBoard([{ ...deck[14], flipped: false }]); // Peça inicial
    setBoneyard(deck.slice(15, 28)); // 13 peças no monte
    
    setTurn('player');
    setGameOver(false);
    setMessage("Sua vez! Arraste uma peça para o tabuleiro.");
    setErrorPieceId(null);
  }, [challenge.id]);

  // Ajusta o zoom do tabuleiro automaticamente para não precisar de scroll
  useEffect(() => {
    if (boardContainerRef.current && boardContentRef.current) {
      const containerWidth = boardContainerRef.current.clientWidth - 100; // Margem para as dropzones
      const contentWidth = boardContentRef.current.scrollWidth;
      if (contentWidth > containerWidth && contentWidth > 0) {
        setBoardScale(containerWidth / contentWidth);
      } else {
        setBoardScale(1);
      }
    }
  }, [board]);

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

  const playPieceOnSide = (piece: DominoPiece, side: 'left' | 'right', isPlayer: boolean) => {
    const { leftEnd, rightEnd } = getBoardEnds();
    let newBoard = [...board];
    let played = false;

    if (side === 'left') {
      if (piece.right === leftEnd) { newBoard.unshift({ ...piece, flipped: false }); played = true; }
      else if (piece.left === leftEnd) { newBoard.unshift({ ...piece, flipped: true }); played = true; }
    } else {
      if (piece.left === rightEnd) { newBoard.push({ ...piece, flipped: false }); played = true; }
      else if (piece.right === rightEnd) { newBoard.push({ ...piece, flipped: true }); played = true; }
    }

    if (!played) return false;

    setBoard(newBoard);
    
    if (isPlayer) {
      const newHand = playerHand.filter(p => p.id !== piece.id);
      setPlayerHand(newHand);
      if (newHand.length === 0) {
        endGame(true, "Você Bateu! Parabéns!");
        return true;
      }
      setTurn('ai');
      setMessage("O Sistema está a pensar...");
    } else {
      const newHand = aiHand.filter(p => p.id !== piece.id);
      setAiHand(newHand);
      if (newHand.length === 0) {
        endGame(false, "O Sistema Bateu!");
        return true;
      }
      setTurn('player');
      setMessage("Sua vez!");
    }
    return true;
  };

  const autoPlayPiece = (piece: DominoPiece, isPlayer: boolean) => {
    const { leftEnd, rightEnd } = getBoardEnds();
    if (piece.left === rightEnd || piece.right === rightEnd) {
      return playPieceOnSide(piece, 'right', isPlayer);
    }
    if (piece.left === leftEnd || piece.right === leftEnd) {
      return playPieceOnSide(piece, 'left', isPlayer);
    }
    return false;
  };

  const endGame = (playerWon: boolean, msg: string) => {
    setGameOver(true);
    setMessage(msg);
    setTimeout(() => onAnswer(playerWon, playerWon ? 60 : 0), 2000);
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (turn !== 'player' || gameOver) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("pieceId", id);
    setDraggingId(id);
  };

  const handleDragEnd = () => setDraggingId(null);

  const handleDropOnZone = (e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    setDraggingId(null);
    if (turn !== 'player' || gameOver) return;

    const id = e.dataTransfer.getData("pieceId");
    const piece = playerHand.find(p => p.id === id);
    if (!piece) return;

    const success = playPieceOnSide(piece, side, true);
    if (!success) {
      setErrorPieceId(piece.id);
      setTimeout(() => setErrorPieceId(null), 500);
    }
  };

  // Comprar Peça (Monte)
  const handleDrawPiece = () => {
    if (turn !== 'player' || gameOver || boneyard.length === 0) return;
    const newBoneyard = [...boneyard];
    const drawn = newBoneyard.pop()!;
    setBoneyard(newBoneyard);
    setPlayerHand([...playerHand, drawn]);
  };

  const handlePassTurn = () => {
    if (turn !== 'player' || gameOver || boneyard.length > 0) return;
    setTurn('ai');
    setMessage("Você passou a vez. Sistema a jogar...");
  };

  // Lógica do AI
  useEffect(() => {
    if (turn === 'ai' && !gameOver) {
      const timer = setTimeout(() => {
        const ends = getBoardEnds();
        const playablePiece = aiHand.find(p => checkPlayable(p, ends));
        
        if (playablePiece) {
          autoPlayPiece(playablePiece, false);
        } else {
          if (boneyard.length > 0) {
            setMessage("Sistema comprando peça...");
            const newBoneyard = [...boneyard];
            const drawn = newBoneyard.pop()!;
            setBoneyard(newBoneyard);
            setAiHand([...aiHand, drawn]);
          } else {
            const playerCanPlay = playerHand.some(p => checkPlayable(p, ends));
            if (!playerCanPlay && boneyard.length === 0) {
              endGame(false, "Jogo Fechado! Ninguém tem peças.");
            } else {
              setTurn('player');
              setMessage("O sistema passou a vez. É a sua vez!");
            }
          }
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, aiHand, playerHand, board, gameOver, boneyard]);

  const playerHasMoves = () => {
    const ends = getBoardEnds();
    return playerHand.some(p => checkPlayable(p, ends));
  };

  // Renderização 100% contida para evitar overflow
  const renderDots = (value: number, iconUrl: string | null) => {
    const dots = [];
    const positions: Record<number, number[]> = {
      0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
    };
    for (let i = 0; i < 9; i++) {
      if (positions[value]?.includes(i)) {
        dots.push(
          <div key={i} className="flex items-center justify-center w-full h-full p-0.5">
            {iconUrl ? (
              <img src={iconUrl} alt="dot" className="w-full h-full object-contain max-w-[12px] max-h-[12px] drop-shadow-md pointer-events-none" />
            ) : (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full shadow-sm pointer-events-none" />
            )}
          </div>
        );
      } else {
        dots.push(<div key={i} className="pointer-events-none" />);
      }
    }
    return <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 pointer-events-none">{dots}</div>;
  };

  const PieceRender = ({ p, isHorizontal = false, isBoard = false, isError = false }: { p: DominoPiece, isHorizontal?: boolean, isBoard?: boolean, isError?: boolean }) => {
    const leftVal = p.flipped ? p.right : p.left;
    const rightVal = p.flipped ? p.left : p.right;
    const isDouble = leftVal === rightVal;
    
    // As buchas ficam sempre perpendiculares (em pé no tabuleiro horizontal)
    const layoutVertical = isBoard ? isDouble : !isHorizontal;

    return (
      <div className={`flex backdrop-blur-md rounded-md shadow-md shrink-0 transition-all duration-200
        ${layoutVertical ? 'flex-col w-10 h-20 md:w-12 md:h-24' : 'flex-row w-20 h-10 md:w-24 md:h-12'}
        ${isError ? 'bg-red-500/40 border-2 border-red-400' : 'bg-white/10 border border-white/30'}
      `}>
        <div className={`w-full h-full flex items-center justify-center ${layoutVertical ? 'border-b' : 'border-r'} ${isError ? 'border-red-400/50' : 'border-white/20'}`}>
          {renderDots(leftVal, challenge.data.themeImage)}
        </div>
        <div className="w-full h-full flex items-center justify-center">
          {renderDots(rightVal, challenge.data.themeImage)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none max-w-4xl mx-auto">
      
      {/* HUD Info */}
      <div className="flex justify-between w-full items-center px-4">
        <div className="flex flex-col gap-1">
          <div className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Sistema: <span className="text-red-400 text-sm">{aiHand.length}</span> peças
          </div>
          <div className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Monte: <span className="text-blue-300 text-sm">{boneyard.length}</span> peças
          </div>
        </div>
        <div className={`font-black text-xs sm:text-sm px-4 py-1.5 rounded-full ${turn === 'player' ? 'bg-[#bef264] text-black shadow-[0_0_15px_#bef264]' : 'bg-white/20 text-white animate-pulse'}`}>
          {message}
        </div>
      </div>

      {/* Tabuleiro Dinâmico Auto-Escalável */}
      <div ref={boardContainerRef} className="w-full h-40 sm:h-48 bg-black/40 border border-white/20 rounded-2xl flex justify-between items-center px-2 sm:px-4 overflow-hidden shadow-inner relative">
        
        {turn === 'player' && (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropOnZone(e, 'left')}
            className={`absolute left-2 z-10 w-16 h-20 sm:w-20 sm:h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] sm:text-xs font-bold text-center transition-all backdrop-blur-sm
              ${draggingId ? 'border-[#bef264] bg-black/60 text-[#bef264] shadow-[0_0_20px_#bef264]' : 'border-white/20 text-white/40 bg-black/20'}`}
          >
            SOLTAR<br/>AQUI
          </div>
        )}

        <div className="flex-1 flex justify-center items-center h-full w-full pointer-events-none">
          <div 
            ref={boardContentRef}
            className="flex items-center gap-0.5 transition-transform duration-300 ease-in-out" 
            style={{ transform: `scale(${boardScale})`, transformOrigin: 'center center' }}
          >
            {board.map(p => (
               <PieceRender key={p.id} p={p} isHorizontal={true} isBoard={true} />
            ))}
          </div>
        </div>

        {turn === 'player' && (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropOnZone(e, 'right')}
            className={`absolute right-2 z-10 w-16 h-20 sm:w-20 sm:h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] sm:text-xs font-bold text-center transition-all backdrop-blur-sm
              ${draggingId ? 'border-[#bef264] bg-black/60 text-[#bef264] shadow-[0_0_20px_#bef264]' : 'border-white/20 text-white/40 bg-black/20'}`}
          >
            SOLTAR<br/>AQUI
          </div>
        )}

      </div>

      {/* Ações do Jogador (Comprar / Passar) */}
      <div className="h-10 flex items-center justify-center w-full">
        {turn === 'player' && !gameOver && (
          boneyard.length > 0 ? (
             <button onClick={handleDrawPiece} className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl border border-white/20 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
               COMPRAR PEÇA NO MONTE
             </button>
          ) : (
             !playerHasMoves() && (
               <button onClick={handlePassTurn} className="px-6 py-2 bg-red-500/80 hover:bg-red-500 text-white font-black rounded-xl border border-white/20 shadow-lg animate-bounce">
                 PASSAR A VEZ (MONTE VAZIO)
               </button>
             )
          )
        )}
      </div>

      {/* Mão do Jogador */}
      <div className="w-full bg-black/40 border border-white/20 rounded-2xl p-4 flex flex-col gap-2 min-h-[8rem]">
        <div className="text-center text-white/50 text-[10px] sm:text-xs font-bold uppercase mb-2">Suas Peças</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {playerHand.map(p => {
            const isError = errorPieceId === p.id;
            return (
              <div 
                key={p.id} 
                draggable={turn === 'player' && !gameOver}
                onDragStart={(e) => handleDragStart(e, p.id)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-300 ${turn === 'player' ? 'cursor-grab active:cursor-grabbing hover:-translate-y-2 hover:shadow-[0_0_15px_#bef264]' : 'opacity-80 cursor-not-allowed'} ${draggingId === p.id ? 'opacity-30 scale-90' : ''}`}
              >
                <PieceRender p={p} isHorizontal={false} isError={isError} />
              </div>
            );
          })}
        </div>
      </div>

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
