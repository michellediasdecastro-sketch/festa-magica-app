import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const GRID_SIZE = 6;
const TARGET_SCORE = 100; // Pontos para ganhar o desafio

const generateMatch3Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const images = context.gameImages.length >= 4 ? context.gameImages : ["🍎", "⭐", "🎈", "🚗", "🐱", "🐶"];
  const selectedImages = images.slice(0, 5); // Usa até 5 imagens diferentes do tema

  return {
    id: `match3-${Date.now()}`,
    instruction: "Junte 3 imagens iguais para marcar pontos!",
    spokenText: "Troque as figuras de lugar para formar linhas de três ou mais e marcar pontos!",
    data: { images: selectedImages }
  };
};

const createEmptyGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(""));

const Match3Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { images } = challenge.data;
  const [grid, setGrid] = useState<string[][]>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Preenche o tabuleiro inicialmente
  useEffect(() => {
    let newGrid = createEmptyGrid();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        let randomImg;
        // Evita matches iniciais
        do {
          randomImg = images[Math.floor(Math.random() * images.length)];
        } while (
          (c >= 2 && newGrid[r][c-1] === randomImg && newGrid[r][c-2] === randomImg) ||
          (r >= 2 && newGrid[r-1][c] === randomImg && newGrid[r-2][c] === randomImg)
        );
        newGrid[r][c] = randomImg;
      }
    }
    setGrid(newGrid);
    setScore(0);
  }, [challenge.id, images]);

  const checkMatches = (currentGrid: string[][]) => {
    let matches = new Set<string>();
    
    // Check horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        if (currentGrid[r][c] && currentGrid[r][c] === currentGrid[r][c+1] && currentGrid[r][c] === currentGrid[r][c+2]) {
          matches.add(`${r},${c}`); matches.add(`${r},${c+1}`); matches.add(`${r},${c+2}`);
        }
      }
    }
    // Check vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        if (currentGrid[r][c] && currentGrid[r][c] === currentGrid[r+1][c] && currentGrid[r][c] === currentGrid[r+2][c]) {
          matches.add(`${r},${c}`); matches.add(`${r+1},${c}`); matches.add(`${r+2},${c}`);
        }
      }
    }
    return matches;
  };

  const processGrid = async (currentGrid: string[][], currentScore: number) => {
    let matches = checkMatches(currentGrid);
    if (matches.size === 0) {
      setIsProcessing(false);
      return false; // Sem matches
    }

    let nextScore = currentScore + (matches.size * 10);
    setScore(nextScore);

    // Remove matches
    let newGrid = currentGrid.map(row => [...row]);
    matches.forEach(m => {
      const [r, c] = m.split(',').map(Number);
      newGrid[r][c] = "";
    });
    setGrid([...newGrid]);

    await new Promise(resolve => setTimeout(resolve, 300)); // Animação de explosão

    // Faz as peças caírem
    for (let c = 0; c < GRID_SIZE; c++) {
      let col = [];
      for (let r = 0; r < GRID_SIZE; r++) if (newGrid[r][c] !== "") col.push(newGrid[r][c]);
      while (col.length < GRID_SIZE) col.unshift(images[Math.floor(Math.random() * images.length)]); // Preenche o topo
      for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = col[r];
    }
    setGrid([...newGrid]);

    if (nextScore >= TARGET_SCORE) {
      setTimeout(() => onAnswer(true, 50), 500);
      return true;
    }

    // Verifica se houve novos matches ao cair (Cascata)
    setTimeout(() => processGrid(newGrid, nextScore), 300);
    return true;
  };

  const handleCellClick = async (r: number, c: number) => {
    if (isProcessing) return;

    if (!selectedCell) {
      setSelectedCell({r, c});
      return;
    }

    const { r: r1, c: c1 } = selectedCell;
    const isAdjacent = (Math.abs(r1 - r) === 1 && c1 === c) || (Math.abs(c1 - c) === 1 && r1 === r);

    if (isAdjacent) {
      setIsProcessing(true);
      setSelectedCell(null);
      
      // Swap
      let newGrid = grid.map(row => [...row]);
      const temp = newGrid[r1][c1];
      newGrid[r1][c1] = newGrid[r][c];
      newGrid[r][c] = temp;
      setGrid(newGrid);

      const hasMatches = checkMatches(newGrid).size > 0;
      
      if (hasMatches) {
        await processGrid(newGrid, score);
      } else {
        // Swap back se não formar match
        setTimeout(() => {
          newGrid[r][c] = newGrid[r1][c1];
          newGrid[r1][c1] = temp;
          setGrid([...newGrid]);
          setIsProcessing(false);
        }, 400);
      }
    } else {
      setSelectedCell({r, c}); // Seleciona a nova se não for adjacente
    }
  };

  const renderIcon = (content: string) => {
    if (!content) return null;
    if (content.startsWith('http')) return <img src={content} alt="icon" className="w-4/5 h-4/5 object-contain drop-shadow-md pointer-events-none" />;
    return <span className="text-3xl pointer-events-none">{content}</span>;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      
      {/* Barra de Progresso */}
      <div className="w-full max-w-sm h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
         <div className="h-full bg-gradient-to-r from-blue-400 to-[#bef264] transition-all duration-300" style={{ width: `${Math.min(100, (score / TARGET_SCORE) * 100)}%` }} />
      </div>

      {/* Tabuleiro */}
      <div className="bg-black/40 p-2 rounded-2xl border border-white/20 shadow-xl touch-none">
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) => row.map((cell, c) => {
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200
                  ${isSelected ? 'bg-white/30 scale-110 shadow-[0_0_15px_#bef264] z-10 border-2 border-[#bef264]' : 'bg-white/5 hover:bg-white/10'}
                  ${cell === "" ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
                `}
              >
                {renderIcon(cell)}
              </div>
            );
          }))}
        </div>
      </div>

    </div>
  );
};

export const Match3GameModule: GameModule = {
  id: "match3-10",
  title: "Puzzle da Festa",
  categoryId: "raciocinio-10",
  supportedAges: ["10-11"],
  generateChallenge: generateMatch3Challenge,
  component: Match3Component
};
