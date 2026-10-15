import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateLogic8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 3 ? context.gameImages : ["🍎", "🚗", "🐶", "⭐", "🎈"];
  const selected = [...source].sort(() => Math.random() - 0.5).slice(0, 3);
  
  const A = selected[0];
  const B = selected[1];
  const C = selected[2];

  // Grelha 3x3 baseada em Sudoku básico (sem repetição na linha ou coluna)
  // [A, B, C]
  // [B, C, A]
  // [C, A, B]
  const fullGrid = [
    A, B, C,
    B, C, A,
    C, A, B
  ];

  const missingIndex = Math.floor(Math.random() * 9);
  const answer = fullGrid[missingIndex];
  fullGrid[missingIndex] = "?"; // Placeholder

  const optionsSet = new Set<string>([answer]);
  while (optionsSet.size < 4) {
    optionsSet.add(source[Math.floor(Math.random() * source.length)]);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `logic8-${Date.now()}-${Math.random()}`,
    instruction: "Complete a matriz lógica!",
    spokenText: "Nenhuma linha ou coluna pode ter imagens repetidas. Quem falta no espaço vazio?",
    data: { grid: fullGrid, missingIndex, options, answer }
  };
};

const Logic8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { grid, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-2 bg-black/40 p-4 rounded-3xl border border-white/20 shadow-inner w-fit mx-auto">
        {grid.map((item: string, idx: number) => {
          const isMissing = item === "?";
          const isImage = item.startsWith('http') && !isMissing;
          return (
            <div key={idx} className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl ${isMissing ? 'bg-white/10 border-2 border-dashed border-[#bef264] animate-pulse' : 'bg-black/60 border border-white/10'}`}>
              {isMissing ? (
                <span className="text-3xl text-[#bef264] font-black">?</span>
              ) : isImage ? (
                <img src={item} alt="item" className="w-3/4 h-3/4 object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              ) : (
                <span className="text-4xl">{item}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-3 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 35)}
            className="aspect-square bg-black/60 border border-white/30 rounded-2xl hover:border-[#bef264] flex items-center justify-center p-3 shadow-md active:scale-95 transition-all"
          >
            {opt.startsWith('http') ? (
              <img src={opt} alt="opt" className="w-full h-full object-contain pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : (
              <span className="text-4xl pointer-events-none">{opt}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Logic8GameModule: GameModule = {
  id: "logic-matrix-8",
  title: "Sequências e Lógica Avançada",
  categoryId: "logica-8",
  supportedAges: ["8-9"],
  generateChallenge: generateLogic8Challenge,
  component: Logic8Component
};
