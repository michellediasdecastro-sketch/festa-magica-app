import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateTreasureChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const uniqueImages = Array.from(new Set(context.gameImages));
  const fallback = ["🍎", "🚗", "🐶", "⭐", "🎈", "🚀", "⚽", "🐻"];
  const source = uniqueImages.length >= 2 ? uniqueImages : fallback;

  let attempts = 0;
  let signature = "";
  let gridItems: string[] = [];
  let target = "";
  
  do {
    // Escolhe o alvo
    target = source[Math.floor(Math.random() * source.length)];
    
    // Define quantos itens vão aparecer na tela (aumenta com a dificuldade)
    const totalItems = Math.min(24, Math.max(6, Math.floor(difficulty * 2 + 4)));
    
    // Preenche a grelha com itens aleatórios, certificando-se de que não são o alvo
    gridItems = [];
    while (gridItems.length < totalItems - 1) {
      const randomItem = source[Math.floor(Math.random() * source.length)];
      if (randomItem !== target || source.length === 1) {
        gridItems.push(randomItem);
      }
    }
    
    // Insere o alvo no meio da bagunça e baralha
    gridItems.push(target);
    gridItems = gridItems.sort(() => Math.random() - 0.5);
    
    signature = `hunt-${totalItems}-${target.substring(0,3)}`;
    attempts++;
  } while (history.includes(signature) && attempts < 10);

  return {
    id: signature || Date.now().toString(),
    instruction: "Encontre o alvo escondido!",
    spokenText: "Um item está perdido no meio da bagunça. Consegue encontrá-lo?",
    data: { gridItems, target }
  };
};

const TreasureHuntComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { gridItems, target } = challenge.data;
  const isTargetImage = target.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Painel indicando qual é o alvo */}
      <div className="bg-[#bef264]/20 border-2 border-[#bef264] rounded-3xl p-4 flex flex-col items-center gap-2 animate-bounce-slight shadow-[0_0_15px_rgba(190,242,100,0.3)]">
        <span className="text-sm font-bold text-[#bef264] uppercase tracking-wider">Procure por:</span>
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 rounded-2xl p-2 flex items-center justify-center shadow-inner">
          {isTargetImage ? (
            <img src={target} alt="alvo" className="w-full h-full object-contain pointer-events-none drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          ) : <span className="text-5xl pointer-events-none">{target}</span>}
        </div>
      </div>

      {/* Grelha da Bagunça */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 bg-black/40 p-4 sm:p-6 rounded-3xl border border-white/20 shadow-inner w-full">
        {gridItems.map((item: string, idx: number) => {
          const isItemImage = item.startsWith('http');
          return (
            <button
              key={idx}
              onClick={() => onAnswer(item === target, 15)}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-black/60 border border-white/10 hover:border-[#bef264] hover:bg-white/10 transition-all flex items-center justify-center overflow-hidden active:scale-90"
            >
              {isItemImage ? (
                <img src={item} alt="item" className="w-3/4 h-3/4 object-contain pointer-events-none drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              ) : <span className="text-3xl pointer-events-none">{item}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const TreasureHuntGameModule: GameModule = {
  id: "treasure-hunt-core",
  title: "Caça ao Tesouro",
  categoryId: "busca", // Vai ligar-se ao botão "Caça ao Tesouro"
  supportedAges: ["4-5", "6-7", "8-9", "10-11"],
  generateChallenge: generateTreasureChallenge,
  component: TreasureHuntComponent
};
