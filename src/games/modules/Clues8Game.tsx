import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const CLUES_DB: Record<string, string[]> = {
  "CAUDA": ["Tem uma parte do corpo bem longa atrás.", "Usa para se equilibrar ou bater nos inimigos."],
  "CHIFRES": ["Possui pontas afiadas na cabeça.", "Usa para se defender de predadores como o T-Rex."],
  "DENTES": ["Tem uma mordida muito poderosa.", "É um caçador temido na floresta."],
  "PESCOÇO": ["Consegue alcançar as árvores mais altas.", "É gigante, mas costuma ser pacífico."],
  "ASAS": ["Não precisa caminhar para se deslocar.", "Fica lá no alto, perto das nuvens."],
  "PLACAS": ["Tem formas geométricas duras nas costas.", "Parece que tem uma armadura espetada."],
  "DEFAULT": ["É um ser pré-histórico muito antigo.", "Pode ser encontrado em escavações."]
};

const getClues = (url: string) => {
  const upper = url.toUpperCase();
  if (upper.includes("TRICERATOPS")) return CLUES_DB["CHIFRES"];
  if (upper.includes("TREX") || upper.includes("TYRANNOSAURUS")) return CLUES_DB["DENTES"];
  if (upper.includes("BRACHIOSAURUS") || upper.includes("DIPLODOCUS")) return CLUES_DB["PESCOÇO"];
  if (upper.includes("PTERANODON")) return CLUES_DB["ASAS"];
  if (upper.includes("STEGOSAURUS")) return CLUES_DB["PLACAS"];
  return CLUES_DB["DEFAULT"];
};

const generateClues8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 4 ? context.gameImages : ["🍎", "🚗", "🐶", "⭐", "🎈"];
  
  let attempts = 0;
  let answer = "";
  do {
    answer = source[Math.floor(Math.random() * source.length)];
    attempts++;
  } while (history.some(h => h.includes(answer)) && attempts < 20);

  const clues = getClues(answer);

  const optionsSet = new Set<string>([answer]);
  while (optionsSet.size < 4) {
    optionsSet.add(source[Math.floor(Math.random() * source.length)]);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `clues8-${Date.now()}-${Math.random()}`,
    instruction: "Quem sou eu?",
    spokenText: "Leia as pistas com atenção e descubra quem é o dono desta identidade.",
    data: { clues, options, answer }
  };
};

const Clues8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { clues, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-3 bg-black/40 p-6 rounded-3xl border border-white/20 shadow-inner w-full">
        <h4 className="text-[#bef264] font-black text-sm uppercase tracking-widest mb-2">Arquivo Confidencial:</h4>
        {clues.map((clue: string, idx: number) => (
          <div key={idx} className="flex items-start gap-3">
            <span className="text-white/50 font-bold mt-1">#0{idx + 1}</span>
            <p className="text-white font-medium text-lg sm:text-xl">{clue}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 30)}
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
