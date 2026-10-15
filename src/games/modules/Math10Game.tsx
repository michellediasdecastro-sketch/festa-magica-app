import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMath10Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  let attempts = 0;
  let signature = "";
  let a = 0, b = 0, c = 0, answer = 0, trap = 0;
  let operator1 = "", operator2 = "";

  do {
    const type = Math.random();
    
    // Expressões mistas: ex: A + B x C (A multiplicação tem prioridade!)
    if (type < 0.5) {
      operator1 = "+";
      operator2 = "x";
      a = Math.floor(Math.random() * 15) + 5;
      b = Math.floor(Math.random() * 8) + 2;
      c = Math.floor(Math.random() * 8) + 2;
      answer = a + (b * c);
      trap = (a + b) * c; // Erro comum de quem soma primeiro
    } else {
      operator1 = "x";
      operator2 = "-";
      a = Math.floor(Math.random() * 8) + 2;
      b = Math.floor(Math.random() * 8) + 2;
      c = Math.floor(Math.random() * 10) + 5;
      answer = (a * b) - c;
      if (answer < 0) answer = answer * -1; // Evita números negativos
      trap = a * (b - c > 0 ? b - c : c - b); // Erro comum
    }

    signature = `math10-${a}${operator1}${b}${operator2}${c}`;
    attempts++;
  } while (history.some(h => h.includes(signature)) && attempts < 20);

  const optionsSet = new Set<number>([answer, trap]);
  while (optionsSet.size < 4) {
    let wrong = answer + (Math.floor(Math.random() * 15) - 7);
    if (wrong > 0 && wrong !== answer && wrong !== trap) optionsSet.add(wrong);
  }
  
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `${signature}-${Date.now()}`,
    instruction: "Resolva a Expressão!",
    spokenText: "Atenção às regras matemáticas! A multiplicação resolve-se primeiro.",
    data: { a, b, c, operator1, operator2, options, answer }
  };
};

const Math10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { a, b, c, operator1, operator2, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-lg mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-black/40 p-4 sm:p-8 rounded-[2rem] border border-white/20 shadow-inner w-full">
        <div className="text-4xl sm:text-6xl font-black text-white">{a}</div>
        <div className="text-3xl sm:text-4xl font-bold text-[#bef264]">{operator1}</div>
        <div className="text-4xl sm:text-6xl font-black text-white">{b}</div>
        <div className="text-3xl sm:text-4xl font-bold text-[#bef264]">{operator2}</div>
        <div className="text-4xl sm:text-6xl font-black text-white">{c}</div>
        <div className="text-3xl sm:text-4xl font-bold text-white/50">=</div>
        <div className="text-4xl sm:text-6xl font-black text-[#bef264] animate-pulse">?</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {options.map((opt: number, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 40)}
            className="py-4 sm:py-6 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-3xl sm:text-5xl font-black shadow-xl active:scale-95 text-white"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Math10GameModule: GameModule = {
  id: "math-multi-10",
  title: "Matemática em Múltiplas Etapas",
  categoryId: "matematica-10",
  supportedAges: ["10-11"],
  generateChallenge: generateMath10Challenge,
  component: Math10Component
};
