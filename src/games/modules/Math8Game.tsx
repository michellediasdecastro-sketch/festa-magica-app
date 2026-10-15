import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMath8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  let a = 0, b = 0, answer = 0;
  let operator = "";
  let missingPart = ""; 

  const type = Math.random();
  
  if (type < 0.35) {
    // Multiplicação normal: A x B = ? (Resposta: Resultado)
    operator = "x";
    a = Math.floor(Math.random() * 8) + 2; // 2 a 9
    b = Math.floor(Math.random() * 8) + 2; // 2 a 9
    answer = a * b;
    missingPart = 'result';
  } else if (type < 0.7) {
    // Soma com B oculto: A + ? = Resultado (Resposta: B)
    operator = "+";
    a = Math.floor(Math.random() * 20) + 10;
    answer = Math.floor(Math.random() * 15) + 5; 
    b = a + answer; // Aqui 'b' atua visualmente como o resultado final
    missingPart = 'b';
  } else {
    // Subtração com B oculto: A - ? = Resultado (Resposta: B real)
    operator = "-";
    a = Math.floor(Math.random() * 20) + 15; 
    const finalResult = Math.floor(Math.random() * 10) + 5; 
    
    if (a <= finalResult) a = finalResult + 5; 
    
    answer = a - finalResult; 
    b = finalResult; 
    missingPart = 'b';
  }

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    let wrong = answer + (Math.floor(Math.random() * 11) - 5);
    
    if (operator === "x" && Math.random() > 0.5) {
      wrong = answer + (Math.random() > 0.5 ? a : b) * (Math.random() > 0.5 ? 1 : -1);
    }
    
    if (wrong > 0 && wrong !== answer) optionsSet.add(wrong);
  }
  
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
  const signature = `math8-${a}${operator}${missingPart === 'b' ? answer : b}`;

  return {
    id: `${signature}-${Date.now()}-${Math.random()}`,
    instruction: "Resolva o enigma matemático!",
    spokenText: "Pense bem e descubra qual é o número que resolve este desafio.",
    data: { a, b, operator, missingPart, options, answer }
  };
};

const Math8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { a, b, operator, missingPart, options, answer } = challenge.data;

  let displayA: string | number = a;
  let displayB: string | number = b;
  let displayRes: string | number = answer;

  if (operator === "x") {
    displayA = a;
    displayB = b;
    displayRes = "?";
  } else if (operator === "+") {
    displayA = a;
    displayB = "?";
    displayRes = b;
  } else if (operator === "-") {
    displayA = a;
    displayB = "?";
    displayRes = b;
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-lg mx-auto">
      {/* Ajuste nas margens, paddings, gap e tamanho da fonte para manter tudo dentro do retângulo */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 bg-black/40 p-4 sm:p-8 rounded-[2rem] border border-white/20 shadow-inner w-full">
        <div className={`text-4xl sm:text-6xl font-black ${missingPart === 'a' ? 'text-[#bef264] animate-pulse' : 'text-white'}`}>
          {displayA}
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-white/50">{operator}</div>
        <div className={`text-4xl sm:text-6xl font-black ${missingPart === 'b' ? 'text-[#bef264] animate-pulse' : 'text-white'}`}>
          {displayB}
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-white/50">=</div>
        <div className={`text-4xl sm:text-6xl font-black ${missingPart === 'result' ? 'text-[#bef264] animate-pulse' : 'text-white'}`}>
          {displayRes}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {options.map((opt: number, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 30)}
            className="py-4 sm:py-6 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-3xl sm:text-5xl font-black shadow-xl active:scale-95 text-white"
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
