import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateCases10Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 4 ? context.gameImages : ["🍎", "🚗", "🐶", "⭐", "🎈"];
  
  // Escolhe 4 imagens únicas e baralha
  const options = [...source].sort(() => Math.random() - 0.5).slice(0, 4);
  
  // O culpado será um deles aleatoriamente
  const culpritIndex = Math.floor(Math.random() * 4);
  const culprit = options[culpritIndex];
  
  // Identifica os índices dos inocentes (0 a 3)
  const innocents = [0, 1, 2, 3].filter(i => i !== culpritIndex);

  // Pista 1: Elimina o primeiro inocente
  const p1 = `As câmaras de segurança provam que a Figura ${innocents[0] + 1} não estava no local.`;
  
  // Pista 2: Elimina o segundo inocente (com variação de texto)
  const p2 = `A testemunha garante que o culpado não é a Figura ${innocents[1] + 1}.`;
  
  // Pista 3: Elimina o terceiro inocente
  const p3 = `Encontramos provas que inocentam totalmente a Figura ${innocents[2] + 1}.`;

  // Baralha a ordem das pistas para não ser sempre igual
  const premises = [p1, p2, p3].sort(() => Math.random() - 0.5);

  return {
    id: `cases10-${Date.now()}-${Math.random()}`,
    instruction: "Descubra o Culpado!",
    spokenText: "Leia o relatório policial com atenção. Elimine os suspeitos inocentes para encontrar o culpado.",
    data: { premises, options, culprit }
  };
};

const Cases10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { premises, options, culprit } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-3 bg-black/40 p-6 rounded-3xl border border-white/20 shadow-inner w-full">
        <h4 className="text-red-400 font-black text-sm uppercase tracking-widest text-center mb-2">Relatório Policial:</h4>
        {premises.map((premise: string, idx: number) => (
          <div key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-white/50 font-bold shrink-0">#0{idx + 1}</span>
            <p className="text-white font-medium">{premise}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === culprit, 50)}
            className="relative aspect-square bg-black/60 border border-white/30 rounded-3xl hover:border-red-400 flex items-center justify-center p-4 shadow-xl active:scale-95 transition-all group"
          >
            <span className="absolute top-2 left-3 text-xs font-bold text-white/40">Figura {idx + 1}</span>
            {opt.startsWith('http') ? (
              <img src={opt} alt={`figura ${idx + 1}`} className="w-full h-full object-contain pointer-events-none drop-shadow-md mt-4" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : (
              <span className="text-5xl pointer-events-none mt-4">{opt}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Cases10GameModule: GameModule = {
  id: "cases-investigation-10",
  title: "Casos de Investigação",
  categoryId: "casos-10",
  supportedAges: ["10-11"],
  generateChallenge: generateCases10Challenge,
  component: Cases10Component
};
