import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMathChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const maxItems = Math.min(10, Math.max(3, Math.floor(difficulty + 2)));
  
  let attempts = 0;
  let signature = "";
  let count = 1;
  let itemToCount = "";
  let options: number[] = [];

  const uniqueImages = Array.from(new Set(context.gameImages));
  const source = uniqueImages.length > 0 ? uniqueImages : ["🍎", "⭐", "🎈"];

  do {
    count = Math.floor(Math.random() * (maxItems - 1)) + 1; 
    itemToCount = source[Math.floor(Math.random() * source.length)];
    
    let optionsSet = new Set<number>();
    optionsSet.add(count);
    
    let loopSafety = 0;
    while(optionsSet.size < 4 && loopSafety < 50) {
      let wrong = count + Math.floor(Math.random() * 8) - 3; 
      if (wrong > 0 && wrong !== count) optionsSet.add(wrong);
      loopSafety++;
    }
    
    let safeFallback = 1;
    while(optionsSet.size < 4) {
      if (!optionsSet.has(safeFallback)) optionsSet.add(safeFallback);
      safeFallback++;
    }
    
    options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
    signature = `math-count-${count}-${itemToCount.substring(0,3)}`;
    attempts++;
  } while (history.includes(signature) && attempts < 10);

  return {
    id: signature || Date.now().toString(),
    instruction: "Quantos tem na tela?",
    spokenText: "Conte com cuidado. Quantos itens você vê na tela?",
    data: { count, itemToCount, options }
  };
};

const MathComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { count, itemToCount, options } = challenge.data;
  const isImage = itemToCount.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      <div className="flex flex-wrap justify-center gap-4 bg-black/40 p-6 rounded-3xl border border-white/20 min-h-[160px] items-center shadow-inner">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="w-14 h-14 sm:w-20 sm:h-20 animate-fade-in flex items-center justify-center">
            {isImage ? <img src={itemToCount} alt="item" className="w-full h-full object-contain drop-shadow-xl pointer-events-none" /> : <span className="text-5xl drop-shadow-xl pointer-events-none">{itemToCount}</span>}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {options.map((opt: number, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === count, 10)}
            className="py-6 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-4xl sm:text-5xl font-black shadow-xl active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const MathGameModule: GameModule = {
  id: "math-counting",
  title: "Contagem Divertida",
  categoryId: "matematica",
  supportedAges: ["4-5", "6-7", "8-9", "10-11"], // TODAS AS IDADES PERMITIDAS
  generateChallenge: generateMathChallenge,
  component: MathComponent
};
