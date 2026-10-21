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
    id: `dominoes-${Date.now()}-${Math.random()}`,
    instruction: "Toque na peça e escolha a ponta, ou arraste-a!",
    spokenText: "O jogo começou! Escolha a sua melhor peça para ser a primeira no tabuleiro.",
    data: { themeImage }
  };
};

// Baralho Reduzido (Duplo-4) com 15 peças para um jogo rápido e visualmente limpo
const generateDeck = (): DominoPiece[] => {
  const deck: DominoPiece[] = [];
  const uniqueId = Date.now();
  for (let i = 0; i <= 4; i++) {
    for (let j = i; j <= 4; j++) {
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
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [errorPieceId, setErrorPieceId] = useState<string | null>(null);

  useEffect(() => {
    const deck = generateDeck();
    setPlayerHand(deck.slice(0, 5));
    setAiHand(deck.slice(5, 10));
    setBoard([]); // O Jogo agora começa SEMPRE com o tabuleiro vazio!
    setBoneyard(deck.slice(10, 15)); // 5 peças no monte
    
    setTurn('player');
    setGameOver(false);
    setMessage("Sua vez! Jogue a primeira peça.");
    setErrorPieceId(null);
    setSelectedPieceId(null);
  }, [challenge.id]);

  const getBoardEnds = () => {
    if (board.length === 0) return { leftEnd: -1, rightEnd: -1 };
    const leftPiece = board[0];
    const rightPiece = board[board.length - 1];
    return {
      leftEnd: leftPiece.flipped ? leftPiece.right : leftPiece.left,
      rightEnd: rightPiece.flipped ? rightPiece.left : rightPiece.right
    };
  };

  const checkPlayable = (piece: DominoPiece, ends: { leftEnd: number, rightEnd: number }) => {
    if (board.length === 0) return true; // Se o tabuleiro estiver vazio, qualquer peça serve!
    return piece.left === ends.leftEnd || piece.right === ends.leftEnd || 
           piece.left === ends.rightEnd || piece.right === ends.rightEnd;
  };

  const playPieceOnSide = (piece: DominoPiece, side: 'left' | 'right', isPlayer: boolean) => {
    let newBoard = [...board];
    let played = false;

    // Lógica para a primeira peça do jogo
    if (board.length === 0) {
      newBoard = [{ ...piece, flipped: false }];
      played = true;
    } else {
      const { leftEnd, rightEnd } = getBoardEnds();
      if (side === 'left') {
        if (piece.right === leftEnd) { newBoard.unshift({ ...piece, flipped: false }); played = true; }
        else if (piece.left === leftEnd) { newBoard.unshift({ ...piece, flipped: true }); played = true; }
      } else {
        if (piece.left === rightEnd) { newBoard.push({ ...piece, flipped: false }); played = true; }
        else if (piece.right === rightEnd) { newBoard.push({ ...piece, flipped: true }); played = true; }
      }
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
      setMessage("O Sistema está a jogar...");
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
    if (board.length === 0) {
      return playPieceOnSide(piece, 'right', isPlayer);
    }
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
    setSelectedPieceId(null);
    setTimeout(() => onAnswer(playerWon, playerWon ? 60 : 0), 2000);
  };

  const handlePieceClick = (piece: DominoPiece) => {
    if (turn !== 'player' || gameOver) return;
    setSelectedPieceId(selectedPieceId === piece.id ? null : piece.id);
  };

  const handleZoneClick = (side: 'left' | 'right') => {
    if (turn !== 'player' || gameOver || !selectedPieceId) return;
    const piece = playerHand.find(p => p.id === selectedPieceId);
    if (!piece) return;

    const success = playPieceOnSide(piece, side, true);
    if (success) {
      setSelectedPieceId(null);
    } else {
      setErrorPieceId(piece.id);
      setTimeout(() => setErrorPieceId(null), 500);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (turn !== 'player' || gameOver) { e.preventDefault(); return; }
    setSelectedPieceId(id);
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
    if (success) {
      setSelectedPieceId(null);
    } else {
      setErrorPieceId(piece.id);
      setTimeout(() => setErrorPieceId(null), 500);
    }
  };

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
    setSelectedPieceId(null);
  };

  useEffect(() => {
    if (turn === 'ai' && !gameOver) {
      const timer = setTimeout(() => {
        const ends = getBoardEnds();
        const playablePiece = aiHand.find(p => checkPlayable(p, ends));
        
        if (playablePiece) {
          autoPlayPiece(playablePiece, false);
        } else {
          if (boneyard.length > 0) {
            setMessage("Sistema a comprar peça...");
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
              setMessage("Sua vez!");
            }
          }
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, aiHand, playerHand, board, gameOver, boneyard]);

  const playerHasMoves = () => {
    const ends = getBoardEnds();
    return playerHand.some(p => checkPlayable(p, ends));
  };

  // Renderização do Tabuleiro
  const renderItems: any[] = [];
  if (board.length === 0) {
    // Zona Especial Central para a Primeira Peça
    if (turn === 'player') renderItems.push({ type: 'drop', side: 'left', id: 'drop-first', isFirst: true });
  } else {
    if (turn === 'player') renderItems.push({ type: 'drop', side: 'left', id: 'drop-left' });
    board.forEach(p => renderItems.push({ type: 'piece', ...p }));
    if (turn === 'player') renderItems.push({ type: 'drop', side: 'right', id: 'drop-right' });
  }

  const chunks: any[] = [];
  let i = 0;
  let rowIndex = 0;
  const ITEMS_PER_ROW = 4; 

  while (i < renderItems.length) {
    if (rowIndex % 2 === 0) {
      chunks.push({ type: 'row', dir: 'ltr', items: renderItems.slice(i, i + ITEMS_PER_ROW) });
      i += ITEMS_PER_ROW;
      if (i < renderItems.length) {
        chunks.push({ type: 'bridge', align: 'end', item: renderItems[i] });
        i += 1;
      }
    } else {
      chunks.push({ type: 'row', dir: 'rtl', items: renderItems.slice(i, i + ITEMS_PER_ROW) });
      i += ITEMS_PER_ROW;
      if (i < renderItems.length) {
        chunks.push({ type: 'bridge', align: 'start', item: renderItems[i] });
        i += 1;
      }
    }
    rowIndex++;
  }

  const renderDots = (value: number, iconUrl: string | null) => {
    const dots = [];
    const positions: Record<number, number[]> = {
      0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8]
    };
    for (let i = 0; i < 9; i++) {
      if (positions[value]?.includes(i)) {
        dots.push(
          <div key={i} className="flex items-center justify-center w-full h-full p-0.5">
            {iconUrl ? (
              <img src={iconUrl} alt="dot" className="w-full h-full object-contain max-w-[14px] max-h-[14px] drop-shadow-md pointer-events-none" />
            ) : (
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full shadow-sm pointer-events-none" />
            )}
          </div>
        );
      } else {
        dots.push(<div key={i} className="pointer-events-none" />);
      }
    }
    return <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 pointer-events-none">{dots}</div>;
  };

  const DropZone = ({ side, isVertical = false, isFirst = false }: { side: 'left' | 'right', isVertical?: boolean, isFirst?: boolean }) => (
    <div
      onClick={() => handleZoneClick(side)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDropOnZone(e, side)}
      className={`shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-center transition-all duration-300
        ${isVertical ? 'w-10 h-20 sm:w-14 sm:h-28' : (isFirst ? 'w-48 h-12 sm:w-64 sm:h-16' : 'w-20 h-10 sm:w-28 sm:h-14')}
        ${selectedPieceId || draggingId ? 'border-2 border-dashed border-[#bef264] bg-[#bef264]/20 text-[#bef264] shadow-[0_0_20px_#bef264] cursor-pointer hover:bg-[#bef264]/40 scale-105 z-10' : 'border border-dashed border-white/30 bg-black/40 text-white/50'}`}
    >
      {selectedPieceId ? 'TOCAR AQUI' : (isFirst ? 'JOGAR PRIMEIRA PEÇA AQUI' : 'SOLTAR')}
    </div>
  );

  const PieceRender = ({ p, isVertical = false, isBoard = false, isError = false, isSelected = false, reverseRender = false }: any) => {
    const val1 = p.flipped ? p.right : p.left;
    const val2 = p.flipped ? p.left : p.right;
    
    const renderVal1 = reverseRender ? val2 : val1;
    const renderVal2 = reverseRender ? val1 : val2;

    return (
      <div className={`flex backdrop-blur-md shrink-0 transition-all duration-200
        ${isVertical ? 'flex-col w-10 h-20 sm:w-14 sm:h-28' : 'flex-row w-20 h-10 sm:w-28 sm:h-14'}
        ${isBoard ? 'border border-white/30 bg-white/10' : 'rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/20 bg-black/70'}
        ${isError ? 'bg-red-500/40 border-2 border-red-400 z-10' : 
          isSelected ? 'bg-[#bef264]/30 border-2 border-[#bef264] shadow-[0_0_15px_#bef264] scale-110 -translate-y-2 z-10' : ''}
      `}>
        <div className={`w-full h-full flex items-center justify-center ${isVertical ? 'border-b' : 'border-r'} ${isError ? 'border-red-400/50' : 'border-white/20'}`}>
          {renderDots(renderVal1, challenge.data.themeImage)}
        </div>
        <div className="w-full h-full flex items-center justify-center">
          {renderDots(renderVal2, challenge.data.themeImage)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none max-w-5xl mx-auto">
      
      <div className="flex justify-between w-full items-center px-4">
        <div className="flex gap-4">
          <div className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Sistema: <span className="text-red-400 text-sm">{aiHand.length}</span>
          </div>
          <div className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            Monte: <span className="text-blue-300 text-sm">{boneyard.length}</span>
          </div>
        </div>
        <div className={`font-black text-xs sm:text-sm px-4 py-1.5 rounded-full ${turn === 'player' ? 'bg-[#bef264] text-black shadow-[0_0_15px_#bef264]' : 'bg-white/20 text-white animate-pulse'}`}>
          {message}
        </div>
      </div>

      <div className="w-full max-h-80 sm:max-h-96 overflow-y-auto bg-black/40 border border-white/20 rounded-2xl p-4 shadow-inner flex justify-center items-center hide-scrollbar min-h-[12rem]">
        <div className="flex flex-col w-max">
          {chunks.map((chunk, cIdx) => {
            if (chunk.type === 'row') {
              return (
                <div key={`row-${cIdx}`} className={`flex ${chunk.dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'} items-center`}>
                  {chunk.items.map((item: any) => {
                    if (item.type === 'drop') return <DropZone key={item.id} side={item.side} isFirst={item.isFirst} />;
                    return <PieceRender key={item.id} p={item} isVertical={false} isBoard={true} reverseRender={chunk.dir === 'rtl'} isError={errorPieceId === item.id} />;
                  })}
                </div>
              );
            } else {
              return (
                <div key={`bridge-${cIdx}`} className={`flex w-full ${chunk.align === 'end' ? 'justify-end' : 'justify-start'}`}>
                  {chunk.item.type === 'drop' ? (
                    <DropZone key={chunk.item.id} side={chunk.item.side} isVertical={true} />
                  ) : (
                    <PieceRender key={chunk.item.id} p={chunk.item} isVertical={true} isBoard={true} isError={errorPieceId === chunk.item.id} />
                  )}
                </div>
              );
            }
          })}
        </div>
      </div>

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

      <div className="w-full bg-black/40 border border-white/20 rounded-2xl p-4 flex flex-col gap-2 min-h-[8rem]">
        <div className="text-center text-[#bef264] text-xs font-bold uppercase mb-2">
          Suas Peças {turn === 'player' && "(Toque na peça para jogar)"}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
          {playerHand.map(p => {
            const isError = errorPieceId === p.id;
            const isSelected = selectedPieceId === p.id;
            return (
              <div 
                key={p.id} 
                onClick={() => handlePieceClick(p)}
                draggable={turn === 'player' && !gameOver}
                onDragStart={(e) => handleDragStart(e, p.id)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-300 ${turn === 'player' ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'} ${draggingId === p.id ? 'opacity-30 scale-90' : ''}`}
              >
                <PieceRender p={p} isHorizontal={false} isError={isError} isSelected={isSelected} />
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
