import React, { useState, useEffect } from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Base de Palavras Universais para Anagramas (Sem acentos para facilitar o teclado)
const UNIVERSAL_WORDS = [
  "FESTA", "BOLO", "MAGIA", "TESOURO", "CORAGEM", "AMIGO", "SEGREDO", 
  "CHAVE", "PREMIO", "ALEGRIA", "FORCA", "VELA", "DOCE", "VITORIA", 
  "MISTERIO", "DESAFIO", "ENIGMA", "CODIGO", "MAPA"
];

const generateWords8Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎"];
  const item = source[Math.floor(Math.random() * source.length)];
  
  let targetWord = "";
  let attempts = 0;
  do {
    targetWord = UNIVERSAL_WORDS[Math.floor(Math.random() * UNIVERSAL_WORDS.length)];
    attempts++;
  } while (history.some(h => h.includes(targetWord)) && attempts < 20);

  const letters = targetWord.split("");
  let scrambled = [...letters].sort(() => Math.random() - 0.5);
  
  // Garante que o baralhamento não gerou a palavra certa por acidente
  while (scrambled.join("") === targetWord && targetWord.length > 1) {
    scrambled = [...letters].sort(() => Math.random() - 0.5);
  }

  return {
    id: `words8-${Date.now()}-${targetWord}`,
    instruction: "Desembaralhe a Senha!",
    spokenText: "A palavra secreta foi toda misturada! Toque nas letras na ordem certa para revelar a senha de acesso.",
    data: { item, targetWord, scrambled: scrambled.map((l, i) => ({ id: i, char: l })) }
  };
};

const Words8Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { item, targetWord, scrambled } = challenge.data;
  const isImage = item.startsWith('http');
  
  const [selectedLetters, setSelectedLetters] = useState<any[]>([]);
  const [availableLetters, setAvailableLetters] = useState<any[]>(scrambled);

  useEffect(() => {
    setSelectedLetters([]);
    setAvailableLetters(scrambled);
  }, [challenge.id, scrambled]);

  const handleSelect = (letterObj: any) => {
    const newSelected = [...selectedLetters, letterObj];
    setSelectedLetters(newSelected);
    setAvailableLetters(availableLetters.filter(l => l.id !== letterObj.id));

    // Quando a criança escolhe todas as letras, o sistema verifica se acertou a palavra
    if (newSelected.length === targetWord.length) {
      const formedWord = newSelected.map(l => l.char).join("");
      setTimeout(() => {
        if (formedWord === targetWord) {
          onAnswer(true, 30);
        } else {
          onAnswer(false, 0); // Toca o erro
          // Limpa o teclado para tentar novamente a mesma palavra
          setSelectedLetters([]);
          setAvailableLetters(scrambled);
        }
      }, 400);
    }
  };

  const handleDeselect = (letterObj: any) => {
    setSelectedLetters(selectedLetters.filter(l => l.id !== letterObj.id));
    setAvailableLetters([...availableLetters, letterObj]);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="text-[#bef264] text-sm font-bold uppercase tracking-widest text-center mb-[-1rem] z-10">
          A Senha Secreta:
      </div>
      
      <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-black/40 rounded-3xl border border-white/20 p-2 shadow-inner">
        {isImage ? (
           <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-md pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
        ) : <span className="text-6xl">{item}</span>}
      </div>

      <div className="flex flex-wrap justify-center gap-2 min-h-[4rem] p-4 bg-black/50 border border-white/20 rounded-2xl w-full">
        {selectedLetters.map((l: any) => (
          <button key={l.id} onClick={() => handleDeselect(l)} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#bef264] text-black font-black text-2xl rounded-lg shadow-md flex items-center justify-center hover:bg-white transition-colors active:scale-95">
            {l.char}
          </button>
        ))}
        {selectedLetters.length === 0 && <span className="text-white/30 text-lg flex items-center">Toque nas letras abaixo...</span>}
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full p-2">
        {availableLetters.map((l: any) => (
          <button key={l.id} onClick={() => handleSelect(l)} className="w-12 h-12 sm:w-14 sm:h-14 bg-black/80 border-2 border-white/40 hover:border-[#bef264] text-white font-black text-2xl rounded-xl shadow-xl flex items-center justify-center transition-all active:scale-90">
            {l.char}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Words8GameModule: GameModule = {
  id: "words-anagram-8",
  title: "Palavras e Enigmas",
  categoryId: "palavras-8",
  supportedAges: ["8-9"],
  generateChallenge: generateWords8Challenge,
  component: Words8Component
};
