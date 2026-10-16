import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Componente visual para desenhar um dominó com "pontinhos"
const DominoPiece: React.FC<{ left: number, right: number, isOption?: boolean }> = ({ left, right, isOption }) => {
  const renderDots = (num: number) => {
    const dots = Array(9).fill(false);
    if (num === 1) dots[4] = true;
    else if (num === 2) { dots[0] = true; dots[8] = true; }
    else if (num === 3) { dots[0] = true; dots[4] = true; dots[8] = true; }
    else if (num === 4) { dots[0] = true; dots[2] = true; dots[6] = true; dots[8] = true; }
    else if (num === 5) { dots[0] = true; dots[2] = true; dots[4] = true; dots[6] = true; dots[8] = true; }
    else if (num === 6) { dots[0] = true; dots[2] = true; dots[3] = true; dots[5] = true; dots[6] = true; dots[8] = true; }

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-1 sm:p-2">
        {dots.map((active, i) => (
          <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${active ? 'bg-black' : 'bg-transparent'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className={`flex bg-white rounded-xl border-[3px] border-black/80 shadow-md ${isOption ? 'w-24 h-12' : 'w-20 h-10 sm:w-24 sm:h-12'}`}>
      <div className="flex-1 border-r-2 border-black/80 flex items-center justify-center">
        {renderDots(left)}
      </div>
      <div className="flex-1 flex items-center justify-center">
        {renderDots(right)}
      </div>
    </div>
  );
};

const generateDominoesChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  // Gera uma cadeia lógica de 3 dominós (A-B, B-C, C-D)
  const a = Math.floor(Math.random() * 6) + 1;
  const b = Math.floor(Math.random() * 6) + 1;
  const c = Math.floor(Math.random() * 6) + 1;
  const d = Math.floor(Math.random() * 6) + 1;
  const e = Math.floor(Math.random() * 6) + 1;

  const sequence = [
    { left: a, right: b },
    { left: b, right: c },
    { left: c, right: d }
  ];

  // A resposta correta deve começar por 'd'
  const answer = { left: d, right: e };

  // Gera opções erradas (nenhuma pode começar por 'd' para não haver duas certas)
  const optionsSet = new Set<string>([JSON.stringify(answer)]);
  while (optionsSet.size < 4) {
    const wrongL = Math.floor(Math.random() * 6) + 1;
    const wrongR = Math.floor(Math.random() * 6) + 1;
    if (wrongL !== d) {
      optionsSet.add(JSON.stringify({ left: wrongL, right: wrongR }));
    }
  }

  const options = Array.from(optionsSet).map(o => JSON.parse(o)).sort(() => Math.random() - 0.5);

  return {
    id: `dominoes10-${Date.now()}-${d}`,
    instruction: "Complete a Sequência!",
    spokenText: "Observe como as peças se encaixam! Qual é o dominó correto para fechar a linha?",
    data: { sequence, options, answer }
  };
};

const Dominoes10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { sequence, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      
      {/* Sequência de Dominós */}
      <div className="flex items-center gap-2 sm:gap-4 bg-black/40 p-6 rounded-3xl border border-white/20 shadow-inner w-full overflow-x-auto justify-center">
        {sequence.map((domino: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 sm:gap-4">
            <DominoPiece left={domino.left} right={domino.right} />
            <span className="text-white/30 font-black">→</span>
          </div>
        ))}
        {/* Espaço Vazio para o Encaixe */}
        <div className="w-20 h-10 sm:w-24 sm:h-12 border-2 border-dashed border-[#bef264] rounded-xl flex items-center justify-center bg-white/5 animate-pulse">
          <span className="text-[#bef264] font-black">?</span>
        </div>
      </div>

      {/* Opções */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt.left === answer.left && opt.right === answer.right, 40)}
            className="flex items-center justify-center py-6 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] hover:bg-white/10 transition-all shadow-xl active:scale-95"
          >
            <DominoPiece left={opt.left} right={opt.right} isOption={true} />
          </button>
        ))}
      </div>
    </div>
  );
};

export const Dominoes10GameModule: GameModule = {
  id: "dominoes-logic-10",
  title: "Dominó Lógico",
  categoryId: "domino-10",
  supportedAges: ["10-11"],
  generateChallenge: generateDominoesChallenge,
  component: Dominoes10Component
};
