import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMaze6Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎", "⭐"];
  const avatar = source[0];
  const target = source.length > 1 ? source[1] : "🎈";

  // Labirintos 4x4
  const layouts = [
    [1, 1, 0, 0,  0, 1, 0, 0,  0, 1, 1, 0,  0, 0, 1, 1],
    [1, 0, 0, 0,  1, 1, 0, 0,  0, 1, 1, 1,  0, 0, 0, 1],
    [1, 1, 1, 0,  0, 0, 1, 0,  0, 0, 1, 1,  0, 0, 0, 1]
  ];
  const grid = layouts[Math.floor(Math.random() * layouts.length)];

  return {
    id: `maze6-${Date.now()}`,
    instruction: "Siga o caminho correto!",
    spokenText: "Atenção! Pise apenas nas pedras seguras para chegar ao outro lado.",
    data: { grid, avatar, target }
  };
};

const Maze6Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { grid, avatar, target } = challenge.data;
  const [position, setPosition] = useState(0);

  useEffect(() => { setPosition(0); }, [challenge.id]);

  const handleMove = (index: number) => {
    const validMoves = [position - 1, position + 1, position - 4, position + 4];
    // Evita saltar linhas (ex: do 3 para o 4 se for borda)
    if (position % 4 === 3 && index === position + 1) return;
    if (position % 4 === 0 && index === position - 1) return;
    
    if (!validMoves.includes(index)) return;

    if (grid[index] === 0) {
      onAnswer(false, 0);
    } else {
      setPosition(index);
      if (index === 15) {
        setTimeout(() => onAnswer(true, 25), 300);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-4 bg-black/40 rounded-3xl border border-white/20">
      <div className="grid grid-cols-4 gap-2 w-full aspect-square">
        {grid.map((cellType: number, idx: number) => (
          <button
            key={idx}
            onClick={() => handleMove(idx)}
            className={`w-full h-full rounded-xl flex items-center justify-center transition-all duration-300 border-2 shadow-inner
              ${cellType === 1 ? 'bg-white/5 border-white/10 hover:bg-white/20' : 'bg-red-500/10 border-red-500/30'}
              ${position === idx ? 'bg-[#bef264]/40 border-[#bef264] scale-105 shadow-[0_0_15px_rgba(190,242,100,0.5)]' : ''}
            `}
          >
            {position === idx && (
              avatar.startsWith('http') 
                ? <img src={avatar} alt="player" className="w-3/4 h-3/4 object-contain drop-shadow-lg pointer-events-none" />
                : <span className="text-3xl pointer-events-none">{avatar}</span>
            )}
            {idx === 15 && position !== 15 && (
              target.startsWith('http') 
                ? <img src={target} alt="target" className="w-3/4 h-3/4 object-contain drop-shadow-lg pointer-events-none opacity-50" />
                : <span className="text-3xl pointer-events-none opacity-50">{target}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Maze6GameModule: GameModule = {
  id: "maze-rules-6",
  title: "Labirintos com Regras",
  categoryId: "labirinto-6",
  supportedAges: ["6-7"],
  generateChallenge: generateMaze6Challenge,
  component: Maze6Component
};
