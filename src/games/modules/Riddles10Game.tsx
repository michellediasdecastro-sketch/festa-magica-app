import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const RIDDLES = [
  { q: "O que é, o que é? Tem coroa, mas não é rei, tem escama, mas não é peixe.", a: "ABACAXI", wrong: ["FANTASMA", "CEBOLA", "LEÃO"] },
  { q: "O que é, o que é? Cai em pé e corre deitado.", a: "CHUVA", wrong: ["BOLA", "GATO", "ÁGUA"] },
  { q: "O que é, o que é? Quanto mais se tira, maior fica.", a: "BURACO", wrong: ["BOLO", "SOMBRA", "DÍVIDA"] },
  { q: "O que é, o que é? Nasce grande e morre pequeno.", a: "LÁPIS", wrong: ["SOL", "SAPATO", "ÁRVORE"] },
  { q: "O que é, o que é? Feito para andar e não anda.", a: "RUA", wrong: ["CARRO", "SAPATO", "PÉ"] },
  { q: "O que é, o que é? Tem cabeça e tem dente, não é bicho e nem é gente.", a: "ALHO", wrong: ["PENTE", "SERRA", "ZÍPER"] },
  { q: "O que é, o que é? Sobe quando a chuva desce.", a: "GUARDA-CHUVA", wrong: ["BALÃO", "PÁSSARO", "FUMAÇA"] },
  { q: "O que é, o que é? Tem pescoço e não tem cabeça, tem braços e não tem mãos.", a: "CAMISA", wrong: ["BONECO", "RELÓGIO", "CADEIRA"] },
  { q: "O que é, o que é? Anda com os pés na cabeça.", a: "PIOLHO", wrong: ["CHAPÉU", "MACACO", "SAPATO"] },
  { q: "O que é, o que é? Passa a vida na janela e mesmo dentro de casa está fora dela.", a: "BOTÃO", wrong: ["CORTINA", "VIDRO", "VENTO"] },
  { q: "O que é, o que é? Tem bico, mas não bica. Tem asa, mas não voa.", a: "BULE", wrong: ["PATO", "AVIÃO", "XÍCARA"] },
  { q: "O que é, o que é? De dia tem 4 pés, de noite tem 6.", a: "CAMA", wrong: ["MESA", "GATO", "CADEIRA"] },
  { q: "O que é, o que é? Quanto mais cresce, menos se vê.", a: "ESCURIDÃO", wrong: ["NUVEM", "NEBLINA", "SOMBRA"] },
  { q: "O que é, o que é? Fica cheio de boca para baixo e vazio de boca para cima.", a: "CHAPÉU", wrong: ["COPO", "BALDE", "MALA"] },
  { q: "O que é, o que é? Entra na água e não se molha.", a: "SOMBRA", wrong: ["PEIXE", "BARCO", "PEDRA"] },
  { q: "O que é, o que é? Tem folhas, mas não é árvore. Tem capa, mas não é herói.", a: "LIVRO", wrong: ["CADERNO", "CAMA", "ALFACE"] }
];

const generateRiddlesChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  let riddle;
  let attempts = 0;
  
  // A trava verifica a resposta exata no histórico para nunca repetir a charada
  do {
    riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    attempts++;
  } while (history.some(h => h.includes(riddle.a)) && attempts < 40);

  const options = [riddle.a, ...riddle.wrong].sort(() => Math.random() - 0.5);

  return {
    id: `riddle10-${Date.now()}-${riddle.a}`, // A resposta vai no ID para a trava funcionar
    instruction: "O que é, o que é?",
    spokenText: "Leia a charada com muita atenção e tente adivinhar a resposta certa.",
    data: { question: riddle.q, options, answer: riddle.a }
  };
};

const Riddles10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { question, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="bg-black/50 p-6 sm:p-8 rounded-[2rem] border border-white/20 shadow-inner w-full text-center min-h-[8rem] flex items-center justify-center">
        <h3 className="text-2xl sm:text-3xl font-black text-white leading-relaxed">
          "{question}"
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 40)}
            className="py-6 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-xl sm:text-2xl font-black shadow-xl active:scale-95 text-white tracking-wide"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Riddles10GameModule: GameModule = {
  id: "riddles-10",
  title: "Charadas e Enigmas",
  categoryId: "decisoes-10",
  supportedAges: ["10-11"],
  generateChallenge: generateRiddlesChallenge,
  component: Riddles10Component
};
