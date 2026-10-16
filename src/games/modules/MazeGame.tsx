import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Gerador especial para 4-5 anos: Caminho principal claro com pouquíssimas bifurcações
const generateEasyGrid = (cols: number, rows: number) => {
  // 1 = parede (grama), 0 = estrada
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  
  let x = 1;
  let y = 1;
  grid[0][1] = 0; // Entrada no topo
  grid[1][1] = 0;

  const mainPath: [number, number][] = [[1, 1]];

  // Constrói a estrada principal sempre avançando para a direita ou para baixo (sem enrolar)
  while (x < cols - 2 || y < rows - 2) {
    const possibleMoves: [number, number][] = [];
    if (x < cols - 2) possibleMoves.push([2, 0]); // Passo duplo para a direita
    if (y < rows - 2) possibleMoves.push([0, 2]); // Passo duplo para baixo

    // Escolhe aleatoriamente ir para baixo ou para a direita
    const [dx, dy] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    grid[y + dy / 2][x + dx / 2] = 0; // Abre o meio do caminho
    grid[y + dy][x + dx] = 0;         // Abre o destino do passo
    
    x += dx;
    y += dy;
    mainPath.push([x, y]);
  }

  // Abre a saída no final
  grid[rows - 1][cols - 2] = 0;

  // Adiciona apenas 1 ou 2 bifurcações bem curtinhas para a criança perceber que pode escolher o lado
  let branchesAdded = 0;
  const maxBranches = Math.floor(Math.random() * 2) + 1; // 1 ou 2 desvios curtos
  const shuffledPath = [...mainPath].sort(() => Math.random() - 0.5);

  for (const [px, py] of shuffledPath) {
    if (branchesAdded >= maxBranches) break;
    
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = px + dx;
      const ny = py + dy;
      // Se o espaço ao lado estiver fechado (for grama), abre um beco sem saída de apenas 1 passo
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
        grid[py + dy / 2][px + dx / 2] = 0;
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
  const avatar = source[0];
  const target = source.length > 1 ? source[1] : "⭐";

  // Tamanho 7x7 fixo para 4-5 anos: blocos bem grandes, visíveis e fáceis de controlar
  const size = 7; 
  const grid = generateEasyGrid(size, size);

  return {
    id: `maze-easy-4-${Date.now()}-${Math.random()}`,
    instruction: "Leve até o final!",
    spokenText: "Aperte nas setinhas para andar pela estrada e chegar até a estrela!",
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
      // Verifica se está dentro do mapa e se é estrada (0)
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 0) {
        // Chegou na saída!
        if (nx === cols - 2 && ny === rows - 1) {
          setFinished(true);
          setTimeout(() => onAnswer(true, 30), 300);
        }
        return { x: nx, y: ny };
      }
      return prev;
    });
  }, [cols, rows, grid, finished, onAnswer]);

  // Suporte às setas do teclado caso teste no computador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1
