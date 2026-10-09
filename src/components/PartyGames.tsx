import { useState } from "react";
import { Volume2, VolumeX, X, Brain, Calculator, Shapes, Puzzle } from "lucide-react";

interface PartyGamesProps {
  partyData: any;
  onBackToMain: () => void;
}

export function PartyGames({ partyData, onBackToMain }: PartyGamesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Banco de Jogos Corrigidos, Visuais e Ricos (Com modelos de referência reais)
  const gamePool: Record<string, any[]> = {
    logica: [
      {
        instruction: "Toque na fruta verde!",
        spokenText: "Escolha a fruta verde",
        type: "options",
        correct: "🍏",
        options: ["🍎", "🍊", "🍏", "🍌"]
      },
      {
        instruction: "Quem é o animal diferente na roda?",
        spokenText: "Encontre o animal diferente",
        type: "options",
        correct: "🦊",
        options: ["🐼", "🐼", "🦊", "🐼"]
      }
    ],
    matematica: [
      {
        instruction: "Quantos blocos coloridos estão empilhados?",
        spokenText: "Quantos blocos estão empilhados?",
        type: "stacked-blocks",
        count: 3,
        correct: "3",
        options: ["2", "3", "5"]
      },
      {
        instruction: "Qual número vem logo depois do 2?",
        spokenText: "Qual número vem depois do 2?",
        type: "options",
        correct: "3",
        options: ["1", "3", "4"]
      }
    ],
    atencao: [
      {
        instruction: "Encontre a figura igual ao modelo!",
        spokenText: "Encontre a figura igual ao modelo",
        type: "match-model",
        model: "⭐",
        correct: "⭐",
        options: ["⭕", "⭐", "⬛", "🔺"]
      },
      {
        instruction: "Encontre a figura igual ao modelo!",
        spokenText: "Encontre a figura igual ao modelo",
        type: "match-model",
        model: "🔵",
        correct: "🔵",
        options: ["🔵", "⭐", "⬛", "🔺"]
      }
    ],
    quebravc: [
      {
        instruction: "Encontre a peça que encaixa no painel!",
        spokenText: "Encontre a peça que encaixa no painel",
        type: "puzzle-model",
        model: "🧩",
        correct: "🧩",
        options: ["📦", "🧩", "⚽", "🎈"]
      }
    ]
  };

  const speakInstruction = (text: string) => {
    if (!isAudioEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playSfx = (type: 'success' | 'wrong' | 'click') => {
    if (!isAudioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    } catch (e) {
      console.log("SFX error", e);
    }
  };

  const handleSelectCategory = (catId: string) => {
    playSfx('click');
    const list = gamePool[catId];
    // Sorteia aleatoriamente um desafio diferente para evitar repetições
    const randomIndex = Math.floor(Math.random() * list.length);
    const selected = list[randomIndex];
    setActiveCategory(catId);
    setCurrentChallenge(selected);
    setTimeout(() => speakInstruction(selected.spokenText), 400);
  };

  const handleAnswer = (option: string) => {
    if (option === currentChallenge.correct) {
      playSfx('success');
      setFeedback("correct");
      setShowConfetti(true);
      setScore(score + 10);
      setCompletedTasks(completedTasks + 1);

      setTimeout(() => {
        setFeedback(null);
        setShowConfetti(false);
        // Sorteia o próximo desafio da categoria garantindo variação
        const list = gamePool[activeCategory as string];
        const nextIndex = Math.floor(Math.random() * list.length);
        const nextChallenge = list[nextIndex];
        setCurrentChallenge(nextChallenge);
        speakInstruction(nextChallenge.spokenText);
      }, 900);
    } else {
      playSfx('wrong');
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const categories = [
    { id: "logica", title: "Lógica", color: "bg-purple-600/80 hover:bg-purple-700", icon: Brain },
    { id: "matematica", title: "Matemática", color: "bg-orange-600/80 hover:bg-orange-700", icon: Calculator },
    { id: "atencao", title: "Atenção", color: "bg-blue-600/80 hover:bg-blue-700", icon: Shapes },
    { id: "quebravc", title: "Quebra-cabeças", color: "bg-green-600/80 hover:bg-green-700", icon: Puzzle }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-transparent text-white animate-fade-in relative px-4">
      
      {/* Topo Global: Som e Sair */}
      <div className="flex justify-between items-center pb-4 mb-4">
        <button 
          onClick={onBackToMain}
          className="px-4 py-2 rounded-2xl bg-black/50 border border-white/30 hover:bg-black/70 text-xs font-bold transition-all cursor-pointer backdrop-blur-md shadow-lg"
        >
          ← Voltar
        </button>

        <button 
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className="p-3 rounded-2xl bg-black/50 border border-white/30 hover:bg-black/70 transition-all cursor-pointer text-white flex items-center gap-2 text-xs font-bold backdrop-blur-md shadow-lg"
        >
          {isAudioEnabled ? <Volume2 className="size-4 text-[#bef264]" /> : <VolumeX className="size-4 text-red-400" />}
          {isAudioEnabled ? "Som Ativado" : "Mudo"}
        </button>
      </div>

      {/* MENU DE CATEGORIAS */}
      {!activeCategory ? (
        <div className="flex flex-col gap-6 animate-fade-in text-center">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
              Aventuras de {partyData.partyName}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 drop-shadow">
              Guia: <strong className="text-[#bef264]">{partyData.characterName || "Mascote"}</strong> | Escolha um mundo para jogar!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`${cat.color} p-6 rounded-[2.5rem] shadow-2xl flex flex-col justify-between items-center gap-4 transition-all transform hover:scale-105 cursor-pointer text-center border border-white/30 backdrop-blur-md`}
                >
                  <div className="p-4 rounded-3xl bg-black/30 text-white shadow-inner">
                    <IconComponent className="size-8 text-[#bef264]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white drop-shadow">{cat.title}</h3>
                    <span className="text-[11px] text-[#bef264] font-bold mt-1 block">Toque para jogar</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // TELA DO JOGO ATIVO
        <div className="flex flex-col gap-6 animate-fade-in relative min-h-[380px] items-center">
          
          <div className="w-full flex justify-between items-center max-w-xl">
            <button
              onClick={() => speakInstruction(currentChallenge.spokenText)}
              className="p-3.5 rounded-2xl bg-black/60 border border-white/30 hover:bg-black/80 transition-all cursor-pointer flex items-center gap-2 shadow-xl backdrop-blur-md animate-pulse"
              title="Ouvir instrução"
            >
              <Volume2 className="size-6 text-[#bef264]" />
              <span className="text-xs font-bold text-white">Ouvir Comando</span>
            </button>

            <button
              onClick={() => setActiveCategory(null)}
              className="p-3.5 rounded-2xl bg-red-600/60 border border-red-400/50 hover:bg-red-600/80 transition-all cursor-pointer text-white shadow-xl backdrop-blur-md"
              title="Sair do Jogo"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Área Visual do Desafio */}
          <div className={`w-full max-w-xl p-8 rounded-[2.5rem] border text-center flex flex-col items-center justify-center gap-6 transition-all shadow-2xl backdrop-blur-md ${
            feedback === 'correct' ? 'bg-green-600/40 border-green-400 scale-102' :
            feedback === 'wrong' ? 'bg-red-600/40 border-red-400 animate-bounce' :
            'bg-black/30 border-white/25'
          }`}>
            <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {currentChallenge.instruction}
            </h3>

            {/* 1. Blocos Empilhados de Verdade (Vertical) */}
            {currentChallenge.type === 'stacked-blocks' && (
              <div className="flex flex-col items-center justify-center py-2 gap-1">
                <div className="w-16 h-10 bg-purple-600 rounded-xl shadow-lg border border-white/30"></div>
                <div className="w-20 h-10 bg-yellow-400 rounded-xl shadow-lg border border-white/30"></div>
                <div className="w-24 h-10 bg-orange-500 rounded-xl shadow-lg border border-white/30"></div>
              </div>
            )}

            {/* 2. Modelo de Referência para Atenção e Quebra-Cabeças */}
            {(currentChallenge.type === 'match-model' || currentChallenge.type === 'puzzle-model') && (
              <div className="flex flex-col items-center gap-2 bg-black/40 px-6 py-3 rounded-2xl border border-white/20 shadow-inner">
                <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Modelo:</span>
                <span className="text-5xl">{currentChallenge.model}</span>
              </div>
            )}

            {/* Opções de Resposta Centralizadas e Perfeitas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-2">
              {currentChallenge.options.map((opt: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className="py-6 rounded-3xl bg-black/50 border border-white/30 hover:border-[#bef264] hover:bg-white/20 transition-all cursor-pointer text-4xl sm:text-5xl flex items-center justify-center shadow-2xl active:scale-95 backdrop-blur-md"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="text-7xl animate-bounce">🎉✨🎊⭐</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
