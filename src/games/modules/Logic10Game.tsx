import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateLogic10Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 2 ? context.gameImages : ["🍎", "⭐"];
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  
  const itemA = shuffled[0];
  const itemB = shuffled[1];

  // Valor do item A e B
  const valA = Math.floor(Math.random() * 8) + 2; // 2 a 9
  const valB = Math.floor(Math.random() * 8) + 2;
  
  // Equações visuais
  const eq1Result = valA + valA; // A + A
  const eq2Result = valA + valB; // A + B
  
  const answer = valB; // A pergunta será: Quanto vale o B?

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    const wrong = answer + (Math.floor(Math.random() * 7) - 3);
    if (wrong > 0 && wrong !== answer) optionsSet.add(wrong);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `logic10-${Date.now()}-${Math.random()}`,
    instruction: "Deduza o valor secreto!",
    spokenText: "Olhe para as duas primeiras contas para descobrir o valor de cada figura.",
    data: { itemA, itemB, eq1Result, eq2Result, options, answer }
  };
};

const Logic10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { itemA, itemB, eq1Result, eq2Result, options, answer } = challenge.data;
  
  const renderItem = (item: string) => (
    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white/10 rounded-xl p-1 shadow-inner">
      {item.startsWith('http') ? (
        <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-md pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
      ) : <span className="text-3xl pointer-events-none">{item}</span>}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      
      <div className="flex flex-col gap-4 bg-black/40 p-4 sm:p-6 rounded-3xl border border-white/20 w-full shadow-inner">
        {/* Equação 1: A + A = X */}
        <div className="flex items-center justify-between px-2 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            {renderItem(itemA)} <span className="text-2xl font-bold text-white/50">+</span> {renderItem(itemA)}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-2xl font-bold text-white/50">=</span>
             <span className="text-3xl font-black text-white">{eq1Result}</span>
          </div>
        </div>
        
        <div className="w-full h-px bg-white/10 my-1"></div>

        {/* Equação 2: A + B = Y */}
        <div className="flex items-center justify-between px-2 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            {renderItem(itemA)} <span className="text-2xl font-bold text-white/50">+</span> {renderItem(itemB)}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-2xl font-bold text-white/50">=</span>
             <span className="text-3xl font-black text-white">{eq2Result}</span>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 my-1"></div>

        {/* Pergunta Final: B = ? */}
        <div className="flex items-center justify-between px-2 sm:px-6 py-2 bg-[#bef264]/10 rounded-2xl border border-[#bef264]/30">
          <div className="flex items-center gap-2 sm:gap-4">
            {renderItem(itemB)}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-2xl font-bold text-[#bef264]">=</span>
             <span className="text-4xl font-black text-[#bef264] animate-pulse">?</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {options.map((opt: number, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 45)}
            className="py-4 sm:py-5 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-3xl sm:text-4xl font-black shadow-xl active:scale-95 text-white"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Logic10GameModule: GameModule = {
  id: "logic-algebra-10",
  title: "Lógica e Dedução",
  categoryId: "deducao-10",
  supportedAges: ["10-11"],
  generateChallenge: generateLogic10Challenge,
  component: Logic10Component
};
