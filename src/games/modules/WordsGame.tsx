import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const DINO_DB: Record<string, any> = {
  "TRICERATOPS": { word: "CHIFRES", display: "CHIFRES", phrase: "Tem três", suffix: "na cabeça", syllables: 2, trait: "Três Chifres" },
  "STEGOSAURUS": { word: "PLACAS", display: "PLACAS", phrase: "Tem", suffix: "nas costas", syllables: 2, trait: "Placas nas Costas" },
  "ANKYLOSAURUS": { word: "ARMADURA", display: "ARMADURA", phrase: "Tem uma", suffix: "forte", syllables: 4, trait: "Armadura Forte" },
  "BRACHIOSAURUS": { word: "PESCOCO", display: "PESCOÇO", phrase: "Tem um", suffix: "comprido", syllables: 3, trait: "Pescoço Longo" },
  "PARASAUROLOPHUS": { word: "CRISTA", display: "CRISTA", phrase: "Tem uma", suffix: "na cabeça", syllables: 2, trait: "Crista na Cabeça" },
  "SPINOSAURUS": { word: "VELA", display: "VELA", phrase: "Tem uma", suffix: "nas costas", syllables: 2, trait: "Vela nas Costas" },
  "VELOCIRAPTOR": { word: "GARRAS", display: "GARRAS", phrase: "Tem", suffix: "afiadas", syllables: 2, trait: "Garras Afiadas" },
  "PTERANODON": { word: "ASAS", display: "ASAS", phrase: "Usa as", suffix: "para voar", syllables: 2, trait: "Asas para Voar" },
  "DILOPHOSAURUS": { word: "VENENO", display: "VENENO", phrase: "Cospe", suffix: "para caçar", syllables: 3, trait: "Cospe Veneno" },
  "IGUANODON": { word: "DENTES", display: "DENTES", phrase: "Tem", suffix: "fortes", syllables: 2, trait: "Dentes Fortes" },
  "CARNOTAURUS": { word: "CHIFRES", display: "CHIFRES", phrase: "Pequenos", suffix: "na cabeça", syllables: 2, trait: "Chifres Pequenos" },
  "THERIZINOSAURUS": { word: "UNHAS", display: "UNHAS", phrase: "Tem", suffix: "gigantes", syllables: 2, trait: "Unhas Gigantes" },
  "PACHYCEPHALOSAURUS": { word: "CABECA", display: "CABEÇA", phrase: "Tem uma", suffix: "muito dura", syllables: 3, trait: "Cabeça Dura" },
  "COMPSOGNATHUS": { word: "TAMANHO", display: "TAMANHO", phrase: "É do", suffix: "de uma galinha", syllables: 3, trait: "Tamanho Pequeno" },
  "ARCHAEOPTERYX": { word: "PENAS", display: "PENAS", phrase: "Tem", suffix: "pelo corpo", syllables: 2, trait: "Penas no Corpo" },
  "TYRANNOSAURUS": { word: "DENTES", display: "DENTES", phrase: "Tem", suffix: "gigantes", syllables: 2, trait: "Dentes Gigantes" },
  "TREX": { word: "DENTES", display: "DENTES", phrase: "Tem", suffix: "gigantes", syllables: 2, trait: "Dentes Gigantes" },
  "APATOSAURUS": { word: "PESCOCO", display: "PESCOÇO", phrase: "Tem um", suffix: "muito longo", syllables: 3, trait: "Pescoço Longo" },
  "DIPLODOCUS": { word: "CAUDA", display: "CAUDA", phrase: "Parece um", suffix: "chicote", syllables: 2, trait: "Cauda de Chicote" },
  "ALLOSAURUS": { word: "GARRAS", display: "GARRAS", phrase: "Tem", suffix: "poderosas", syllables: 2, trait: "Garras Poderosas" },
  "GALLIMIMUS": { word: "PERNAS", display: "PERNAS", phrase: "Tem", suffix: "rápidas", syllables: 2, trait: "Pernas Rápidas" },
  "MOSASAURUS": { word: "BARBATANA", display: "BARBATANA", phrase: "Usa a", suffix: "para nadar", syllables: 4, trait: "Barbatana Grande" },
  "PLESIOSAURUS": { word: "PESCOCO", display: "PESCOÇO", phrase: "Tem um", suffix: "na água", syllables: 3, trait: "Pescoço Aquático" },
  "BARYONYX": { word: "FOCINHO", display: "FOCINHO", phrase: "Parece um", suffix: "crocodilo", syllables: 3, trait: "Focinho Comprido" },
  "OVIRAPTOR": { word: "BICO", display: "BICO", phrase: "Tem um", suffix: "forte", syllables: 2, trait: "Bico Forte" },
  "MICRORAPTOR": { word: "PENAS", display: "PENAS", phrase: "Tem", suffix: "nas quatro patas", syllables: 2, trait: "Penas nas Patas" },
  "GIGANOTOSAURUS": { word: "TAMANHO", display: "TAMANHO", phrase: "É um", suffix: "gigante", syllables: 3, trait: "Tamanho Gigante" },
  "CORYTHOSAURUS": { word: "CRESTA", display: "CRESTA", phrase: "Tem uma", suffix: "redonda", syllables: 2, trait: "Cresta Redonda" },
  "STYRACOSAURUS": { word: "CHIFRES", display: "CHIFRES", phrase: "Tem", suffix: "no pescoço", syllables: 2, trait: "Chifres no Pescoço" },
  "KENTROSAURUS": { word: "ESPINHOS", display: "ESPINHOS", phrase: "Tem", suffix: "nas costas", syllables: 3, trait: "Espinhos nas Costas" },
  "MAIASAURA": { word: "NINHO", display: "NINHO", phrase: "Cuida do", suffix: "com os filhotes", syllables: 2, trait: "Cuida do Ninho" },
  "DIMETRODON": { word: "VELA", display: "VELA", phrase: "Tem uma", suffix: "grande nas costas", syllables: 2, trait: "Vela Grande" },
  "RAPTOR": { word: "GARRAS", display: "GARRAS", phrase: "Tem", suffix: "curvadas", syllables: 2, trait: "Garras Curvadas" }
};

