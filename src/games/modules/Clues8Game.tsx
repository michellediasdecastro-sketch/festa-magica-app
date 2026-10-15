import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateClues8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 4 ? context.gameImages : ["🍎", "🚗", "🐶", "⭐", "🎈"];
  
  let attempts = 0;
  let answer = "";
  // Evita repetir a mesma imagem recentemente
  do {
    answer = source[Math.floor(Math.random() * source.length)];
    attempts++;
  } while (history.some(h => h.includes(answer)) && attempts < 20);

  // Gera as 4 opções de resposta
  const optionsSet = new Set<string>([answer]);
  while (optionsSet.size < 4) {
    optionsSet.add(source[Math.floor(Math.random() * source.length)]);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  // Gera 3 coordenadas aleatórias (X e Y) para dar "Zoom" em partes diferentes da imagem
  const fragments = [
    { x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100) },
    { x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100) },
    { x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100) }
  ];

  return {
    id: `clues8-visual-${Date.now()}-${Math.random()}`,
    instruction: "Analise os fragmentos!",
    spokenText: "O nosso sistema recuperou três pedaços da imagem secreta. Junte as pistas visuais e descubra a quem pertencem!",
    data: { fragments, options, answer }
  };
};

const Clues8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { fragments, options, answer } = challenge.data;
  const isImage = answer.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      
      {/* Painel das Pistas Visuais (Fragmentos com Zoom) */}
      <div className="flex flex-col gap-3 bg-black/40 p-4 sm:p-6 rounded-3xl border border-white/20 shadow-inner w-full">
        <h4 className="text-[#bef264] font-black text-sm uppercase tracking-widest text-center mb-2">Pistas Visuais Recuperadas:</h4>
        
        <div className="flex justify-center gap-3 sm:gap-6">
          {fragments.map((frag: any, idx: number) => (
            <div key={idx} className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-2 border-white/30 overflow-hidden shadow-lg bg-black/50">
              <span className="absolute top-1 left-2 text-xs font-bold text-white/50 z-10">#{idx + 1}</span>
              {isImage ? (
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${answer})`,
                    backgroundSize: '400%', // Aplica o Zoom
                    backgroundPosition: `${frag.x}% ${frag.y}%`, // Move para a parte aleatória
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl overflow-hidden" style={{ transform: `scale(4) translate(${(frag.x - 50) / 10}px, ${(frag.y - 50) / 10}px)` }}>
                  {answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Opções de Resposta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 35)}
            className="aspect-square bg-black/60 border border-white/30 rounded-3xl hover:border-[#bef264] flex items-center justify-center p-4 shadow-xl active:scale-95 transition-all"
          >
            {opt.startsWith('http') ? (
              <img src={opt} alt="opt" className="w-full h-full object-contain pointer-events-none drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : (
              <span className="text-5xl pointer-events-none">{opt}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Clues8GameModule: GameModule = {
  id: "clues-detective-8",
  title: "Missões com Pistas",
  categoryId: "pistas-8",
  supportedAges: ["8-9"],
  generateChallenge: generateClues8Challenge,
  component: Clues8Component
};
