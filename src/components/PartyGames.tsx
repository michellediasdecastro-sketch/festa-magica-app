import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, X, Star, CheckCircle, Sparkles, Brain, Calculator, Shapes, Puzzle } from "lucide-react";

interface PartyGamesProps {
  partyData: any;
  onBackToMain: () => void;
}

export function PartyGames({ partyData, onBackToMain }: PartyGamesProps) {
  const [activeCategory, setActiveCategory] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Referência para controlar a música de fundo em loop
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // Categorias de Jogos Educativos inspiradas nos exemplos
  const categories = [
    {
      id: "logica",
      title: "Lógica",
      color: "bg-purple-500 hover:bg-purple-600",
      icon: Brain,
      stars: 2300,
      challenges: [
        {
          instruction: "Escolha a maçã verde!",
          spokenText: "Escolha a maçã verde",
          correct: "🍏",
          options: ["🍎", "🍊", "🍏"]
        },
        {
          instruction: "Encontre o intruso na fila!",
          spokenText: "Encontre o intruso na fila",
          correct: "🐱",
          options: ["🐶", "🐶", "🐱"]
        }
      ]
    },
    {
      id: "matematica",
      title: "Matemática",
      color: "bg-orange-500 hover:bg-orange-600",
      icon: Calculator,
      stars: 1620,
      challenges: [
        {
          instruction: "Quantos blocos tem na imagem?",
          spokenText: "Quantos blocos tem na imagem?",
          correct: "3",
          options: ["1", "3", "4"]
        },
        {
          instruction: "Qual número vem depois do 2?",
          spokenText: "Qual número vem depois do 2?",
          correct: "3",
          options: ["1", "3", "5"]
        }
      ]
    },
    {
      id: "atencao",
      title: "Atenção e Formas",
      color: "bg-blue-500 hover:bg-blue-600",
      icon: Shapes,
      stars: 569,
      challenges: [
        {
          instruction: "Ligue as figuras iguais!",
          spokenText: "Ligue as figuras iguais",
          correct: "⭐",
          options: ["⬛", "⭐", "⭕"]
        }
      ]
    },
    {
      id: "quebravc",
      title: "Quebra-cabeças",
      color: "bg-green-500 hover:bg-green-600",
      icon: Puzzle,
      stars: 190,
      challenges: [
        {
          instruction: "Complete a imagem encaixando a peça correta!",
          spokenText: "Complete a imagem encaixando a peça correta",
          correct: "🧩",
          options: ["📦", "🧩", "⚽"]
        }
      ]
    }
  ];

  // Sistema de Música de Fundo (BGM) Contínua
  useEffect(() => {
    if (isAudioEnabled) {
      try {
        // Criar um sintetizador de melodia alegre em loop para fundo
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        let timeoutId: any;

        const playMelodyNote = () => {
          if (!isAudioEnabled) return;
          const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
          gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
          timeoutId = setTimeout(playMelodyNote, 800);
        };
        playMelodyNote();

        return () => clearTimeout(timeoutId);
      } catch (e) {
        console.log("Audio background error", e);
      }
    }
  }, [isAudioEnabled]);

  // Função para reproduzir a fala do comando (Text-to-Speech nativo do navegador em Português)
  const speakInstruction = (text: string) => {
    if (!isAudioEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9; // Velocidade agradável para crianças
      utterance.pitch = 1.2; // Tom amigável
      window.speechSynthesis.speak(utterance);
    }
  };

  // Efeitos Sonoros de Acerto e Erro
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
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    } catch (e) {
      console.log("SFX error", e);
    }
  };

  const handleSelectCategory = (cat: any) => {
    playSfx('click');
    setActiveCategory(cat);
    setCurrentStep(0);
    setCompletedTasks(0);
    setShowSummary(false);
    // Fala o comando automaticamente ao entrar no jogo
    setTimeout(() => speakInstruction(cat.challenges[0].spokenText), 500);
  };

  const handleAnswer = (option: string) => {
    const activeChallenge = activeCategory.challenges[currentStep % activeCategory.challenges.length];

    if (option === activeChallenge.correct) {
      playSfx('success');
      setFeedback("correct");
      setShowConfetti(true);
      setScore(score + 5);
      setCompletedTasks(completedTasks + 1);

      setTimeout(() => {
        setFeedback(null);
        setShowConfetti(false);
        // Avança para o próximo desafio de forma dinâmica
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        speakInstruction(activeCategory.challenges[nextStep % activeCategory.challenges.length].spokenText);
      }, 1000);
    } else {
      playSfx('wrong');
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-black/40 border border-white/20 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl backdrop-blur-md text-white animate-fade-in relative overflow-hidden">
      
      {/* Topo Global: Controlo de Som e Sair */}
      <div className="flex justify-between items-center pb-4 border-b border-white/15 mb-6">
        <button 
          onClick={onBackToMain}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
        >
          ← Voltar ao Menu Principal
        </button>

        <button 
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white flex items-center gap-1.5 text-xs font-bold"
        >
          {isAudioEnabled ? <Volume2 className="size-4 text-[#bef264]" /> : <VolumeX className="size-4 text-red-400" />}
          {isAudioEnabled ? "Som Ativado" : "Mudo"}
        </button>
      </div>

      {/* TELA 1: MENU DE CATEGORIAS (Estilo Print 2) */}
      {!activeCategory ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Centro de Aprendizagem</h2>
            <p className="text-xs text-white/70">Escolha uma categoria e divirta-se a explorar!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`${cat.color} p-6 rounded-3xl shadow-xl flex flex-col justify-between items-start gap-4 transition-all transform hover:scale-105 cursor-pointer text-left border border-white/20`}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className="p-3 rounded-2xl bg-black/20 text-white">
                      <IconComponent className="size-6" />
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 text-xs font-bold text-yellow-300">
                      <Star className="size-3 fill-yellow-300" /> {cat.stars}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{cat.title}</h3>
                    <p className="text-[11px] text-white/80 mt-0.5">Toque para jogar</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : !showSummary ? (
        // TELA 2: ÁREA DE JOGO ATIVO (Estilo Prints 3, 4, 5, 6 com Botão de Áudio e Fechar X)
        <div className="flex flex-col gap-6 animate-fade-in relative min-h-[380px]">
          
          {/* Barra Superior do Jogo: Botão de Áudio do Comando e Botão Fechar (X) */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => speakInstruction(activeCategory.challenges[currentStep % activeCategory.challenges.length].spokenText)}
              className="p-3 rounded-2xl bg-black/50 border border-white/30 hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2 shadow-lg animate-pulse"
              title="Ouvir instrução"
            >
              <Volume2 className="size-6 text-[#bef264]" />
              <span className="text-xs font-bold text-white hidden sm:inline">Ouvir Comando</span>
            </button>

            <button
              onClick={() => setShowSummary(true)}
              className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/40 transition-all cursor-pointer text-red-300 shadow-lg"
              title="Sair do Jogo"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Área Principal do Desafio Visual */}
          <div className={`p-8 rounded-3xl border text-center flex flex-col items-center justify-center gap-6 transition-all shadow-2xl ${
            feedback === 'correct' ? 'bg-green-500/30 border-green-400 scale-102' :
            feedback === 'wrong' ? 'bg-red-500/30 border-red-400 animate-shake' :
            'bg-black/40 border-white/20'
          }`}>
            <h3 className="text-lg sm:text-2xl font-black text-white drop-shadow">
              {activeCategory.challenges[currentStep % activeCategory.challenges.length].instruction}
            </h3>

            {/* Opções Visuais Grandes */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-2">
              {activeCategory.challenges[currentStep % activeCategory.challenges.length].options.map((opt: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className="py-8 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] hover:bg-white/15 transition-all cursor-pointer text-5xl sm:text-6xl flex items-center justify-center shadow-xl active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="text-6xl animate-bounce">🎉✨🎊</span>
            </div>
          )}
        </div>
      ) : (
        // TELA 3: TELA DE RESUMO DE CONQUISTAS (Estilo Print 7)
        <div className="flex flex-col items-center justify-center gap-5 py-8 animate-fade-in text-center">
          <div className="p-5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 shadow-xl">
            <Sparkles className="size-16 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#bef264] font-extrabold">Nova Conquista!</span>
            <h2 className="text-3xl font-black text-white">Excelente!</h2>
            <p className="text-sm text-white/80 mt-2">{completedTasks} tarefas concluídas</p>
            <div className="text-xl font-extrabold text-yellow-300 mt-1">
              +{score} ⭐
            </div>
          </div>

          <button
            onClick={() => setActiveCategory(null)}
            className="mt-4 px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-base shadow-xl transition-all transform hover:scale-105 cursor-pointer"
          >
            Excelente!
          </button>
        </div>
      )}

    </div>
  );
}