const FALLBACK_TRAITS = [
  { word: "CAUDA", display: "CAUDA", phrase: "Tem uma", suffix: "forte", syllables: 2, trait: "Cauda Forte" },
  { word: "PATAS", display: "PATAS", phrase: "Tem", suffix: "fortes", syllables: 2, trait: "Patas Fortes" },
  { word: "ESCAMAS", display: "ESCAMAS", phrase: "Tem", suffix: "duras", syllables: 3, trait: "Escamas Duras" },
  { word: "OLHOS", display: "OLHOS", phrase: "Tem", suffix: "atentos", syllables: 2, trait: "Olhos Atentos" }
];

const extractDinoKey = (url: string): string => {
  if (!url || !url.startsWith('http')) return "DEFAULT";
  try {
    let filename = url.split('/').pop() || "";
    filename = filename.split('.')[0];
    if (!filename) return "DEFAULT";
    const cleanName = filename.replace(/[^a-zA-ZÀ-ÿ]/g, '').toUpperCase();
    for (const key in DINO_DB) {
      if (cleanName.includes(key)) return key;
    }
    return "DEFAULT";
  } catch (e) {
    return "DEFAULT";
  }
};

const generateWordsChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = (context.gameImages && context.gameImages.length > 0) ? context.gameImages : ["🍎"];
  
  let attempts = 0;
  let item = "";
  let dinoKey = "";
  let dinoInfo: any = null;
  let variation = 0;

  // TRAVA ANTI-REPETIÇÃO ABSOLUTA: Verifica se o dinossauro exato já foi usado recentemente
  do {
    item = source[Math.floor(Math.random() * source.length)];
    dinoKey = extractDinoKey(item);
    
    if (dinoKey === "DEFAULT") {
      dinoInfo = FALLBACK_TRAITS[Math.floor(Math.random() * FALLBACK_TRAITS.length)];
    } else {
      dinoInfo = DINO_DB[dinoKey];
    }
    
    variation = Math.floor(Math.random() * 3);
    attempts++;
  } while (history.some(h => h.includes(item)) && attempts < 30); // Usa o link do item para bloquear repetição da mesma imagem

  let instruction = "";
  let spokenText = "";
  let options: any[] = [];
  let answer: any = "";

  if (variation === 0) {
    instruction = "Qual é a primeira letra?";
    spokenText = "O que falta nessa palavra?";
    answer = dinoInfo.word.charAt(0);
    
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const optionsSet = new Set<string>([answer]);
    while (optionsSet.size < 4) {
      optionsSet.add(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }
    options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  } else if (variation === 1) {
    instruction = "Quantas sílabas tem?";
    spokenText = `Bata palmas para a palavra ${dinoInfo.display}. Quantas sílabas ela tem?`;
    answer = dinoInfo.syllables;
    
    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 4) {
      const wrong = Math.floor(Math.random() * 5) + 1;
      if (wrong !== answer) optionsSet.add(wrong);
    }
    options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  } else {
    instruction = "O que ele tem de especial?";
    spokenText = "Observe bem este dinossauro. O que o torna especial?";
    answer = dinoInfo.trait;
    
    const optionsSet = new Set<string>([answer]);
    const allKeys = Object.keys(DINO_DB).filter(k => k !== dinoKey);
    const shuffledKeys = allKeys.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffledKeys.length; i++) {
      optionsSet.add(DINO_DB[shuffledKeys[i]].trait);
    }
    options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
  }

  // O ID guarda a imagem exata no histórico para a bloquear nas rondas seguintes
  return {
    id: `words-${Date.now()}-${item}`, 
    instruction,
    spokenText,
    data: { variation, item, dinoInfo, options, answer, dinoKey }
  };
};

