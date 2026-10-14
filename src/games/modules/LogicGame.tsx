import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateLogicChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  let attempts = 0;
  let signature = "";
  let options: string[] = [];
  let correct = "";
  
  const uniqueImages = Array.from(new Set(context.gameImages));
  const fallback = ["🍎", "🚗", "🐶", "⭐", "🎈"];
  const source = uniqueImages.length >= 2 ? uniqueImages : fallback;

  do {
    const selected = [...source].sort(() => Math.random() - 0.5).slice(0, 2);
    const majority = selected[0];
    const oddOne = selected[1];
    correct = oddOne;
    
    const count = Math.min(6, Math.max(3, Math.floor(difficulty + 2))); 
    options = Array(count - 1).fill(majority);
    options.push(oddOne);
    options = options.sort(() => Math.random() - 0.5);
    
    signature = `log-odd-${count}-${majority.substring(0,3)}-${oddOne.substring(0,3)}`;
    attempts++;
  } while (history.includes(signature) && attempts < 10);

  return {
    id: signature || Date.now().toString(),
    instruction: "Encontre o intruso!",
    spokenText: "Um destes é diferente. Toque no intruso!",
    data: { options, correct }
  };
};

const LogicComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { options, correct } = challenge.data;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md mx-auto">
      {options.map((opt: string, idx: number) => {
        const isImage = opt.startsWith('http');
        return (
          <button
            key={idx}
            onClick={() => onAnswer(opt === correct, 10)}
            className="aspect-square rounded-3xl bg-black/50 border border-white/20 hover:border-[#bef264] transition-all shadow-xl flex items-center justify-center overflow-hidden p-4"
          >
            {isImage ? <img src={opt} alt="item" className="w-full h-full object-contain drop-shadow-md pointer-events-none" /> : <span className="text-6xl drop-shadow-md pointer-events-none">{opt}</span>}
          </button>
        );
      })}
    </div>
  );
};

export const LogicGameModule: GameModule = {
  id: "logic-odd-one",
  title: "O Intruso",
  categoryId: "logica",
  supportedAges: ["4-5", "6-7", "8-9", "10-11"], // TODAS AS IDADES PERMITIDAS
  generateChallenge: generateLogicChallenge,
  component: LogicComponent
};
