import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const WORDS = ["FESTA", "BOLO", "MAGIA", "CHAVE", "MAPA", "HEROI", "LUGAR", "PEDRA"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const encryptWord = (word: string, shift: number) => {
  return word.split("").map(char => {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) return char;
    return ALPHABET[(idx + shift) % 26];
  }).join("");
};

const generateCrypto10Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎"];
  const item = source[Math.floor(Math.random() * source.length)];
  
  let targetWord = "";
  let attempts = 0;
  do {
    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    attempts++;
  } while (history.some(h => h.includes(targetWord)) && attempts < 20);

  const shift = Math.floor(Math.random() * 3) + 1; // Deslocamento de +1, +2 ou +3
  const encryptedWord = encryptWord(targetWord, shift);

  const optionsSet = new Set<string>([targetWord]);
  while (optionsSet.size < 4) {
    const wrong = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (wrong !== targetWord) optionsSet.add(wrong);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `crypto10-${Date.now()}-${targetWord}`,
    instruction: "Descodifique a Mensagem!",
    spokenText: "A palavra foi encriptada. Use a chave de deslocamento no alfabeto para descobrir a mensagem original.",
    data: { item, targetWord, encryptedWord, shift, options }
  };
};

const Crypto10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { item, encryptedWord, shift, options, targetWord } = challenge.data;
  const isImage = item.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      
      <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/20 shadow-inner w-full">
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
          {isImage ? (
             <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-md pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          ) : <span className="text-5xl">{item}</span>}
        </div>
        
        <div className="flex flex-col">
          <span className="text-[#bef264] text-xs sm:text-sm font-bold uppercase tracking-widest">
            Chave Secreta: Letra + {shift}
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-[0.3em] mt-1 break-all">
            {encryptedWord}
          </span>
        </div>
      </div>

      <div className="w-full bg-black/60 border border-white/10 p-3 rounded-xl flex flex-wrap justify-center gap-1">
        {/* Auxílio Visual do Alfabeto para a criança não se frustrar */}
        {ALPHABET.split("").map(char => (
          <span key={char} className="text-white/40 text-xs sm:text-sm font-mono w-4 text-center">{char}</span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === targetWord, 50)}
            className="py-4 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-xl sm:text-2xl font-black shadow-xl active:scale-95 text-white tracking-widest"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Crypto10GameModule: GameModule = {
  id: "crypto-cipher-10",
  title: "Códigos e Criptogramas",
  categoryId: "criptogramas-10",
  supportedAges: ["10-11"],
  generateChallenge: generateCrypto10Challenge,
  component: Crypto10Component
};
