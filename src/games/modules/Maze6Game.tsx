import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

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
  grid[0][1] = 0; // Início
  grid[rows - 1][cols - 2] = 0; // Fim
  return grid;
};

const generateMaze6Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎", "⭐"];
  const avatar = source[0];
  const target = source.length > 1 ? source[1] : "🎈";

  // Dificuldade dinâmica: cresce de 9x9 até 13x13
  const size = Math.min(13, 9 + Math.floor(difficulty) * 2); 
  const cols = size;
  const rows = size;
  
  const grid = generateGrid(cols, rows);

  return {
    id: `maze-drive-6-${size}-${Date.now()}`,
    instruction: "Encontre a Saída!",
    spokenText: "Use as setas para conduzir até ao destino. Cuidado com os becos sem saída, se errar, volte para trás!",
    data: { grid, cols, rows, avatar, target }
  };
};

const Maze6Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
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
          setTimeout(() => onAnswer(true, 40), 300);
        }
        return { x: nx, y: ny };
      }
      return prev;
    });
  }, [cols, rows, grid, finished, onAnswer]);

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
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      
      {/* Grelha do Labirinto */}
      <div 
        className="grid bg-[#386641] rounded-xl overflow-hidden shadow-inner p-1 sm:p-2 border-4 border-black/80 w-full aspect-square"
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
              className={`relative flex items-center justify-center transition-all duration-100
                ${isRoad ? 'bg-[#adb5bd]' : 'bg-[#386641]'}
                ${isPlayer ? 'z-10 scale-125' : ''}
              `}
            >
              {/* Linha tracejada para simular estrada */}
              {isRoad && !isTarget && !isPlayer && y > 0 && y < rows - 1 && (
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/40 rounded-full" />
              )}
              
              {isTarget && (
                <div className="w-full h-full bg-[#ffc300]/80 flex items-center justify-center animate-pulse rounded-sm">
                  {target.startsWith('http') ? <img src={target} alt="fim" className="w-3/4 h-3/4 object-contain drop-shadow-md" /> : <span className="text-xl sm:text-2xl">{target}</span>}
                </div>
              )}
              
              {isPlayer && (
                avatar.startsWith('http') 
                  ? <img src={avatar} alt="player" className="w-full h-full object-contain drop-shadow-xl z-20" />
                  : <span className="text-2xl sm:text-3xl drop-shadow-md z-20">{avatar}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Controles D-Pad Direcionais */}
      <div className="flex flex-col items-center gap-2 bg-[#2a9d8f]/30 p-4 rounded-3xl border border-white/20 shadow-xl mt-2 w-fit">
        <button onClick={() => move(0, -1)} className="w-16 h-16 bg-[#2a9d8f] hover:bg-[#21867a] active:bg-[#bef264] active:text-black text-white rounded-2xl flex items-center justify-center shadow-md transition-colors active:scale-90 border border-white/20">
          <ArrowUp size={36} strokeWidth={3} />
        </button>
        <div className="flex gap-2">
          <button onClick={() => move(-1, 0)} className="w-16 h-16 bg-[#2a9d8f] hover:bg-[#21867a] active:bg-[#bef264] active:text-black text-white rounded-2xl flex items-center justify-center shadow-md transition-colors active:scale-90 border border-white/20">
            <ArrowLeft size={36} strokeWidth={3} />
          </button>
          <button onClick={() => move(0, 1)} className="w-16 h-16 bg-[#2a9d8f] hover:bg-[#21867a] active:bg-[#bef264] active:text-black text-white rounded-2xl flex items-center justify-center shadow-md transition-colors active:scale-90 border border-white/20">
            <ArrowDown size={36} strokeWidth={3} />
          </button>
          <button onClick={() => move(1, 0)} className="w-16 h-16 bg-[#2a9d8f] hover:bg-[#21867a] active:bg-[#bef264] active:text-black text-white rounded-2xl flex items-center justify-center shadow-md transition-colors active:scale-90 border border-white/20">
            <ArrowRight size={36} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Maze6GameModule: GameModule = {
  id: "maze-drive-6",
  title: "Labirintos Interativos",
  categoryId: "labirinto-6",
  supportedAges: ["6-7"],
  generateChallenge: generateMaze6Challenge,
  component: Maze6Component
};
