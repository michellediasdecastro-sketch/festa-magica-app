import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Base de Palavras Universais e Mágicas (Funciona para qualquer tema do mundo)
const UNIVERSAL_WORDS = [
  { word: "FESTA", display: "FESTA", syllables: 2 },
  { word: "BOLO", display: "BOLO", syllables: 2 },
  { word: "MAGIA", display: "MAGIA", syllables: 3 },
  { word: "TESOURO", display: "TESOURO", syllables: 3 },
  { word: "CORAGEM", display: "CORAGEM", syllables: 3 },
  { word: "AMIGO", display: "AMIGO", syllables: 3 },
  { word: "SEGREDO", display: "SEGREDO", syllables: 3 },
  { word: "CHAVE", display: "CHAVE", syllables: 2 },
  { word: "PREMIO", display: "PRÊMIO", syllables: 2 },
  { word: "ALEGRIA", display: "ALEGRIA", syllables: 3 },
  { word: "FORCA", display: "FORÇA", syllables: 2 },
  { word: "VELA", display: "VELA", syllables: 2 },
  { word: "DOCE", display: "DOCE", syllables: 2 },
  { word: "VITORIA", display: "VITÓRIA", syllables: 4 },
  { word: "MISTERIO", display: "MISTÉRIO", syllables: 4 },
  { word: "DESAFIO", display: "DESAFIO", syllables: 4 }
];

const generateWordsChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = (context.gameImages && context.gameImages.length > 0) ? context.gameImages : ["🍎"];
  
  let attempts = 0;
  let item = "";
  let wordInfo: any = null;
  let variation = 0;

  // Trava para não repetir a mesma imagem nem a mesma palavra mágica nas últimas rondas
  do {
    item = source[Math.floor(Math.random() * source.length)];
    wordInfo = UNIVERSAL_WORDS[Math.floor(Math.random() * UNIVERSAL_WORDS.length)];
    variation = Math.floor(Math.random() * 3);
    attempts++;
  } while (history.some(h => h.includes(wordInfo.word)) && attempts < 20);

  let instruction = "";
  let spokenText = "";
  let options: any[] = [];
  let answer: any = "";

  if (variation === 0) {
    // Missão: Qual é a primeira letra?
    instruction = "Qual é a primeira letra?";
    spokenText = "Olha só a palavra secreta que apareceu! Qual letra falta no início?";
    answer = wordInfo.word.charAt(0);
    
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const optionsSet = new Set<string>([answer]);
    while (optionsSet.size < 4) {
      optionsSet.add(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }
    options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  } else if (variation === 1) {
    // Missão: Quantas sílabas?
    instruction = "Quantas sílabas tem?";
    spokenText = `Bata palmas para a palavra mágica: ${wordInfo.display}. Quantas sílabas ela tem?`;
    answer = wordInfo.syllables;
    
    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 4) {
      const wrong = Math.floor(Math.random() * 4) + 1;
      if (wrong !== answer) optionsSet.add(wrong);
    }
    options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  } else {
    // Missão: Letra Oculta no Meio
    instruction = "Complete a palavra!";
    spokenText = "Alguém escondeu uma letra no meio da palavra secreta. Qual é a letra certa?";
    
    // Escolhe uma letra do meio (não a primeira nem a última) para ocultar
    const hideIndex = Math.floor(Math.random() * (wordInfo.word.length - 2)) + 1;
    answer = wordInfo.word.charAt(hideIndex);
    
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const optionsSet = new Set<string>([answer]);
    while (optionsSet.size < 4) {
      optionsSet.add(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }
    options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
    
    // Guarda o índice oculto para o componente renderizar corretamente
    wordInfo = { ...wordInfo, hideIndex }; 
  }

  return {
    id: `words-${Date.now()}-${wordInfo.word}`, // O ID grava a palavra usada para evitar repetição
    instruction,
    spokenText,
    data: { variation, item, wordInfo, options, answer }
  };
};

const WordsComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { variation, item, wordInfo, options, answer } = challenge.data;
  const isImage = item && item.startsWith('http');

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-4 bg-black/40 p-4 sm:p-6 rounded-[2.5rem] border border-white/20 shadow-inner w-full">
        <div className="text-[#bef264] text-xs sm:text-sm font-bold uppercase tracking-widest text-center">
          A Palavra Mágica É:
        </div>
        
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
          {isImage ? (
             <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-xl pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          ) : <span className="text-7xl drop-shadow-xl pointer-events-none">{item || "❓"}</span>}
        </div>
        
        <div className="w-full text-center min-h-[4rem] flex flex-col justify-center">
          {variation === 0 && (
            <div className="text-3xl sm:text-4xl font-black text-white tracking-widest bg-black/50 px-4 py-2 rounded-xl flex items-center justify-center w-fit mx-auto">
              <span className="border-b-4 border-[#bef264] text-[#bef264] animate-pulse mr-1 min-w-[1.5rem] inline-block text-center">?</span>
              <span>{wordInfo.display.substring(1)}</span>
            </div>
          )}

          {variation === 1 && (
            <div className="text-2xl sm:text-4xl font-black text-[#bef264] tracking-widest bg-black/50 px-6 py-3 rounded-2xl w-fit mx-auto shadow-md">
               {wordInfo.display}
            </div>
          )}

          {variation === 2 && (
            <div className="text-3xl sm:text-4xl font-black text-white tracking-widest bg-black/50 px-4 py-2 rounded-xl flex items-center justify-center w-fit mx-auto">
              {wordInfo.display.split("").map((char: string, idx: number) => (
                <span key={idx} className={idx === wordInfo.hideIndex ? "border-b-4 border-[#bef264] text-[#bef264] animate-pulse mx-1 min-w-[1.5rem] inline-block text-center" : ""}>
                  {idx === wordInfo.hideIndex ? "?" : char}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        {options.map((opt: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 20)}
            className="aspect-square text-4xl sm:text-5xl rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] hover:bg-white/10 transition-all font-black shadow-xl active:scale-95 text-white flex items-center justify-center"
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
  title: "Letras, Sílabas e Palavras",
  categoryId: "letras-6",
  supportedAges: ["6-7"],
  generateChallenge: generateWordsChallenge,
  component: WordsComponent
};
