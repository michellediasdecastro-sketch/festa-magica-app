import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Motor DFS de Geração de Labirintos
const generateGrid = (cols: number, rows: number) => {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  const stack = [[1, 1]];
  grid[1][1] = 0;

  while (stack.length > 0) {
    const [x, y] = stack[stack.length - 1];
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);

    let carved = false;
    for (let [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
        grid[y + dy / 2][x + dx / 2] = 0;
        grid[ny][nx] = 0;
        stack.push([nx, ny]);
        carved = true;
        break;
      }
    }
    if (!carved) stack.pop();
  }
  grid[0][1] = 0; 
  grid[rows - 1][cols - 2] = 0; 
  return grid;
};

const generateMaze8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎", "⭐"];
  const avatar = source[0];
  const target = source.length > 1 ? source[1] : "🎈";

  // Dificuldade dinâmica: cresce de 13x13 até um impressionante 21x21 para 8-9 anos
  const size = Math.min(21, 13 + Math.floor(difficulty) * 2); 
  const cols = size;
  const rows = size;
  
  const grid = generateGrid(cols, rows);

  return {
    id: `maze-drive-8-${size}-${Date.now()}`,
    instruction: "Rotas Estratégicas!",
    spokenText: "Neste labirinto gigante, planear o percurso é essencial. Use as setas para encontrar a saída correta.",
    data: { grid, cols, rows, avatar, target }
  };
};

const Maze8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { grid, cols, rows, avatar, target } = challenge.data;
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 0 });
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setPlayerPos({ x: 1, y: 0 });
    setFinished(false);
  }, [challenge.id]);

  const move = useCallback((dx: number, dy: number) => {
    if (finished) return;
    setPlayerPos(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 0) {
        if (nx === cols - 2 && ny === rows - 1) {
          setFinished(true);
          setTimeout(() => onAnswer(true, 50), 300);
        }
        return { x: nx, y: ny };
      }
      return prev;
    });
  }, [cols, rows, grid, finished, onAnswer]);

  // Suporte a teclado para quem jogar no computador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      
      {/* Grelha do Labirinto */}
      <div 
        className="grid bg-[#5e3023] rounded-xl overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] p-1 border-4 border-black/80 w-full aspect-square"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((cell: number, idx: number) => {
          const x = idx % cols;
          const y = Math.floor(idx / cols);
          const isPlayer = playerPos.x === x && playerPos.y === y;
          const isTarget = x === cols - 2 && y === rows - 1;
          const isRoad = cell === 0;

          return (
            <div
              key={idx}
              className={`relative flex items-center justify-center transition-all duration-75
                ${isRoad ? 'bg-[#9d8189]' : 'bg-[#5e3023]'}
                ${isPlayer ? 'z-10 scale-125' : ''}
              `}
            >
              {isTarget && (
                <div className="w-full h-full bg-[#bef264]/80 flex items-center justify-center animate-pulse rounded-sm">
                  {target.startsWith('http') ? <img src={target} alt="fim" className="w-[85%] h-[85%] object-contain drop-shadow-md" /> : <span className="text-xl sm:text-2xl">{target}</span>}
                </div>
              )}
              
              {isPlayer && (
                avatar.startsWith('http') 
                  ? <img src={avatar} alt="player" className="w-[120%] h-[120%] object-contain drop-shadow-xl z-20" />
                  : <span className="text-2xl sm:text-3xl drop-shadow-md z-20">{avatar}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Controles D-Pad Direcionais (Visual inspirado na imagem) */}
      <div className="flex flex-col items-center gap-2 bg-[#892b64]/30 p-4 rounded-3xl border border-white/20 shadow-xl mt-1 w-fit">
        <button onClick={() => move(0, -1)} className="w-14 h-14 sm:w-16 sm:h-16 bg-[#892b64] hover:bg-[#6c224f] active:bg-[#bef264] active:text-black text-white rounded-2xl flex items-center justify-center shadow-md transition-colors active:scale-90 border border-white/20">
          <ArrowUp size={36} strokeWidth={3} />
        </button>
        <div className="flex gap-2">
          <button onClick={() => move(-1, 0)} className="w-14 h-14 sm:w-16 sm:h-16 bg-[#892b64] hover:bg-[#6c224f] active:bg-[#bef264] active:text-black text-white rounded-2xl flex items-center justify-center shadow-md transition-colors active:scale-90 border border-white/20">
            <ArrowLeft size={36} strokeWidth={3} />
          </button>
          <button onClick={() => move(0, 1)} className="w-14 h-14 sm:w-16 sm:h-16 bg-[#892b64] hover:bg-[#6c224f] active:bg-[#bef264] active:text-black text-white rounded-2xl flex items-center justify-center shadow-md transition-colors active:scale-90 border border-white/20">
            <ArrowDown size={36} strokeWidth={3} />
          </button>
          <button onClick={() => move(1, 0)} className="w-14 h-14 sm:w-16 sm:h-16 bg-[#892b64] hover:bg-[#6c224f] active:bg-[#bef264] active:text-black text-white rounded-2xl flex items-center justify-center shadow-md transition-colors active:scale-90 border border-white/20">
            <ArrowRight size={36} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Maze8GameModule: GameModule = {
  id: "maze-drive-8",
  title: "Labirintos Estratégicos",
  categoryId: "labirinto-8",
  supportedAges: ["8-9"],
  generateChallenge: generateMaze8Challenge,
  component: Maze8Component
};
