import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Gerador de Estradas Suaves para 4-5 anos (Poucas bifurcações e caminhos largos)
const generateEasyRoadGrid = (size: number) => {
  const grid = Array.from({ length: size }, () => Array(size).fill(1));
  
  let x = 1;
  let y = 0;
  grid[y][x] = 0; // Ponto de entrada no topo
  
  y = 1;
  grid[y][x] = 0;

  const mainPath: [number, number][] = [[1, 0], [1, 1]];

  // Constrói o caminho principal sempre progredindo para a direita ou para baixo
  while (x < size - 2 || y < size - 2) {
    const possibleMoves: [number, number][] = [];
    if (x < size - 2) possibleMoves.push([2, 0]);
    if (y < size - 2) possibleMoves.push([0, 2]);

    const [dx, dy] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    // Abre o bloco intermediário e o bloco de destino
    grid[y + dy / 2][x + dx / 2] = 0;
    grid[y + dy][x + dx] = 0;

    mainPath.push([x + dx / 2, y + dy / 2]);
    mainPath.push([x + dx, y + dy]);

    x += dx;
    y += dy;
  }

  // Abre a saída na parte inferior direita
  grid[size - 1][size - 2] = 0;
  mainPath.push([size - 2, size - 1]);

  // Adiciona apenas 1 ou 2 bifurcações bem curtas (1 passo) para não confundir crianças de 4-5 anos
  const maxBranches = size <= 7 ? 1 : 2;
  let branchesAdded = 0;
  const candidateNodes = mainPath.filter(([px, py]) => px % 2 === 1 && py % 2 === 1);
  const shuffledNodes = [...candidateNodes].sort(() => Math.random() - 0.5);

  for (const [cx, cy] of shuffledNodes) {
    if (branchesAdded >= maxBranches) break;
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
        grid[cy + dy / 2][cx + dx / 2] = 0;
        grid[ny][nx] = 0;
        branchesAdded++;
        break;
      }
    }
  }

  return grid;
};

const generateMaze4Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages && context.gameImages.length > 0 ? context.gameImages : ["🐶", "🦴"];
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  const avatar = shuffled[0];
  const target = shuffled.length > 1 ? shuffled[1] : "⭐";

  // Conta rodadas para subir suavemente de 7x7 para 9x9
  const roundsPlayed = history.filter(h => h.includes("maze-easy-4")).length;
  const size = roundsPlayed >= 6 ? 9 : 7;

  const grid = generateEasyRoadGrid(size);

  return {
    id: `maze-easy-4-${size}-${Date.now()}-${Math.random()}`,
    instruction: "Leve até ao destino!",
    spokenText: "Aperte as setinhas para andar pela estrada até chegar ao final!",
    data: { grid, cols: size, rows: size, avatar, target }
  };
};

const Maze4Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
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
      if (e.key === "ArrowRight
