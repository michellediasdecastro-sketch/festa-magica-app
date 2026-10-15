import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateScene6Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎"];
  
  let attempts = 0;
  let target = "";
  
  do {
    target = source[Math.floor(Math.random() * source.length)];
    attempts++;
  } while (history.some(h => h.includes(target)) && attempts < 20);

  // 1 Certa, 3 Erradas (com transformações CSS para confundir)
  const options = [
    { id: 0, css: "" }, // Correta
    { id: 1, css: "scale-x-[-1]" }, // Invertida
    { id: 2, css: "rotate-90 scale-75" }, // Virada e menor
    { id: 3, css: "rotate-180" } // De cabeça para baixo
  ].sort(() => Math.random() - 0.5);

  return {
    id: `scene6-${Date.now()}-${target}`,
    instruction: "Qual é exatamente igual?",
    spokenText: "Olhe para a imagem grande. Qual das opções abaixo é exatamente igual a ela?",
    data: { target, options }
  };
};

const Scene6Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { target, options } = challenge.data;
  const isTargetImage = target.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-black/40 rounded-3xl border border-white/30 p-4 shadow-lg flex items-center justify-center">
        {isTargetImage ? (
          <img src={target} alt="alvo" className="w-full h-full object-contain pointer-events-none drop-shadow-xl" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
        ) : <span className="text-7xl pointer-events-none">{target}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt.id === 0, 20)}
            className="aspect-square bg-black/60 border border-white/20 rounded-3xl hover:border-[#bef264] transition-all flex items-center justify-center p-6 shadow-md active:scale-95 overflow-hidden"
          >
            {isTargetImage ? (
               <img src={target} alt="opcao" className={`w-full h-full object-contain pointer-events-none drop-shadow-md transition-transform ${opt.css}`} onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : <span className={`text-6xl pointer-events-none transition-transform ${opt.css}`}>{target}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Scene6GameModule: GameModule = {
  id: "scene-match-6",
  title: "Montagem de Cenas",
  categoryId: "montagem-6",
  supportedAges: ["6-7"],
  generateChallenge: generateScene6Challenge,
  component: Scene6Component
};
