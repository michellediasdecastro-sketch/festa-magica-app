import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateSearch8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎", "🚗"];
  
  let attempts = 0;
  let target = "";
  let gridItems: any[] = [];
  let intruderIndex = 0;

  do {
    target = source[Math.floor(Math.random() * source.length)];
    const totalItems = 35; // Grelha gigante (7x5)
    
    intruderIndex = Math.floor(Math.random() * totalItems);
    gridItems = Array.from({ length: totalItems }).map((_, idx) => {
      if (idx === intruderIndex) {
        // O intruso é o mesmo dinossauro, mas invertido ou rodado!
        const transforms = ["scale-x-[-1]", "scale-y-[-1]", "rotate-180", "rotate-90", "-rotate-90"];
        return { content: target, css: transforms[Math.floor(Math.random() * transforms.length)] };
      }
      return { content: target, css: "" }; // Os normais
    });

    attempts++;
  } while (history.some(h => h.includes(target)) && attempts < 20);

  return {
    id: `investigate8-${Date.now()}-${target}`,
    instruction: "Encontre a anomalia!",
    spokenText: "Há um impostor disfarçado. Encontre o único item que está virado para o lado errado.",
    data: { gridItems, intruderIndex, target }
  };
};

const Search8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { gridItems, intruderIndex, target } = challenge.data;
  const isImage = target.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 sm:gap-3 bg-black/40 p-4 sm:p-6 rounded-[2rem] border border-white/20 shadow-inner w-full">
        {gridItems.map((item: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(idx === intruderIndex, 30)}
            className="aspect-square rounded-xl bg-black/50 border border-transparent hover:border-[#bef264] transition-all flex items-center justify-center p-1 sm:p-2 shadow-sm active:scale-90"
          >
            {isImage ? (
              <img src={item.content} alt="item" className={`w-full h-full object-contain pointer-events-none drop-shadow-md ${item.css}`} onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : <span className={`text-3xl sm:text-4xl pointer-events-none ${item.css}`}>{item.content}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Search8GameModule: GameModule = {
  id: "search-anomaly-8",
  title: "Investigação e Dedução",
  categoryId: "investigacao-8",
  supportedAges: ["8-9"],
  generateChallenge: generateSearch8Challenge,
  component: Search8Component
};
