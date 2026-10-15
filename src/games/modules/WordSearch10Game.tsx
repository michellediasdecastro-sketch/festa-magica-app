import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const WORDS = ["FESTA", "BOLO", "MAGIA", "AMIGO", "DOCE", "MAPA", "HEROI", "CHAVE"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const generateWordSearchChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  const size = 8;
  const grid = Array(size * size).fill("");
  
  // Decide se é horizontal ou vertical
  const isHorizontal = Math.random() > 0.5;
  const wordLength = targetWord.length;
  
  let startX = 0, startY = 0;
  
  if (isHorizontal) {
    startX = Math.floor(Math.random() * (size - wordLength + 1));
    startY = Math.floor(Math.random() * size);
    for (let i = 0; i < wordLength; i++) {
      grid[startY * size + (startX + i)] = targetWord[i];
    }
  } else {
    startX = Math.floor(Math.random() * size);
    startY = Math.floor(Math.random() * (size - wordLength + 1));
    for (let i = 0; i < wordLength; i++) {
      grid[(startY + i) * size + startX] = targetWord[i];
    }
  }

  // Preenche o resto com letras aleatórias
  const targetCells: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === "") {
      grid[i] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    } else {
      targetCells.push(i);
    }
  }

  return {
    id: `wordsearch10-${Date.now()}-${targetWord}`,
    instruction: "Encontre a Palavra Oculta!",
    spokenText: `O detetive precisa da sua ajuda. Procure a palavra ${targetWord} na grelha e toque nas letras.`,
    data: { grid, size, targetWord, targetCells }
  };
};

const WordSearch10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { grid, size, targetWord, targetCells } = challenge.data;
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [challenge.id]);

  const toggleCell = (index: number) => {
    let newSelected = [...selected];
    if (newSelected.includes(index)) {
      newSelected = newSelected.filter(i => i !== index);
    } else {
      newSelected.push(index);
    }
    setSelected(newSelected);

    // Verifica se selecionou exatamente as células corretas
    if (newSelected.length === targetCells.length) {
      const isCorrect = targetCells.every(val => newSelected.includes(val));
      if (isCorrect) {
        setTimeout(() => onAnswer(true, 50), 300);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="bg-black/60 px-6 py-3 rounded-2xl border border-white/20 shadow-md">
        <span className="text-white/60 font-bold uppercase text-xs">Procure por:</span>
        <div className="text-3xl font-black text-[#bef264] tracking-widest">{targetWord}</div>
      </div>

      <div 
        className="grid gap-1 bg-black/40 p-3 rounded-2xl border border-white/20 w-full shadow-inner"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((char: string, idx: number) => {
          const isSelected = selected.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => toggleCell(idx)}
              className={`aspect-square flex items-center justify-center text-xl sm:text-2xl font-black rounded-lg transition-all active:scale-90
                ${isSelected ? 'bg-[#bef264] text-black shadow-[0_0_10px_#bef264]' : 'bg-white/10 text-white hover:bg-white/20'}
              `}
            >
              {char}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const WordSearch10GameModule: GameModule = {
  id: "word-search-10",
  title: "Interpretação e Enigmas",
  categoryId: "interpretacao-10",
  supportedAges: ["10-11"],
  generateChallenge: generateWordSearchChallenge,
  component: WordSearch10Component
};
