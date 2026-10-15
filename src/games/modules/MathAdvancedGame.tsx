import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMathAdvancedChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const uniqueImages = Array.from(new Set(context.gameImages));
  const source = uniqueImages.length > 0 ? uniqueImages : ["🍎", "⭐", "🦖"];
  const item = source[Math.floor(Math.random() * source.length)];

  // Aos 6-7 anos, vamos trabalhar somas e subtrações simples (resultados até 12)
  const isAddition = Math.random() > 0.5;
  let a = 0, b = 0, answer = 0;

  if (isAddition) {
    a = Math.floor(Math.random() * 6) + 1;
    b = Math.floor(Math.random() * 6) + 1;
    answer = a + b;
  } else {
    a = Math.floor(Math.random() * 6) + 4; // Entre 4 e 9
    b = Math.floor(Math.random() * (a - 1)) + 1; // Menor que a
    answer = a - b;
  }

  // Opções de resposta (garantindo que não há repetidas e incluem a certa)
  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    const wrong = answer + (Math.floor(Math.random() * 7) - 3);
    if (wrong >= 0 && wrong !== answer) optionsSet.add(wrong);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  const signature = `mathadv-${a}${isAddition?'+':'-'}${b}`;

  return {
    id: signature + Date.now(),
    instruction: "Resolva o desafio!",
    spokenText: isAddition ? "Temos alguns itens e ganhamos mais. Quantos ficam no total?" : "Temos alguns itens, mas alguns foram embora. Quantos sobram?",
    data: { a, b, isAddition, answer, options, item }
  };
};

const MathAdvancedComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { a, b, isAddition, options, answer, item } = challenge.data;
  const isImage = item.startsWith('http');

  const renderItems = (count: number) => (
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 p-3 bg-black/40 rounded-2xl border border-white/10 shadow-inner min-h-[80px] sm:min-h-[100px] items-center">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center animate-fade-in">
          {isImage ? (
            <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-md pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          ) : <span className="text-3xl pointer-events-none">{item}</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      
      {/* Visualização da Operação Matemática */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 w-full">
        <div className="flex-1">{renderItems(a)}</div>
        <div className="text-4xl font-black text-[#bef264] drop-shadow-md">{isAddition ? '+' : '-'}</div>
        <div className="flex-1">{renderItems(b)}</div>
        <div className="text-4xl font-black text-[#bef264] drop-shadow-md">=</div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl border-2 border-dashed border-[#bef264] flex items-center justify-center animate-pulse">
          <span className="text-4xl text-[#bef264]">?</span>
        </div>
      </div>
      
      {/* Botões de Resposta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-4">
        {options.map((opt: number, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 20)}
            className="py-5 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-4xl sm:text-5xl font-black shadow-xl active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const MathAdvancedGameModule: GameModule = {
  id: "math-advanced-6",
  title: "Matemática Interativa",
  categoryId: "matematica-6",
  supportedAges: ["6-7"], // EXCLUSIVO PARA 6 E 7 ANOS
  generateChallenge: generateMathAdvancedChallenge,
  component: MathAdvancedComponent
};