const WordsComponent: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { variation, item, dinoInfo, options, answer, dinoKey } = challenge.data;
  const isImage = item && item.startsWith('http');
  const isTraitMode = variation === 2;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-4 bg-black/40 p-4 sm:p-6 rounded-[2.5rem] border border-white/20 shadow-inner w-full">
        <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
          {isImage ? (
             <img src={item} alt="item" className="w-full h-full object-contain drop-shadow-xl pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          ) : <span className="text-7xl drop-shadow-xl pointer-events-none">{item || "❓"}</span>}
        </div>
        
        <div className="w-full text-center min-h-[4rem] flex flex-col justify-center">
          {variation === 0 && (
            <div className="text-lg sm:text-2xl font-bold text-white flex flex-col items-center leading-tight">
               <span className="text-white/70 mb-1">{dinoInfo.phrase}</span>
               <div className="text-3xl sm:text-4xl font-black text-[#bef264] tracking-widest bg-black/50 px-4 py-2 rounded-xl flex items-center justify-center w-fit mx-auto">
                 <span className="border-b-4 border-[#bef264] text-white/20 animate-pulse mr-1 min-w-[1rem] inline-block text-center">_</span>
                 <span>{dinoInfo.display.substring(1)}</span>
               </div>
               <span className="text-white/70 mt-1">{dinoInfo.suffix}</span>
            </div>
          )}

          {variation === 1 && (
            <div className="text-2xl sm:text-4xl font-black text-[#bef264] tracking-widest bg-black/50 px-6 py-3 rounded-2xl w-fit mx-auto shadow-md">
               {dinoInfo.display}
            </div>
          )}

          {variation === 2 && (
            <div className="text-xl sm:text-2xl font-black text-white/90">
               {dinoKey !== "DEFAULT" ? dinoKey : "Este Dinossauro"}
            </div>
          )}
        </div>
      </div>

      <div className={`grid gap-3 w-full ${isTraitMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {options.map((opt: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 20)}
            className={`rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] hover:bg-white/10 transition-all font-black shadow-xl active:scale-95 text-white flex items-center justify-center text-center
              ${isTraitMode ? 'py-4 px-3 text-sm sm:text-base leading-tight min-h-[70px]' : 'aspect-square text-4xl sm:text-5xl'}
            `}
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
