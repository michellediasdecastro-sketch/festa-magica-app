import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMemoryChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const pairCount = Math.min(8, Math.max(2, Math.floor(difficulty + 1))); 
  
  let attempts = 0;
  let signature = "";
  let deck: any[] = [];
  
  do {
    const selectedImages = [...context.gameImages].sort(() => Math.random() - 0.5).slice(0, pairCount);
    deck = [...selectedImages, ...selectedImages]
      .sort(() => Math.random() - 0.5)
      .map((img, idx) => ({ id: idx, content: img }));
      
    signature = `mem-${pairCount}-${deck.map(d => d.content.substring(0,3)).join('')}`;
    attempts++;
  } while (history.includes(signature) && attempts < 10);

  return {
    id: signature,
    instruction: "Encontre os pares escondidos!",
    spokenText: `Ajude o ${context.characterName} a encontrar os pares iguais!`,
    data: { deck, pairCount }
  };
};

const MemoryComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { deck, pairCount } = challenge.data;
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  useEffect(() => {
    setFlipped([]);
    setMatched([]);
  }, [challenge.id]);

  const handleCardClick = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(deck[idx].content)) return;

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = deck[newFlipped[0]].content;
      const card2 = deck[newFlipped[1]].content;

      if (card1 === card2) {
        setMatched(prev => [...prev, card1]);
        setFlipped([]);
        if (matched.length + 1 === pairCount) {
          onAnswer(true, pairCount * 10);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const gridClass = deck.length <= 4 ? "grid-cols-2" : deck.length <= 8 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-5";

  return (
    <div className={`grid ${gridClass} gap-3 w-full max-w-md mx-auto`}>
      {deck.map((card: any, idx: number) => {
        const isRevealed = flipped.includes(idx) || matched.includes(card.content);
        const isImage = card.content.startsWith('http');
        
        return (
          <button
            key={idx}
            onClick={() => handleCardClick(idx)}
            className={`aspect-square rounded-2xl border-2 transition-all duration-300 transform shadow-xl flex items-center justify-center overflow-hidden
              ${isRevealed ? 'bg-white/20 border-[#bef264] scale-100 rotate-y-180' : 'bg-black/60 border-white/20 hover:bg-black/40 hover:scale-105'}`}
          >
            {isRevealed ? (
              isImage ? <img src={card.content} alt="card" className="w-full h-full object-cover" /> : <span className="text-4xl">{card.content}</span>
            ) : (
              <span className="text-3xl text-white/40">❓</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const MemoryGameModule: GameModule = {
  id: "memory-core",
  title: "Jogo da Memória",
  categoryId: "memoria",
  supportedAges: ["4-5", "6-7", "8-9", "10-11"],
  generateChallenge: generateMemoryChallenge,
  component: MemoryComponent
};
