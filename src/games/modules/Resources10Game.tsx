import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateResources10Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎", "⭐"];
  const item = source[Math.floor(Math.random() * source.length)];
  
  const unitPrice = Math.floor(Math.random() * 12) + 4; // Preço de 4 a 15
  const quantity = Math.floor(Math.random() * 4) + 3; // Quantidade de 3 a 6
  const totalCost = unitPrice * quantity;
  
  // O orçamento é sempre um número redondo acima do custo
  const budgetOptions = [50, 100, 150];
  const budget = budgetOptions.find(b => b > totalCost) || 200;
  
  const answer = budget - totalCost; // O troco

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    const wrong = answer + (Math.floor(Math.random() * 21) - 10);
    if (wrong >= 0 && wrong !== answer) optionsSet.add(wrong);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `resources10-${Date.now()}-${Math.random()}`,
    instruction: "Calcule o Troco!",
    spokenText: "Faça a gestão dos seus recursos. Compre os itens necessários e descubra quanto lhe sobra.",
    data: { item, unitPrice, quantity, budget, options, answer }
  };
};

const Resources10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { item, unitPrice, quantity, budget, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="flex flex-col gap-4 bg-black/40 p-6 rounded-3xl border border-white/20 w-full shadow-inner">
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
          <span className="text-white/60 font-bold">O Seu Orçamento:</span>
          <span className="text-3xl font-black text-[#bef264]">{budget} 💎</span>
        </div>
        
        <div className="flex items-center gap-4 bg-black/50 p-4 rounded-2xl border border-white/10">
          <div className="w-16 h-16 shrink-0 bg-white/10 rounded-xl p-2 flex items-center justify-center shadow-md">
            {item.startsWith('http') ? (
              <img src={item} alt="item" className="w-full h-full object-contain pointer-events-none drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : <span className="text-4xl pointer-events-none">{item}</span>}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg">Custo Unitário: {unitPrice} 💎</span>
            <span className="text-white/60 text-sm">Quantidade necessária: x{quantity}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt: number, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 40)}
            className="py-5 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-3xl font-black shadow-xl active:scale-95 text-white flex items-center justify-center gap-2"
          >
            {opt} <span className="text-xl text-white/50">💎</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const Resources10GameModule: GameModule = {
  id: "resources-manage-10",
  title: "Estratégia e Recursos",
  categoryId: "recursos-10",
  supportedAges: ["10-11"],
  generateChallenge: generateResources10Challenge,
  component: Resources10Component
};
