import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateDominoesChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  // Usa a primeira imagem do tema como o "ponto" do dominó. Se não houver, usa um círculo branco.
  const themeImage = context.gameImages.length > 0 ? context.gameImages[0] : null;
  
  // Gera 6 peças de dominó com números de 0 a 6
  const pieces = Array.from({ length: 6 }).map((_, i) => ({
    id: `piece-${i}`,
    left: Math.floor(Math.random() * 7),
    right: Math.floor(Math.random() * 7),
    isVertical: false
  }));

  return {
    id: `dominoes-${Date.now()}`,
    instruction: "Arraste as peças, conecte-as e CLIQUE para girar!",
    spokenText: "Arraste as peças para o tabuleiro. Você pode clicar em uma peça no tabuleiro para girá-la!",
    data: { pieces, themeImage }
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
    const pieceIndex = hand.findIndex(p => p.id === id);
    
    if (pieceIndex !== -1) {
      // Movendo da mão para o tabuleiro
      const piece = hand[pieceIndex];
      // Calcula o centro aproximado da peça (horizontal por padrão)
      const x = e.clientX - boardRect.left - 48; 
      const y = e.clientY - boardRect.top - 24;

      setHand(hand.filter(p => p.id !== id));
      setBoardPieces([...boardPieces, { ...piece, x, y }]);

      if (hand.length === 1) {
        setTimeout(() => onAnswer(true, 50), 1000);
      }
    } else {
      // Movimentando uma peça que já está no tabuleiro
      const existingPiece = boardPieces.find(p => p.id === id);
      if (existingPiece) {
        const x = e.clientX - boardRect.left - (existingPiece.isVertical ? 24 : 48); 
        const y = e.clientY - boardRect.top - (existingPiece.isVertical ? 48 : 24);
        setBoardPieces(boardPieces.map(p => p.id === id ? { ...p, x, y } : p));
      }
    }
    setDraggingId(null);
  };

  // Função para girar a peça com um clique
  const handleRotate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBoardPieces(boardPieces.map(p => p.id === id ? { ...p, isVertical: !p.isVertical } : p));
  };

  // Renderiza os pontos do dominó usando um Grid 3x3
  const renderDots = (value: number, iconUrl: string | null) => {
    const dots = [];
    // Posições dos pontos num grid 3x3 (índices 0 a 8)
    const positions: Record<number, number[]> = {
      0: [],
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
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

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1.5 gap-0.5 pointer-events-none">
        {dots}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Tabuleiro Livre */}
      <div 
        className="w-full h-72 sm:h-96 bg-black/30 border-2 border-dashed border-white/40 rounded-2xl relative overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <span className="absolute top-2 left-0 w-full text-center text-white/30 text-sm font-bold uppercase tracking-widest pointer-events-none">
          Tabuleiro (Clique na peça para girar)
        </span>
        
        {boardPieces.map(p => (
          <div 
            key={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, p.id)}
            onClick={(e) => handleRotate(e, p.id)}
            style={{ left: p.x, top: p.y, position: 'absolute' }}
            className={`flex bg-white/10 backdrop-blur-md rounded-xl border border-white/30 shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform 
              ${draggingId === p.id ? 'opacity-50' : 'opacity-100'} 
              ${p.isVertical ? 'flex-col w-14 h-28' : 'flex-row w-28 h-14'}`}
          >
            <div className={`w-14 h-14 flex items-center justify-center ${p.isVertical ? 'border-b' : 'border-r'} border-white/20`}>
              {renderDots(p.left, challenge.data.themeImage)}
            </div>
            <div className="w-14 h-14 flex items-center justify-center">
              {renderDots(p.right, challenge.data.themeImage)}
            </div>
          </div>
        ))}
      </div>

      {/* Mão do Jogador */}
      <div className="w-full min-h-[5rem] p-4 bg-black/40 border border-white/20 rounded-2xl flex flex-wrap gap-3 justify-center items-center">
        {hand.map(p => (
          <div 
            key={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, p.id)}
            className={`flex flex-row w-28 h-14 bg-white/10 backdrop-blur-md rounded-xl border border-white/30 shadow-lg cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform ${draggingId === p.id ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="w-14 h-14 flex items-center justify-center border-r border-white/20">
              {renderDots(p.left, challenge.data.themeImage)}
            </div>
            <div className="w-14 h-14 flex items-center justify-center">
              {renderDots(p.right, challenge.data.themeImage)}
            </div>
          </div>
        ))}
        {hand.length === 0 && <span className="text-[#bef264] text-sm font-black">Todas as peças colocadas!</span>}
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
