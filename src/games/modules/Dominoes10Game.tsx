import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateDominoesChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const images = context.gameImages.length >= 2 ? context.gameImages : ["🍎", "⭐", "🎈", "🚗"];
  
  const pieces = Array.from({ length: 5 }).map((_, i) => ({
    id: `piece-${i}`,
    left: images[Math.floor(Math.random() * images.length)],
    right: images[Math.floor(Math.random() * images.length)],
  }));

  return {
    id: `dominoes-${Date.now()}`,
    instruction: "Arraste e conecte as peças no tabuleiro!",
    spokenText: "Arraste as peças para o tabuleiro e conecte as imagens iguais!",
    data: { pieces }
  };
};

const DominoesComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const [hand, setHand] = useState<any[]>([]);
  const [boardPieces, setBoardPieces] = useState<any[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setHand(challenge.data.pieces);
    setBoardPieces([]);
    setDraggingId(null);
  }, [challenge.id]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("pieceId", id);
    setDraggingId(id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("pieceId");
    if (!id) return;

    const boardRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - boardRect.left - 40; 
    const y = e.clientY - boardRect.top - 20;

    const pieceIndex = hand.findIndex(p => p.id === id);
    if (pieceIndex !== -1) {
      const piece = hand[pieceIndex];
      setHand(hand.filter(p => p.id !== id));
      const newBoard = [...boardPieces, { ...piece, x, y }];
      setBoardPieces(newBoard);

      if (hand.length === 1) {
        setTimeout(() => onAnswer(true, 40), 500);
      }
    } else {
      const existingPiece = boardPieces.find(p => p.id === id);
      if (existingPiece) {
        setBoardPieces(boardPieces.map(p => p.id === id ? { ...p, x, y } : p));
      }
    }
    setDraggingId(null);
  };

  const renderHalf = (content: string) => {
    if (content.startsWith('http')) {
      return <img src={content} alt="domino" className="w-8 h-8 object-contain drop-shadow-md pointer-events-none" />;
    }
    return <span className="text-3xl pointer-events-none">{content}</span>;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div 
        className="w-full h-64 sm:h-80 bg-black/30 border-2 border-dashed border-white/40 rounded-2xl relative overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <span className="absolute top-2 left-0 w-full text-center text-white/30 text-sm font-bold uppercase tracking-widest pointer-events-none">
          Tabuleiro
        </span>
        
        {boardPieces.map(p => (
          <div 
            key={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, p.id)}
            style={{ left: p.x, top: p.y, position: 'absolute' }}
            className={`flex bg-white/10 backdrop-blur-md rounded-xl border border-white/30 shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${draggingId === p.id ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="w-12 h-12 flex items-center justify-center border-r border-white/20">{renderHalf(p.left)}</div>
            <div className="w-12 h-12 flex items-center justify-center">{renderHalf(p.right)}</div>
          </div>
        ))}
      </div>

      <div className="w-full min-h-[4rem] p-4 bg-black/40 border border-white/20 rounded-2xl flex flex-wrap gap-3 justify-center items-center">
        {hand.map(p => (
          <div 
            key={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, p.id)}
            className={`flex bg-white/10 backdrop-blur-md rounded-xl border border-white/30 shadow-lg cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform ${draggingId === p.id ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="w-12 h-12 flex items-center justify-center border-r border-white/20">{renderHalf(p.left)}</div>
            <div className="w-12 h-12 flex items-center justify-center">{renderHalf(p.right)}</div>
          </div>
        ))}
        {hand.length === 0 && <span className="text-white/50 text-sm font-bold">Todas as peças colocadas!</span>}
      </div>
    </div>
  );
};

export const Dominoes10GameModule: GameModule = {
  id: "dominoes-10",
  title: "Dominó Temático",
  categoryId: "raciocinio-10",
  supportedAges: ["10-11"],
  generateChallenge: generateDominoesChallenge,
  component: DominoesComponent
};
