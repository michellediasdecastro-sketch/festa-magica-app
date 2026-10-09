import { useState, useEffect } from "react";
import { Sparkles, Trophy, Volume2, VolumeX, ArrowRight, RefreshCw, CheckCircle } from "lucide-react";

interface PartyGamesProps {
  partyData: any;
  onBackToMain: () => void;
}

export function PartyGames({ partyData, onBackToMain }: PartyGamesProps) {
  const [isPlayingMission, setIsPlayingMission] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [missionComplete, setMissionComplete] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [shuffledChallenges, setShuffledChallenges] = useState<any[]>([]);

  // Banco de desafios visuais para crianças de 4 anos (baseados em ícones e intuição, sem leitura)
  const masterChallenges = [
    {
      instruction: "Onde está a folha verde da floresta?",
      correct: "🌿",
      options: ["🌿", "❄️", "🔥"]
    },
    {
      instruction: "Qual é o som do nosso amigo gigante?",
      correct: "🦖",
      options: ["🦖", "🚀", "🚗"]
    },
    {
      instruction: "Encontra a água cristalina da cascata!",
      correct: "💧",
      options: ["🌵", "💧", "⚡"]
    },
    {
      instruction: "Qual destes itens brilha no escuro da caverna?",
      correct: "✨",
      options: ["🌑", "✨", "🧱"]
    },
    {
      instruction: "Qual é o fruto favorito do nosso explorador?",
      correct: "🍌",
      options: ["🧀", "🍌", "🦴"]
    }
  ];

  // Iniciar a missão baralhando os desafios para garantir dinamismo e variedade total
  const startMission = () => {
    const randomized = [...masterChallenges].sort(() => Math.random() - 0.5).slice(0, 3);
    setShuffledChallenges(randomized);
    setCurrentStep(0);
    setScore(0);
    setFeedback(null);
    setMissionComplete(false);
    setIsPlayingMission(true);
  };

  // Sons sintéticos avançados (Aconchegantes para crianças)
  const playSound = (type: 'click' | 'success' | 'wrong' | 'bgm') => {
    if (!isAudioEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(400, audioContext.currentTime);
        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        osc.start();
        osc.stop(audioContext.currentTime + 0.05);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioContext.currentTime); // Dó
        osc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // Mi
        osc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // Sol
        gain.gain.setValueAtTime(0.12, audioContext.currentTime);
        osc.start();
        osc.stop(audioContext.currentTime + 0.35);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(120, audioContext.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        osc.start();
        osc.stop(audioContext.currentTime + 0.25);
      }
    } catch (e) {
      console.log("Audio context error", e);
    }
  };

  const handleOptionClick = (option: string) => {
    const currentChallenge = shuffledChallenges[currentStep];
    if (option === currentChallenge.correct) {
      playSound('success');
      setFeedback("correct");
      setScore(score + 15);

      setTimeout(() => {
        setFeedback(null);
        if (currentStep + 1 < shuffledChallenges.length) {
          setCurrentStep(currentStep + 1);
        } else {
          setMissionComplete(true);
        }
      }, 900);
    } else {
      playSound('wrong');
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);
    }
  };

  return (
    <div className="w-full bg-transparent border border-white/25 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-[2px] text-center flex flex-col items-center gap-5 animate-fade-in text-white">
      
      {/* Cabeçalho do Jogo com Controlo de Som */}
      <div className="w-full flex justify-between items-center bg-black/40 px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold text-[#bef264]">
          <Sparkles className="size-4" /> Aventura: {partyData.partyName}
        </div>
        <button 
          onClick={() => { playSound('click'); setIsAudioEnabled(!isAudioEnabled); }}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
          title={isAudioEnabled ? "Desativar Som" : "Ativar Som"}
        >
          {isAudioEnabled ? <Volume2 className="size-4 text-[#bef264]" /> : <VolumeX className="size-4 text-red-400" />}
        </button>
      </div>

      {!isPlayingMission ? (
        // Menu Principal Dinâmico
        <div className="w-full flex flex-col gap-4">
          <div className="bg-black/30 p-5 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col items-center gap-2">
            <span className="text-3xl">🦖</span>
            <h2 className="text-base sm:text-lg font-black text-white">Olá, Explorador!</h2>
            <p className="text-xs text-white/80">
              O teu guia <strong className="text-[#bef264]">{partyData.characterName || "Mascote"}</strong> tem uma missão nova à tua espera!
            </p>
          </div>

          <button 
            onClick={() => { playSound('click'); startMission(); }}
            className="flex items-center justify-between p-4.5 rounded-2xl bg-[#bef264] text-black font-extrabold text-sm hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#bef264]/20 group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-black/10 text-black">
                <Trophy className="size-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Iniciar Nova Missão</h3>
                <p className="text-[11px] text-black/70 font-medium">Etapas dinâmicas e divertidas!</p>
              </div>
            </div>
            <ArrowRight className="size-5 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={onBackToMain}
            className="mt-1 text-xs text-white/70 hover:text-white underline cursor-pointer font-medium py-1"
          >
            Voltar ao menu anterior
          </button>
        </div>
      ) : !missionComplete ? (
        // Ecrã da Missão Ativa (Multietapas e Altamente Visual)
        <div className="w-full flex flex-col gap-4 animate-fade-in">
          
          {/* Barra de Progresso das Etapas */}
          <div className="flex items-center justify-between px-2 text-xs font-bold text-white/80">
            <span>Etapa {currentStep + 1} de {shuffledChallenges.length}</span>
            <span className="text-[#bef264]">Pontos: {score} 🌟</span>
          </div>

          {/* Pergunta Visual / Instrução do Mascote */}
          <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-md transition-all ${
            feedback === 'correct' ? 'bg-green-500/30 border-green-400 scale-105' :
            feedback === 'wrong' ? 'bg-red-500/30 border-red-400 animate-bounce' :
            'bg-black/40 border-white/20'
          }`}>
            <span className="text-[10px] uppercase tracking-wider text-[#bef264] font-bold block mb-1">
              {partyData.characterName || "Mascote"} diz:
            </span>
            <p className="text-sm sm:text-base font-bold text-white">
              {shuffledChallenges[currentStep]?.instruction}
            </p>
          </div>

          {/* Opções Grandes e Intuitivas para Crianças de 4 Anos (Baseadas em Emojis/Ícones) */}
          <div className="grid grid-cols-3 gap-3">
            {shuffledChallenges[currentStep]?.options.map((opt: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className="py-6 rounded-3xl bg-black/50 border border-white/25 hover:border-[#bef264] hover:bg-white/10 transition-all cursor-pointer text-4xl sm:text-5xl flex items-center justify-center shadow-lg active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsPlayingMission(false)}
            className="text-xs text-white/60 hover:text-white underline cursor-pointer mt-1"
          >
            Abandonar Missão
          </button>
        </div>
      ) : (
        // Ecrã de Conclusão da Missão com Parabéns
        <div className="bg-[#bef264]/20 border border-[#bef264] p-6 rounded-3xl flex flex-col items-center gap-3 animate-fade-in backdrop-blur-md shadow-xl">
          <CheckCircle className="size-12 text-[#bef264]" />
          <h3 className="font-black text-lg text-[#bef264]">Missão Cumprida com Sucesso! 🎉</h3>
          <p className="text-xs text-white/90">
            Fizeste um total de <strong className="text-[#bef264]">{score} pontos</strong> de explorador!
          </p>
          <div className="flex gap-2 w-full mt-2">
            <button 
              onClick={startMission}
              className="flex-1 py-3 rounded-xl bg-[#bef264] text-black font-extrabold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="size-4" /> Jogar Novamente (Nova Missão)
            </button>
            <button 
              onClick={() => setIsPlayingMission(false)}
              className="px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white font-bold text-xs hover:bg-black/60 transition-colors cursor-pointer"
            >
              Menu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
