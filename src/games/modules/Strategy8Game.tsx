import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateStrategy8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 4 ? context.gameImages : ["🍎", "🚗", "🐶", "⭐", "🎈"];
  const selected = [...source].sort(() => Math.random() - 0.5).slice(0, 4);
  
  const sequenceLength = Math.min(8, Math.max(3, Math.floor(difficulty + 2)));
  const sequence: number[] = [];
  
  for (let i = 0; i < sequenceLength; i++) {
    sequence.push(Math.floor(Math.random() * 4));
  }

  return {
    id: `strategy8-${Date.now()}-${Math.random()}`,
    instruction: "Repita a sequência exata!",
    spokenText: "Observe a ordem em que os itens brilham e repita exatamente igual.",
    data: { selected, sequence }
  };
};

const Strategy8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { selected, sequence } = challenge.data;
  const [playerTurn, setPlayerTurn] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [playerStep, setPlayerStep] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setPlayerTurn(false);
    setPlayerStep(0);
    setActiveIdx(null);

    const playSequence = async () => {
      await new Promise(r => setTimeout(r, 800));
      for (let i = 0; i < sequence.length; i++) {
        if (!isMounted) return;
        setActiveIdx(sequence[i]);
        await new Promise(r => setTimeout(r, 600));
        if (!isMounted) return;
        setActiveIdx(null);
        await new Promise(r => setTimeout(r, 200));
      }
      if (isMounted) setPlayerTurn(true);
    };

    playSequence();
    return () => { isMounted = false; };
  }, [challenge.id, sequence]);

  const handleBoxClick = (idx: number) => {
    if (!playerTurn) return;

    setActiveIdx(idx);
    setTimeout(() => setActiveIdx(null), 200);

    if (idx === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);
      if (nextStep === sequence.length) {
        setPlayerTurn(false);
        setTimeout(() => onAnswer(true, 40), 500);
      }
    } else {
      setPlayerTurn(false);
      setTimeout(() => onAnswer(false, 0), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="text-xl font-bold text-[#bef264] h-8">
        {!playerTurn ? "Observe com atenção..." : "Sua vez! Repita a ordem."}
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        {selected.map((item: string, idx: number) => {
          const isImage = item.startsWith('http');
          const isActive = activeIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => handleBoxClick(idx)}
              disabled={!playerTurn}
              className={`aspect-square rounded-[2rem] border-4 transition-all duration-150 flex items-center justify-center p-4
                ${isActive ? 'bg-[#bef264]/40 border-[#bef264] scale-105 shadow-[0_0_30px_rgba(190,242,100,0.6)]' : 'bg-black/60 border-white/20 shadow-md'}
                ${!playerTurn ? 'cursor-default' : 'hover:border-[#bef264]/50 cursor-pointer active:scale-95'}
              `}
            >
              {isImage ? (
                <img src={item} alt="item" className="w-full h-full object-contain pointer-events-none drop-shadow-lg" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              ) : (
                <span className="text-6xl pointer-events-none">{item}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Strategy8GameModule: GameModule = {
  id: "strategy-simon-8",
  title: "Estratégia e Planejamento",
  categoryId: "estrategia-8",
  supportedAges: ["8-9"],
  generateChallenge: generateStrategy8Challenge,
  component: Strategy8Component
};
