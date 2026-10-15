import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMemory6Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const uniqueImages = Array.from(new Set(context.gameImages));
  const fallback = ["🍎", "🚗", "🐶", "⭐", "🎈", "🚀", "⚽", "🐻", "🐼"];
  const source = uniqueImages.length >= 4 ? uniqueImages : fallback;

  // Mais difícil: começa com 4 pares e sobe até 10!
  const targetPairCount = Math.min(10, Math.max(4, Math.floor(difficulty + 3))); 
  const finalPairCount = Math.min(targetPairCount, source.length); 
  
  const selectedImages = [...source].sort(() => Math.random() - 0.5).slice(0, finalPairCount);
  const deck = [...selectedImages, ...selectedImages]
    .sort(() => Math.random() - 0.5)
    .map((img, idx) => ({ id: idx, content: img }));

  return {
    id: `mem6-${Date.now()}-${Math.random()}`,
    instruction: "Encontre os pares escondidos!",
    spokenText: `Treine a sua memória! Encontre os pares iguais.`,
    data: { deck, pairCount: finalPairCount }
  };
};

const Memory6Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { deck, pairCount } = challenge.data;
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  useEffect(() => { setFlipped([]); setMatched([]); }, [challenge.id]);

  const handleCardClick = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(deck[idx].content)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (deck[newFlipped[0]].content === deck[newFlipped[1]].content) {
        setMatched(prev => {
          const newMatched = [...prev, deck[newFlipped[0]].content];
          if (newMatched.length === pairCount) setTimeout(() => onAnswer(true, pairCount * 15), 600);
          return newMatched;
        });
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className={`grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 w-full max-w-md mx-auto`}>
      {deck.map((card: any, idx: number) => {
        const isRevealed = flipped.includes(idx) || matched.includes(card.content);
        return (
          <button
            key={idx}
            onClick={() => handleCardClick(idx)}
            className={`aspect-square rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform shadow-md flex items-center justify-center overflow-hidden
              ${isRevealed ? 'bg-white/20 border-[#bef264] scale-100 rotate-y-180' : 'bg-black/60 border-white/20 hover:bg-black/40 hover:scale-105'}`}
          >
            {isRevealed ? (
              card.content.startsWith('http') ? <img src={card.content} alt="card" className="w-full h-full object-cover pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} /> : <span className="text-3xl">{card.content}</span>
            ) : <span className="text-2xl text-white/40">❓</span>}
          </button>
        );
      })}
    </div>
  );
};

export const Memory6GameModule: GameModule = {
  id: "memory-advanced-6",
  title: "Memória e Atenção",
  categoryId: "memoria-6",
  supportedAges: ["6-7"],
  generateChallenge: generateMemory6Challenge,
  component: Memory6Component
};
