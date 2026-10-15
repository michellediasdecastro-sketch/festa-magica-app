import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateShadowChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const uniqueImages = Array.from(new Set(context.gameImages));
  const fallback = ["🍎", "🚗", "🐶", "⭐", "🎈", "🚀", "⚽", "🐻"];
  const source = uniqueImages.length >= 3 ? uniqueImages : fallback;

  let attempts = 0;
  let signature = "";
  let options: string[] = [];
  let target = "";
  
  do {
    // Escolhe 4 itens diferentes (se possível)
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    options = shuffled.slice(0, Math.min(4, source.length));
    
    // Se não tiver 4 diferentes, preenche com repetidos
    while (options.length < 4) {
        options.push(source[Math.floor(Math.random() * source.length)]);
    }
    
    target = options[Math.floor(Math.random() * options.length)];
    options = options.sort(() => Math.random() - 0.5); // Baralha posições
    
    signature = `shadow-${target.substring(0,3)}`;
    attempts++;
  } while (history.includes(signature) && attempts < 10);

  return {
    id: signature || Date.now().toString(),
    instruction: "De quem é esta sombra?",
    spokenText: "Olhe bem para esta sombra misteriosa. A quem ela pertence?",
    data: { options, target }
  };
};

const ShadowComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { options, target } = challenge.data;
  const isTargetImage = target.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      
      {/* Sombra (Alvo com CSS filter para ficar totalmente preto) */}
      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-black/30 rounded-[2rem] border border-white/20 p-4 flex items-center justify-center shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        {isTargetImage ? (
          <img 
            src={target} 
            alt="sombra" 
            className="w-full h-full object-contain pointer-events-none drop-shadow-2xl" 
            // O segredo está aqui: brightness(0) transforma a imagem numa silhueta perfeita!
            style={{ filter: 'brightness(0) drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' }}
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} 
          />
        ) : (
          <span className="text-7xl pointer-events-none" style={{ filter: 'brightness(0)' }}>{target}</span>
        )}
      </div>

      {/* Opções de Resposta */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt: string, idx: number) => {
          const isOptImage = opt.startsWith('http');
          return (
            <button
              key={idx}
              onClick={() => onAnswer(opt === target, 15)}
              className="aspect-[4/3] rounded-2xl bg-black/50 border border-white/20 hover:border-[#bef264] hover:bg-white/10 transition-all flex items-center justify-center p-3 shadow-lg active:scale-95"
            >
              {isOptImage ? (
                <img src={opt} alt="opcao" className="w-full h-full object-contain pointer-events-none drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              ) : <span className="text-5xl pointer-events-none">{opt}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const ShadowGameModule: GameModule = {
  id: "shadow-match-core",
  title: "A Sombra Misteriosa",
  categoryId: "cores-formas", // Vai ligar-se ao botão "Cores e Tamanhos"
  supportedAges: ["4-5", "6-7", "8-9", "10-11"],
  generateChallenge: generateShadowChallenge,
  component: ShadowComponent
};
