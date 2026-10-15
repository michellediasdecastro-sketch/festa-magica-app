import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateMazeChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const uniqueImages = Array.from(new Set(context.gameImages));
  const avatar = uniqueImages.length > 0 ? uniqueImages[0] : "⭐";
  const target = uniqueImages.length > 1 ? uniqueImages[1] : "🎈";

  // Gera um labirinto simples (1=Caminho Seguro, 0=Obstáculo)
  // O caminho é sempre: Topo-Esquerda -> Meio -> Fundo-Direita
  const layouts = [
    [1, 1, 0,  0, 1, 0,  0, 1, 1],
    [1, 0, 0,  1, 1, 1,  0, 0, 1],
    [1, 1, 1,  0, 0, 1,  0, 0, 1]
  ];
  const grid = layouts[Math.floor(Math.random() * layouts.length)];

  return {
    id: `maze-${Date.now()}`,
    instruction: "Siga as luzes verdes para atravessar!",
    spokenText: "Clique nos blocos verdes iluminados para chegar ao outro lado sem cair na lava!",
    data: { grid, avatar, target }
  };
};

const MazeComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { grid, avatar, target } = challenge.data;
  const [position, setPosition] = useState(0);

  useEffect(() => { setPosition(0); }, [challenge.id]);

  const handleMove = (index: number) => {
    // Só deixa clicar num espaço adjacente (cima, baixo, esq, dir)
    const validMoves = [position - 1, position + 1, position - 3, position + 3];
    if (!validMoves.includes(index)) return; // Ignora se clicar longe

    if (grid[index] === 0) {
      onAnswer(false, 0); // Bateu no obstáculo
    } else {
      setPosition(index);
      if (index === 8) {
        setTimeout(() => onAnswer(true, 20), 300); // Chegou ao fim!
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-4 bg-black/40 rounded-3xl border border-white/20">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full aspect-square">
        {grid.map((cellType: number, idx: number) => (
          <button
            key={idx}
            onClick={() => handleMove(idx)}
            className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-300 border-2 shadow-inner
              ${cellType === 1 ? 'bg-green-500/20 border-green-500/50 hover:bg-green-500/40' : 'bg-red-500/10 border-red-500/30'}
              ${position === idx ? 'bg-[#bef264]/40 border-[#bef264] scale-105 shadow-[0_0_20px_rgba(190,242,100,0.5)]' : ''}
            `}
          >
            {position === idx && (
              avatar.startsWith('http') 
                ? <img src={avatar} alt="player" className="w-2/3 h-2/3 object-contain drop-shadow-lg pointer-events-none animate-bounce-slight" />
                : <span className="text-4xl pointer-events-none animate-bounce-slight">{avatar}</span>
            )}
            {idx === 8 && position !== 8 && (
              target.startsWith('http') 
                ? <img src={target} alt="target" className="w-2/3 h-2/3 object-contain drop-shadow-lg pointer-events-none opacity-50" />
                : <span className="text-4xl pointer-events-none opacity-50">{target}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const MazeGameModule: GameModule = {
  id: "maze-path",
  title: "Labirintos Encantados",
  categoryId: "labirinto",
  supportedAges: ["4-5", "6-7", "8-9", "10-11"],
  generateChallenge: generateMazeChallenge,
  component: MazeComponent
};
