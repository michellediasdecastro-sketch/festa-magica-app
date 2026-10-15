import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateAttentionChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const uniqueImages = Array.from(new Set(context.gameImages));
  const fallback = ["🍎", "🚗", "🐶", "⭐", "🎈"];
  const source = uniqueImages.length > 0 ? uniqueImages : fallback;

  // Quantos itens aparecem na tela
  const count = Math.min(12, Math.max(6, Math.floor(difficulty * 2 + 4)));
  const item = source[Math.floor(Math.random() * source.length)];
  const invertedIndex = Math.floor(Math.random() * count);

  return {
    id: `attn-${Date.now()}-${Math.random()}`,
    instruction: "Quem está de cabeça para baixo?",
    spokenText: "Atenção! Um deles está de cabeça para baixo. Consegue achar?",
    data: { count, item, invertedIndex }
  };
};

const AttentionComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { count, item, invertedIndex } = challenge.data;
  const isImage = item.startsWith('http');

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-md mx-auto">
      {Array.from({ length: count }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onAnswer(idx === invertedIndex, 15)}
          className="aspect-square bg-black/50 border border-white/20 rounded-2xl hover:border-[#bef264] transition-all flex items-center justify-center p-2 shadow-md active:scale-90"
        >
          {isImage ? (
             <img 
               src={item} 
               alt="item" 
               className={`w-full h-full object-contain pointer-events-none drop-shadow-md transition-transform ${idx === invertedIndex ? 'rotate-180' : ''}`} 
               onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
             />
          ) : (
             <span className={`text-5xl pointer-events-none transition-transform ${idx === invertedIndex ? 'rotate-180' : ''}`}>{item}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export const AttentionGameModule: GameModule = {
  id: "attention-inverted",
  title: "Atenção e Observação",
  categoryId: "atencao",
  supportedAges: ["4-5", "6-7", "8-9", "10-11"],
  generateChallenge: generateAttentionChallenge,
  component: AttentionComponent
};
