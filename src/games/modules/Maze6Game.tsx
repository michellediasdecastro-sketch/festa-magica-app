import React, { useState, useEffect, useRef } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Algoritmo clássico de geração de labirintos perfeitos (Depth-First Search)
const generatePerfectMaze = (size: number) => {
  const cells = Array.from({ length: size * size }, () => ({ t: 1, r: 1, b: 1, l: 1, v: 0 }));
  const stack = [0];
  cells[0].v = 1;

  while (stack.length > 0) {
    const curr = stack[stack.length - 1];
    const x = curr % size;
    const y = Math.floor(curr / size);
    const neighbors = [];

    if (y > 0 && cells[curr - size].v === 0) neighbors.push({ idx: curr - size, wall: 't', opp: 'b' });
    if (x < size - 1 && cells[curr + 1].v === 0) neighbors.push({ idx: curr + 1, wall: 'r', opp: 'l' });
    if (y < size - 1 && cells[curr + size].v === 0) neighbors.push({ idx: curr + size, wall: 'b', opp: 't' });
    if (x > 0 && cells[curr - 1].v === 0) neighbors.push({ idx: curr - 1, wall: 'l', opp: 'r' });

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      cells[curr][next.wall as keyof typeof cells[0]] = 0;
      cells[next.idx][next.opp as keyof typeof cells[0]] = 0;
      cells[next.idx].v = 1;
      stack.push(next.idx);
    } else {
      stack.pop();
    }
  }
  return cells;
};

const generateMaze6Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎", "⭐"];
  const avatar = source[0];
  const target = source.length > 1 ? source[1] : "🎈";

  const size = 6; // Labirinto 6x6 para 6-7 anos
  const grid = generatePerfectMaze(size);

  return {
    id: `maze-real-6-${Date.now()}-${Math.random()}`,
    instruction: "Trace o caminho para escapar!",
    spokenText: "Arraste o dedo ou o rato para desenhar o caminho até à saída.",
    data: { grid, size, avatar, target }
  };
};

const Maze6Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { grid, size, avatar, target } = challenge.data;
  const [path, setPath] = useState<number[]>([0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPath([0]);
    setIsDrawing(false);
  }, [challenge.id]);

  const processMove = (index: number) => {
    setPath((prevPath) => {
      const current = prevPath[prevPath.length - 1];
      if (index === current) return prevPath; // Não moveu

      // Permite apagar o caminho voltando para a célula anterior
      if (prevPath.length > 1 && index === prevPath[prevPath.length - 2]) {
        return prevPath.slice(0, -1);
      }

      // Verifica se o movimento é válido (adjacente e sem parede)
      const diff = index - current;
      let valid = false;

      if (diff === -size && grid[current].t === 0) valid = true; // Cima
      if (diff === 1 && grid[current].r === 0 && (current % size) !== size - 1) valid = true; // Direita
      if (diff === size && grid[current].b === 0) valid = true; // Baixo
      if (diff === -1 && grid[current].l === 0 && (current % size) !== 0) valid = true; // Esquerda

      if (valid && !prevPath.includes(index)) {
        const newPath = [...prevPath, index];
        if (index === size * size - 1) {
          setIsDrawing(false);
          setTimeout(() => onAnswer(true, 25), 300); // Chegou ao fim
        }
        return newPath;
      }
      return prevPath;
    });
  };

  const handlePointerDown = (index: number) => {
    if (index === path[path.length - 1]) setIsDrawing(true);
  };

  const handlePointerUp = () => setIsDrawing(false);

  const handlePointerEnter = (index: number) => {
    if (isDrawing) processMove(index);
  };

  // Suporte tátil (arrastar o dedo no telemóvel)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) {
      const idx = el.getAttribute("data-index");
      if (idx !== null) processMove(Number(idx));
    }
  };

  return (
    <div 
      className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto p-4 bg-black/40 rounded-3xl border border-white/20 touch-none select-none"
      style={{ touchAction: 'none' }} // Impede o ecrã de deslizar ao desenhar
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchEnd={handlePointerUp}
      onTouchMove={handleTouchMove}
    >
      <div 
        ref={containerRef}
        className="grid w-full aspect-square bg-[#1a1a1a] rounded-xl overflow-hidden shadow-inner p-1 border-4 border-black/80"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((cell: any, idx: number) => {
          const inPath = path.includes(idx);
          const isCurrent = path[path.length - 1] === idx;
          const isStart = idx === 0;
          const isEnd = idx === size * size - 1;

          return (
            <div
              key={idx}
              data-index={idx}
              onPointerDown={() => handlePointerDown(idx)}
              onPointerEnter={() => handlePointerEnter(idx)}
              className="relative w-full h-full flex items-center justify-center transition-colors duration-150"
              style={{
                borderTop: cell.t ? '2px solid #bef264' : '2px solid transparent',
                borderRight: cell.r ? '2px solid #bef264' : '2px solid transparent',
                borderBottom: cell.b ? '2px solid #bef264' : '2px solid transparent',
                borderLeft: cell.l ? '2px solid #bef264' : '2px solid transparent',
                backgroundColor: inPath ? 'rgba(190, 242, 100, 0.2)' : 'transparent',
              }}
            >
              {/* Rasto do caminho percorrido */}
              {inPath && !isStart && !isEnd && (
                <div className="w-3 h-3 bg-[#bef264] rounded-full shadow-[0_0_8px_#bef264]" />
              )}

              {isStart && (
                avatar.startsWith('http') 
                  ? <img src={avatar} alt="start" className="w-[85%] h-[85%] object-contain drop-shadow-md pointer-events-none z-10" />
                  : <span className="text-2xl pointer-events-none z-10">{avatar}</span>
              )}

              {isEnd && (
                target.startsWith('http') 
                  ? <img src={target} alt="end" className="w-[85%] h-[85%] object-contain drop-shadow-md pointer-events-none opacity-80" />
                  : <span className="text-2xl pointer-events-none opacity-80">{target}</span>
              )}
              
              {/* Efeito de pulso onde está o dedo/rato */}
              {isCurrent && !isEnd && (
                <div className="absolute inset-0 bg-[#bef264]/40 animate-pulse rounded-sm pointer-events-none" />
              )}
            </div>
          );
        })}
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
