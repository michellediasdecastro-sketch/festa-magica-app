import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Gerador procedural de caminhos simples para 4-5 anos (Tamanho 5x5)
const generateSimpleMaze = () => {
  const size = 5;
  const grid = Array.from({ length: size }, () => Array(size).fill(1));
  
  let x = 0;
  let y = 0;
  grid[y][x] = 0; // Ponto de partida (0,0)

  // Caminha passo a passo até ao canto oposto (4,4) criando uma estrada livre de becos sem saída complexos
  while (x < size - 1 || y < size - 1) {
    const options: string[] = [];
    if (x < size - 1) options.push("RIGHT");
    if (y < size - 1) options.push("DOWN");
    // Ocasionalmente permite recuar ligeiramente para dar curvas, mantendo a simplicidade
    if (x > 0 && Math.random() > 0.8) options.push("LEFT");
    if (y > 0 && Math.random() > 0.8) options.push("UP");

    const move = options[Math.floor(Math.random() * options.length)];
    if (move === "RIGHT") x++;
    else if (move === "DOWN") y++;
    else if (move === "LEFT") x--;
    else if (move === "UP") y--;

    grid[y][x] = 0;
  }

  // Garante que o canto final está sempre aberto
  grid[size - 1][size - 1] = 0;
  grid[0][0] = 0;

  return { grid, size };
};

const generateMaze4Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎", "⭐"];
  const avatar = source[0];
  const target = source.length > 1 ? source[1] : "🎈";

  const { grid, size } = generateSimpleMaze();

  return {
    id: `maze-4-dynamic-${Date.now()}-${Math.random()}`,
    instruction: "Leve o personagem até o fim!",
    spokenText: "Use as setas para guiar o seu personagem até o objetivo. Siga a estrada!",
    data: { grid, cols: size, rows: size, avatar, target }
  };
};

const MazeComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { grid, cols, rows, avatar, target } = challenge.data;
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setPlayerPos({ x: 0, y: 0 });
    setFinished(false);
  }, [challenge.id]);

  const move = useCallback((dx: number, dy: number) => {
    if (finished) return;
    setPlayerPos(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 0) {
        if (nx === cols - 1 && ny === rows - 1) {
          setFinished(true);
          setTimeout(() => onAnswer(true, 30), 300);
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
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div 
        className="grid bg-[#386641] rounded-2xl overflow-hidden shadow-inner p-2 border-4 border-black/80 w-full aspect-square"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((cell: number, idx: number) => {
          const x = idx % cols;
          const y = Math.floor(idx / cols);
          const isPlayer = playerPos.x === x && playerPos.y === y;
          const isTarget = x === cols - 1 && y === rows - 1;
          const isRoad = cell === 0;

          return (
            <div
              key={idx}
              className={`relative flex items-center justify-center transition-all duration-100 rounded-md
                ${isRoad ? 'bg-[#adb5bd]' : 'bg-[#386641]'}
                ${isPlayer ? 'z-10 scale-110' : ''}
              `}
            >
              {isTarget && (
                <div className="w-full h-full bg-[#ffc300] flex items-center justify-center animate-pulse rounded-md">
                  {target.startsWith('http') ? <img src={target} alt="fim" className="w-3/4 h-3/4 object-contain drop-shadow-md" /> : <span className="text-2xl">{target}</span>}
                </div>
              )}
              {isPlayer && (
                avatar.startsWith('http') 
                  ? <img src={avatar} alt="player" className="w-full h-full object-contain drop-shadow-xl z-20" />
                  : <span className="text-3xl drop-shadow-md z-20">{avatar}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2 bg-[#2a9d8f]/30 p-4 rounded-3xl border border-white/20 shadow-xl w-fit">
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

export const MazeGameModule: GameModule = {
  id: "maze-4",
  title: "Labirintos Encantados",
  categoryId: "labirinto-4",
  supportedAges: ["4-5"],
  generateChallenge: generateMaze4Challenge,
  component: MazeComponent
};
