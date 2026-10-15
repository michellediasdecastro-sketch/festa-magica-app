import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Inteligência que extrai o nome do dinossauro a partir do link da imagem!
const extractWordFromUrl = (url: string): string => {
  if (!url.startsWith('http')) return "MISTERIO";
  try {
    let filename = url.split('/').pop() || "";
    filename = filename.split('.')[0]; // Tira o .png/.jpg
    filename = filename.replace(/[^a-zA-ZÀ-ÿ]/g, ''); // Remove números e underlines (Ex: "01_triceratops" vira "triceratops")
    return filename.toUpperCase() || "MISTERIO";
  } catch (e) {
    return "MISTERIO";
  }
};

const generateWordsChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length > 0 ? context.gameImages : ["🍎"];
  const item = source[Math.floor(Math.random() * source.length)];
  
  let word = extractWordFromUrl(item);
  // Se a palavra for muito curta ou genérica, usa palavras do tema
  if (word.length < 3 || word === "MISTERIO") {
    const fallbackWords = ["FESTA", "BOLO", "AMIGO", "JOGO", "MAGIA"];
    word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  }

  const missingLetter = word.charAt(0);
  const wordWithBlank = "_" + word.substring(1);

  // Gera 4 letras diferentes, garantindo a correta
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const optionsSet = new Set<string>([missingLetter]);
  
  while (optionsSet.size < 4) {
    const randomLetter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    optionsSet.add(randomLetter);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `words-${word}-${Date.now()}`,
    instruction: "Qual é a primeira letra?",
    spokenText: "Com qual letra começa esta palavra?",
    data: { item, wordWithBlank, missingLetter, options }
  };
};

const WordsComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { item, wordWithBlank, missingLetter, options } = challenge.data;
  const isImage = item.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      
      {/* Imagem e Palavra com lacuna */}
      <div className="flex flex-col items-center gap-6 bg-black/40 p-6 rounded-[2.5rem] border border-white/20 shadow-inner w-full">
        <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
          {isImage ? (
             <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-xl pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          ) : <span className="text-7xl drop-shadow-xl pointer-events-none">{item}</span>}
        </div>
        
        <div className="text-3xl sm:text-5xl font-black text-white tracking-widest drop-shadow-md font-mono">
          <span className="text-[#bef264] border-b-4 border-[#bef264] mr-2 inline-block w-8 sm:w-12 text-center animate-pulse">?</span>
          {wordWithBlank.substring(1)}
        </div>
      </div>

      {/* Teclado de Letras */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === missingLetter, 20)}
            className="aspect-square rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-5xl font-black shadow-xl active:scale-95 text-white"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const WordsGameModule: GameModule = {
  id: "words-initial-6",
  title: "Letras e Sílabas",
  categoryId: "letras-6",
  supportedAges: ["6-7"], // EXCLUSIVO PARA 6 E 7 ANOS
  generateChallenge: generateWordsChallenge,
  component: WordsComponent
};
