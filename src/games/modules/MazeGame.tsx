import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Gerador especial para 4-5 anos: cria uma estrada clara com curvas suaves e quase sem bifurcações
const generateEasyGrid = (size: number) => {
  const grid = Array.from({ length: size }, () => Array(size).fill(1));
  let x = 1;
  let y = 0;
  grid[y][x] = 0; // Ponto de partida

  y = 1;
  grid[y][x] = 0;

  const targetX = size - 2;
  const targetY = size - 2;

  // Escava o caminho principal sempre avançando para a direita ou para baixo
  while (x < targetX || y < targetY) {
    const canRight = x < targetX;
    const canDown = y < targetY;

    if (canRight && canDown) {
      if (Math.random() < 0.5) x++;
      else y++;
    } else if (canRight) {
      x++;
    } else if (canDown) {
      y++;
    }
    grid[y][x] = 0;
  }

  // Abre a saída na parte inferior
  grid[size - 1][targetX] = 0;

  // Adiciona apenas 1 ou 2 pequenas bifurcações rasas (1 casa) para dar um toque de desafio sem frustrar
  let branches = 0;
  for (let r = 1; r < size - 2; r++) {
    for (let c = 1; c < size - 2; c++) {
      if (grid[r][c] === 0 && branches < 2 && Math.random() < 0.25) {
        const dirs = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ];
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr > 0 &&
            nr < size - 1 &&
            nc > 0 &&
            nc < size - 1 &&
            grid[nr][nc] === 1
          ) {
            // Garante que é só um "bolso" pequeno e não liga com outra estrada
            const neighborsOpen = [
              grid[nr - 1]?.[nc] === 0,
              grid[nr + 1]?.[nc] === 0,
              grid[nr]?.[nc - 1] === 0,
              grid[nr]?.[nc + 1] === 0,
