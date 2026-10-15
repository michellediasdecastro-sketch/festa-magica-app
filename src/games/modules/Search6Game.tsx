import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateSearch6Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎", "⭐", "🎈", "🚗"];
  
  let attempts = 0;
  let target = "";
  let gridItems: string[] = [];

  do {
    target = source[Math.floor(Math.random() * source.length)];
    const totalItems = Math.min(20, Math.max(9, Math.floor(difficulty * 2 + 6)));
    
    gridItems = [];
    while (gridItems.length < totalItems - 1) {
      const randomItem = source[Math.floor(Math.random() * source.length)];
      if (randomItem !== target || source.length === 1) {
        gridItems.push(randomItem);
      }
    }
    
    gridItems.push(target);
    gridItems = gridItems.sort(() => Math.random() - 0.5);
    attempts++;
  } while (history.some(h => h.includes(target)) && attempts < 20);

  return {
    id: `search6-${Date.now()}-${target}`,
    instruction: "Encontre quem é o dono desta sombra!",
    spokenText: "Temos uma pista misteriosa. De quem é esta sombra escondida na bagunça?",
    data: { gridItems, target }
  };
};

const Search6Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { gridItems, target } = challenge.data;
  const isTargetImage = target.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="bg-black/60 border-2 border-white/30 rounded-3xl p-4 flex flex-col items-center gap-2 shadow-lg">
        <span className="text-sm font-bold text-white uppercase tracking-wider">A PISTA É:</span>
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl p-2 flex items-center justify-center">
          {isTargetImage ? (
            <img src={target} alt="alvo" className="w-full h-full object-contain pointer-events-none drop-shadow-md" style={{ filter: 'brightness(0)' }} onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          ) : <span className="text-5xl pointer-events-none" style={{ filter: 'brightness(0)' }}>{target}</span>}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 bg-black/40 p-4 sm:p-6 rounded-3xl border border-white/20 shadow-inner w-full">
        {gridItems.map((item: string, idx: number) => {
          const isItemImage = item.startsWith('http');
          return (
            <button
              key={idx}
              onClick={() => onAnswer(item === target, 20)}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-black/50 border border-white/10 hover:border-[#bef264] hover:bg-white/10 transition-all flex items-center justify-center overflow-hidden active:scale-90"
            >
              {isItemImage ? (
                <img src={item} alt="item" className="w-3/4 h-3/4 object-contain pointer-events-none drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              ) : <span className="text-3xl pointer-events-none">{item}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Search6GameModule: GameModule = {
  id: "search-advanced-6",
  title: "Mistérios e Pistas",
  categoryId: "misterios-6",
  supportedAges: ["6-7"],
  generateChallenge: generateSearch6Challenge,
  component: Search6Component
};
