import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Gerador de Trajetos Fáceis para 4-5 Anos (Centenas de combinações únicas sem labirintos confusos)
const generateEasyMazeGrid = (size: number, maxBranches: number) => {
  // 1 = parede (grama encantada), 0 = estrada
  const grid = Array.from({ length: size }, () => Array(size).fill(1));

  let x = 1;
  let y = 0;
  grid[y][x] = 0; // Entrada no topo esquerdo

  const mainPath: [number, number][] = [[x, y]];
  y = 1;
  grid[y][x] = 0;
  mainPath.push([x, y]);

  const targetX = size - 2;
  const targetY = size - 2;

  // Constrói uma estrada sinuosa mas que sempre avança em direção ao fim (Direita ou Baixo)
  while (x < targetX || y < targetY) {
    const possibleMoves: [number, number][] = [];

    if (x < targetX) possibleMoves.push([x + 1, y]);
    if (y < targetY) possibleMoves.push([x, y + 1]);

    // Escolhe aleatoriamente ir para a direita ou para baixo para variar o desenho da pista
    const [nx, ny] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    x = nx;
    y = ny;
    grid[y][x] = 0;
    mainPath.push([x, y]);
  }

  // Saída na base direita
  grid[size - 1][targetX] = 0;

  // Adiciona apenas 1 ou 2 bifurcações bem curtinhas (1 passo) para não frustrar a criança
  let branchesAdded = 0;
  const shuffledPath = [...mainPath].slice(1, -1).sort(() => Math.random() - 0.5);

  for (const [px, py] of shuffledPath
