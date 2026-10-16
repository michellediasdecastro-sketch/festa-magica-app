import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const DominoPiece: React.FC<{ left: number, right: number, isHand?: boolean }> = ({ left, right, isHand }) => {
  const renderDots = (num: number) => {
    const dots = Array(9).fill(false);
    if (num === 1) dots[4] = true;
    else if (num === 2) { dots[0] = true; dots[8] = true; }
    else if (num === 3) { dots[0] = true; dots[4] = true; dots[8] = true; }
    else if (num === 4) { dots[0] = true; dots[2] = true; dots[6] = true; dots[8] = true; }
    else if (num === 5) { dots[0] = true; dots[2] = true; dots[4] = true; dots[6] = true; dots[8] = true; }
    else if (num === 6) { dots[0] = true; dots[2] = true; dots[3] = true; dots[5] = true; dots[6] = true; dots[8] = true; }

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 sm:gap-1 w-full h-full p-1">
        {dots.map((active, i) => (
          <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${active ? 'bg-black' : 'bg-transparent'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className={`flex bg-white rounded-lg sm:rounded-xl border-[3px] border-black/80 shadow-md ${isHand ? 'w-16 h-8 sm:w-20 sm:h-10' : 'w-14 h-7 sm:w-16 sm:h-8 shrink-0'}`}>
      <div className="flex-1 border-r-2 border-black/80 flex items-center justify-center">
        {renderDots(left)}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {renderDots(right)}
      </div>
    </div>
  );
};

const generateDominoesChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const a = Math.floor(Math.random() * 6) + 1;
  const b = Math.floor(Math.random() * 6) + 1;
  const c = Math.floor(Math.random() * 6) + 1;
  const d = Math.floor(Math.random() * 6) + 1;
  const e = Math.floor(Math.random() * 6) + 1;
  const f = Math.floor(Math.random() * 6) + 1;

  const fullChain = [
    { id: 1, left: a, right: b },
    { id: 2, left: b, right: c },
    { id: 3, left: c, right: d },
    { id: 4, left: d, right: e },
    { id: 5, left: e, right: f }
  ];

  const boardStart = [fullChain[2]]; 
  
  const handPieces = [fullChain[0], fullChain[1], fullChain[3], fullChain[4]];
  handPieces.forEach(p => {
    if (Math.random() > 0.5) {
      const temp = p.left;
      p.left = p.right;
      p.right = temp;
    }
  });
  handPieces.sort(() => Math.random() - 0.5);

  return {
    id: `dominoes-interactive-${Date.now()}`,
    instruction: "Monte o Caminho!",
    spokenText: "Toque nas suas peças para encaixá-las nas pontas certas do dominó. Pense bem para não bloquear o jogo!",
    data: { boardStart, handPieces }
  };
};

const Dominoes10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { boardStart, handPieces } = challenge.data;
  
  const [board, setBoard] = useState<any[]>(boardStart);
  const [hand, setHand] = useState<any[]>(handPieces);
  const [errorShake, setErrorShake] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    setBoard(boardStart);
    setHand(handPieces);
    setIsBlocked(false);
  }, [challenge.id]);

  const handlePieceClick = (piece: any) => {
    if (isBlocked) return;

    const leftEnd = board[0].left;
    const rightEnd = board[board.length - 1].right;
    
    let newBoard = [...board];
    let matched = false;

    if (piece.right === leftEnd) {
      newBoard.unshift(piece);
      matched = true;
    } else if (piece.left === leftEnd) {
      newBoard.unshift({ ...piece, left: piece.right, right: piece.left });
      matched = true;
    } else if (piece.left === rightEnd) {
      newBoard.push(piece);
      matched = true;
    } else if (piece.right === rightEnd) {
      newBoard.push({ ...piece, left: piece.right, right: piece.left });
      matched = true;
    }

    if (matched) {
      const newHand = hand.filter(p => p.id !== piece.id);
      setBoard(newBoard);
      setHand(newHand);
      
      if (newHand.length === 0) {
        setTimeout(() => onAnswer(true, 50), 600);
      } else {
        // CORREÇÃO: Verifica se as peças que sobraram conseguem jogar
        const newLeftEnd = newBoard[0].left;
        const newRightEnd = newBoard[newBoard.length - 1].right;
        
        const canPlay = newHand.some(p => 
          p.left === newLeftEnd || p.right === newLeftEnd || 
          p.left === newRightEnd || p.right === newRightEnd
        );

        if (!canPlay) {
          setIsBlocked(true);
          setTimeout(() => {
            onAnswer(false, 0); // Ecrã vermelho de erro
            // Devolve as peças e reinicia o tabuleiro
            setTimeout(() => {
              setBoard(boardStart);
              setHand(handPieces);
              setIsBlocked(false);
            }, 1200);
          }, 800);
        }
      }
    } else {
      setErrorShake(piece.id);
      setTimeout(() => setErrorShake(null), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto relative">
      
      <div className="w-full bg-black/40 p-4 sm:p-6 rounded-3xl border border-white/20 shadow-inner flex flex-col items-center min-h-[8rem] justify-center overflow-hidden relative">
        <span className="text-[#bef264] text-xs font-bold uppercase tracking-widest mb-4">Tabuleiro</span>
        <div className="flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto pb-2 px-2 snap-x transition-all">
          {board.map((domino: any) => (
            <div key={domino.id} className="snap-center animate-fade-in">
              <DominoPiece left={domino.left} right={domino.right} />
            </div>
          ))}
        </div>
      </div>

      <div className={`w-full p-4 rounded-3xl border shadow-md transition-all ${isBlocked ? 'bg-red-500/20 border-red-500/50' : 'bg-[#bef264]/10 border-[#bef264]/30'}`}>
        <span className={`block text-center text-sm font-bold uppercase tracking-widest mb-4 ${isBlocked ? 'text-red-400 animate-pulse' : 'text-white/80'}`}>
          {isBlocked ? 'JOGO BLOQUEADO! REINICIANDO...' : 'A Sua Mão'}
        </span>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 min-h-[4rem]">
          {hand.map((piece: any) => (
            <button
              key={piece.id}
              onClick={() => handlePieceClick(piece)}
              disabled={isBlocked}
              className={`transition-all hover:scale-105 active:scale-95 ${errorShake === piece.id ? 'animate-[shake_0.4s_ease-in-out]' : ''} ${isBlocked ? 'opacity-50 grayscale' : ''}`}
            >
              <DominoPiece left={piece.left} right={piece.right} isHand={true} />
            </button>
          ))}
          {hand.length === 0 && !isBlocked && (
             <span className="text-[#bef264] font-black text-xl animate-pulse">Perfeito!</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          50% { transform: translateX(5px) rotate(5deg); }
          75% { transform: translateX(-5px) rotate(-5deg); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>

    </div>
  );
};

export const Dominoes10GameModule: GameModule = {
  id: "dominoes-logic-10",
  title: "Dominó Lógico",
  categoryId: "domino-10",
  supportedAges: ["10-11"],
  generateChallenge: generateDominoesChallenge,
  component: Dominoes10Component
};
