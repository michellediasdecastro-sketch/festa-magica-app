import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateLogic6Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 5 ? context.gameImages : ["🍎", "🚗", "🐶", "⭐", "🎈"];
  
  let attempts = 0;
  let target = "";
  let gridItems: string[] = [];
  const numPairs = Math.min(4, Math.max(2, Math.floor(difficulty / 2 + 1))); // 2 a 4 pares (Total de 5 a 9 itens)

  do {
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    target = shuffled[0]; // O Intruso
    
    gridItems = [target]; // O único sem par
    
    // Adiciona pares perfeitos
    for (let i = 1; i <= numPairs; i++) {
      gridItems.push(shuffled[i], shuffled[i]);
    }
    
    gridItems = gridItems.sort(() => Math.random() - 0.5);
    attempts++;
  } while (history.some(h => h.includes(target)) && attempts < 20);

  return {
    id: `logic6-${Date.now()}-${target}`,
    instruction: "Qual é o único sem par?",
    spokenText: "Estão todos aos pares, mas um deles está sozinho! Descubra qual é.",
    data: { gridItems, target }
  };
};

const Logic6Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { gridItems, target } = challenge.data;
  const gridClass = gridItems.length <= 5 ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4";

  return (
    <div className={`grid ${gridClass} gap-3 w-full max-w-md mx-auto`}>
      {gridItems.map((item: string, idx: number) => {
        const isItemImage = item.startsWith('http');
        return (
          <button
            key={idx}
            onClick={() => onAnswer(item === target, 20)}
            className="aspect-square bg-black/50 border border-white/20 rounded-2xl hover:border-[#bef264] transition-all flex items-center justify-center p-3 shadow-md active:scale-95"
          >
            {isItemImage ? (
               <img src={item} alt="item" className="w-full h-full object-contain pointer-events-none drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : <span className="text-4xl pointer-events-none">{item}</span>}
          </button>
        );
      })}
    </div>
  );
};

export const Logic6GameModule: GameModule = {
  id: "logic-odd-6",
  title: "Missões de Lógica",
  categoryId: "missoes-6",
  supportedAges: ["6-7"],
  generateChallenge: generateLogic6Challenge,
  component: Logic6Component
};
