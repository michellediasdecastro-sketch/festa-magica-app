import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateCode8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 3 ? context.gameImages : ["🍎", "⭐", "🎈", "🚗"];
  
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  const targets = [shuffled[0], shuffled[1], shuffled[2]];
  
  const code = [
    Math.floor(Math.random() * 4) + 2, // 2 a 5
    Math.floor(Math.random() * 4) + 2,
    Math.floor(Math.random() * 4) + 2
  ];

  let gridItems: string[] = [];
  targets.forEach((target, index) => {
    for (let i = 0; i < code[index]; i++) gridItems.push(target);
  });

  // Preenche o resto com lixo para dificultar
  const totalItems = 24; 
  while (gridItems.length < totalItems) {
    const randomTrash = source[Math.floor(Math.random() * source.length)];
    if (!targets.includes(randomTrash)) {
      gridItems.push(randomTrash);
    }
  }
  
  gridItems = gridItems.sort(() => Math.random() - 0.5);

  return {
    id: `code8-${Date.now()}-${Math.random()}`,
    instruction: "Descubra a Senha do Cofre!",
    spokenText: "Para abrir o cofre, conte exatamente quantos itens de cada tipo existem na tela e digite a senha.",
    data: { targets, code, gridItems }
  };
};

const Code8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { targets, code, gridItems } = challenge.data;
  const [inputCode, setInputCode] = useState<string[]>(["", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setInputCode(["", "", ""]);
    setActiveIndex(0);
  }, [challenge.id]);

  const handleKeypad = (num: number) => {
    const newCode = [...inputCode];
    newCode[activeIndex] = num.toString();
    setInputCode(newCode);
    
    if (activeIndex < 2) {
      setActiveIndex(activeIndex + 1);
    } else {
      // Avalia a resposta ao digitar o último número
      const finalGuess = newCode.join("");
      const correctAnswer = code.join("");
      setTimeout(() => {
        onAnswer(finalGuess === correctAnswer, 35);
        setInputCode(["", "", ""]);
        setActiveIndex(0);
      }, 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex gap-4">
        {targets.map((target: string, idx: number) => (
          <div key={idx} onClick={() => setActiveIndex(idx)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-black/50 ${activeIndex === idx ? 'border-[#bef264] shadow-[0_0_15px_rgba(190,242,100,0.4)]' : 'border-white/20'}`}>
             <div className="w-10 h-10 sm:w-12 sm:h-12">
               {target.startsWith('http') ? <img src={target} alt="alvo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} /> : <span className="text-3xl">{target}</span>}
             </div>
             <div className="text-3xl sm:text-4xl font-black text-white w-12 h-12 flex items-center justify-center bg-black/60 rounded-xl">
               {inputCode[idx] !== "" ? inputCode[idx] : "?"}
             </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 bg-black/40 p-4 rounded-[2rem] border border-white/20 shadow-inner w-full max-w-lg">
        {gridItems.map((item: string, idx: number) => (
          <div key={idx} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
            {item.startsWith('http') ? <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} /> : <span className="text-2xl">{item}</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2 w-full max-w-md">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
          <button key={num} onClick={() => handleKeypad(num)} className="py-3 rounded-xl bg-white/10 hover:bg-[#bef264] hover:text-black transition-all border border-white/20 text-xl font-bold text-white shadow-md active:scale-90">
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Code8GameModule: GameModule = {
  id: "code-safe-8",
  title: "Códigos e Mensagens",
  categoryId: "codigos-8",
  supportedAges: ["8-9"],
  generateChallenge: generateCode8Challenge,
  component: Code8Component
};
