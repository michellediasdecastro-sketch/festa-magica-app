import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateRoutes10Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const size = 5;
  const grid = Array(size * size).fill(0); // 0 = vazio, 1 = obstáculo
  
  const start = 0; // Canto superior esquerdo
  const end = 24;  // Canto inferior direito

  // Adiciona 6 obstáculos aleatórios que não bloqueiam as extremidades
  let obstaclesAdded = 0;
  while (obstaclesAdded < 6) {
    const idx = Math.floor(Math.random() * 25);
    if (idx !== start && idx !== end && idx !== 1 && idx !== 5 && idx !== 23 && idx !== 19 && grid[idx] === 0) {
      grid[idx] = 1;
      obstaclesAdded++;
    }
  }

  return {
    id: `routes10-grid-${Date.now()}`,
    instruction: "Trace a Rota Segura!",
    spokenText: "Arraste o dedo para criar um caminho seguro até ao destino, desviando das zonas de perigo.",
    data: { grid, size, start, end }
  };
};

const Routes10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { grid, size, start, end } = challenge.data;
  const [path, setPath] = useState<number[]>([start]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    setPath([start]);
    setIsDrawing(false);
  }, [challenge.id]);

  const processMove = (index: number) => {
    setPath(prev => {
      const current = prev[prev.length - 1];
      if (index === current) return prev;
      
      // Permite apagar voltando atrás
      if (prev.length > 1 && index === prev[prev.length - 2]) {
        return prev.slice(0, -1);
      }

      // Valida movimento (cima, baixo, esquerda, direita) e evita obstáculos
      const diff = index - current;
      let valid = false;
      if (diff === -size) valid = true; // Cima
      if (diff === 1 && (current % size) !== size - 1) valid = true; // Direita
      if (diff === size) valid = true; // Baixo
      if (diff === -1 && (current % size) !== 0) valid = true; // Esquerda

      if (valid && grid[index] === 0 && !prev.includes(index)) {
        const newPath = [...prev, index];
        if (index === end) {
          setIsDrawing(false);
          setTimeout(() => onAnswer(true, 45), 300);
        }
        return newPath;
      }
      return prev;
    });
  };

  const handlePointerDown = (index: number) => {
    if (index === path[path.length - 1]) setIsDrawing(true);
  };
  const handlePointerUp = () => setIsDrawing(false);
  const handlePointerEnter = (index: number) => { if (isDrawing) processMove(index); };
  
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
      style={{ touchAction: 'none' }}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchEnd={handlePointerUp}
      onTouchMove={handleTouchMove}
    >
      <div 
        className="grid w-full aspect-square bg-[#1a1a1a] rounded-xl overflow-hidden shadow-inner p-1 border-4 border-black/80 gap-1"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((cell: number, idx: number) => {
          const isObstacle = cell === 1;
          const inPath = path.includes(idx);
          const isStart = idx === start;
          const isEnd = idx === end;

          return (
            <div
              key={idx}
              data-index={idx}
              onPointerDown={() => handlePointerDown(idx)}
              onPointerEnter={() => handlePointerEnter(idx)}
              className={`relative w-full h-full flex items-center justify-center rounded-lg transition-colors duration-150
                ${isObstacle ? 'bg-red-500/80 border-2 border-red-900 shadow-inner' : 'bg-white/5 border border-white/10'}
                ${inPath ? 'bg-[#bef264]/40 border-2 border-[#bef264]' : ''}
              `}
            >
              {inPath && !isStart && !isEnd && <div className="w-4 h-4 bg-[#bef264] rounded-full shadow-[0_0_10px_#bef264]" />}
              {isStart && <span className="text-2xl z-10">A</span>}
              {isEnd && <span className="text-2xl opacity-80 z-10">B</span>}
              {isObstacle && <span className="text-2xl pointer-events-none">❌</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Routes10GameModule: GameModule = {
  id: "routes-planning-10",
  title: "Planeamento de Rotas",
  categoryId: "rotas-10",
  supportedAges: ["10-11"],
  generateChallenge: generateRoutes10Challenge,
  component: Routes10Component
};
