import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generatePuzzleChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const uniqueImages = Array.from(new Set(context.gameImages));
  const fallback = ["🍎", "🚗", "🐶", "⭐", "🎈"];
  const source = uniqueImages.length >= 3 ? uniqueImages : fallback;

  let signature = "";
  let pattern: string[] = [];
  let options: string[] = [];
  let answer = "";

  // Escolhe 2 imagens para formar o padrão A-B-A-B
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  const A = shuffled[0];
  const B = shuffled[1];
  
  pattern = [A, B, A, B, A]; // A sequência exibida
  answer = B; // A resposta que falta

  // Gera opções de resposta
  options = [B];
  while (options.length < 4) {
    const randomOpt = source[Math.floor(Math.random() * source.length)];
    if (!options.includes(randomOpt)) options.push(randomOpt);
  }
  options = options.sort(() => Math.random() - 0.5);
  signature = `puzzle-seq-${A.substring(0,3)}-${B.substring(0,3)}`;

  return {
    id: signature || Date.now().toString(),
    instruction: "Qual é o próximo da sequência?",
    spokenText: "Observe a sequência com atenção. Qual deve ser o próximo?",
    data: { pattern, options, answer }
  };
};

const PuzzleComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { pattern, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      {/* Sequência */}
      <div className="flex justify-center items-center gap-2 sm:gap-4 bg-black/40 p-4 sm:p-6 rounded-3xl border border-white/20 shadow-inner w-full">
        {pattern.map((item: string, idx: number) => (
          <div key={`pat-${idx}`} className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            {item.startsWith('http') ? (
              <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : <span className="text-4xl">{item}</span>}
          </div>
        ))}
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white/10 rounded-xl border-2 border-dashed border-[#bef264] animate-pulse">
          <span className="text-3xl text-[#bef264]">?</span>
        </div>
      </div>
      
      {/* Opções */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={`opt-${idx}`}
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

export const PuzzleGameModule: GameModule = {
  id: "puzzle-sequence",
  title: "Quebra-Cabeças",
  categoryId: "quebra-cabeca",
  supportedAges: ["4-5", "6-7", "8-9", "10-11"],
  generateChallenge: generatePuzzleChallenge,
  component: PuzzleComponent
};
