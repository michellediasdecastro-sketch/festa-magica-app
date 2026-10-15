import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMath8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  let attempts = 0;
  let signature = "";
  let a = 0, b = 0, answer = 0;
  let operator = "";
  let missingPart = ""; // 'result', 'a', ou 'b'

  do {
    const type = Math.random();
    
    if (type < 0.4) {
      // Multiplicação (ex: 4 x 3 = ?)
      operator = "x";
      a = Math.floor(Math.random() * 8) + 2; // 2 a 9
      b = Math.floor(Math.random() * 8) + 2;
      answer = a * b;
      missingPart = 'result';
    } else if (type < 0.7) {
      // Soma com valor oculto (ex: 15 + ? = 25)
      operator = "+";
      a = Math.floor(Math.random() * 20) + 10;
      answer = Math.floor(Math.random() * 15) + 5; // Este é o 'b' que será a resposta
      b = a + answer; // b aqui atua como o resultado final exibido
      missingPart = 'b';
    } else {
      // Subtração com valor oculto (ex: ? - 12 = 8)
      operator = "-";
      b = Math.floor(Math.random() * 15) + 5;
      const result = Math.floor(Math.random() * 15) + 5;
      a = b + result; // 'a' é o valor total original
      answer = a; // a resposta que a criança tem de adivinhar
      missingPart = 'a';
    }

    signature = `math8-${a}${operator}${missingPart === 'b' ? answer : b}`;
    attempts++;
  } while (history.some(h => h.includes(signature)) && attempts < 20);

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    let wrong = answer + (Math.floor(Math.random() * 11) - 5);
    if (operator === "x") {
      // Erros comuns de tabuada
      wrong = answer + (Math.random() > 0.5 ? a : b) * (Math.random() > 0.5 ? 1 : -1);
    }
    if (wrong > 0 && wrong !== answer) optionsSet.add(wrong);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `${signature}-${Date.now()}`,
    instruction: "Resolva o enigma matemático!",
    spokenText: "Pense bem e descubra qual é o número que resolve este desafio.",
    data: { a, b, operator, missingPart, options, answer }
  };
};

const Math8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { a, b, operator, missingPart, options, answer } = challenge.data;

  // Ajusta as variáveis para a visualização correta da equação
  const displayA = missingPart === 'a' ? "?" : a;
  const displayOp = operator;
  const displayB = missingPart === 'b' ? "?" : (operator === "+" || operator === "-" ? (missingPart === 'result' ? b : (operator === "+" ? b - a : a - b)) : b);
  const displayRes = missingPart === 'result' ? "?" : (operator === "+" ? b : (operator === "-" ? a - b : answer));

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      <div className="flex items-center justify-center gap-3 sm:gap-6 bg-black/40 p-6 sm:p-8 rounded-[2rem] border border-white/20 shadow-inner w-full">
        <div className={`text-5xl sm:text-7xl font-black ${missingPart === 'a' ? 'text-[#bef264] animate-pulse' : 'text-white'}`}>
          {displayA}
        </div>
        <div className="text-4xl sm:text-5xl font-bold text-white/50">{displayOp}</div>
        <div className={`text-5xl sm:text-7xl font-black ${missingPart === 'b' ? 'text-[#bef264] animate-pulse' : 'text-white'}`}>
          {displayB}
        </div>
        <div className="text-4xl sm:text-5xl font-bold text-white/50">=</div>
        <div className={`text-5xl sm:text-7xl font-black ${missingPart === 'result' ? 'text-[#bef264] animate-pulse' : 'text-white'}`}>
          {displayRes}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt: number, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 30)}
            className="py-6 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-4xl sm:text-5xl font-black shadow-xl active:scale-95 text-white"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Math8GameModule: GameModule = {
  id: "math-advanced-8",
  title: "Matemática por Desafios",
  categoryId: "matematica-8",
  supportedAges: ["8-9"],
  generateChallenge: generateMath8Challenge,
  component: Math8Component
};
