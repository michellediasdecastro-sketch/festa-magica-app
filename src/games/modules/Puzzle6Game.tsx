import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generatePuzzle6Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const uniqueImages = Array.from(new Set(context.gameImages));
  const fallback = ["🍎", "🚗", "🐶", "⭐", "🎈", "🚀"];
  const source = uniqueImages.length >= 3 ? uniqueImages : fallback;

  const shuffled = [...source].sort(() => Math.random() - 0.5);
  const A = shuffled[0];
  const B = shuffled[1];
  const C = shuffled[2];
  
  // Para 6-7 anos, o padrão é mais complexo: A-B-C-A-B-C
  const pattern = [A, B, C, A, B]; 
  const answer = C;

  const optionsSet = new Set<string>([answer]);
  while (optionsSet.size < 4) {
    optionsSet.add(source[Math.floor(Math.random() * source.length)]);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `puz6-${Date.now()}-${Math.random()}`,
    instruction: "Qual imagem completa a sequência?",
    spokenText: "Observe o padrão com atenção. Quem é o próximo?",
    data: { pattern, options, answer }
  };
};

const Puzzle6Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { pattern, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      <div className="flex justify-center items-center gap-1 sm:gap-3 bg-black/40 p-4 sm:p-6 rounded-3xl border border-white/20 shadow-inner w-full flex-wrap">
        {pattern.map((item: string, idx: number) => (
          <div key={idx} className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center">
            {item.startsWith('http') ? (
              <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : <span className="text-3xl sm:text-4xl">{item}</span>}
          </div>
        ))}
        <div className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center bg-white/10 rounded-xl border-2 border-dashed border-[#bef264] animate-pulse">
          <span className="text-2xl sm:text-3xl text-[#bef264]">?</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 15)}
            className="aspect-square rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all flex items-center justify-center p-4 shadow-xl active:scale-95"
          >
            {opt.startsWith('http') ? (
              <img src={opt} alt="opcao" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : <span className="text-5xl">{opt}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Puzzle6GameModule: GameModule = {
  id: "puzzle-sequence-6",
  title: "Sequências e Padrões",
  categoryId: "sequencias-6",
  supportedAges: ["6-7"],
  generateChallenge: generatePuzzle6Challenge,
  component: Puzzle6Component
};
