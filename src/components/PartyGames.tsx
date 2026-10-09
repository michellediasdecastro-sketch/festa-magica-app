import { useState } from "react";
import { Sparkles, Trophy, Volume2, VolumeX, ArrowRight, CheckCircle2 } from "lucide-react";

interface PartyGamesProps {
  partyData: any;
  onBackToMain: () => void;
}

export function PartyGames({ partyData, onBackToMain }: PartyGamesProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const playSound = (type: 'click' | 'success') => {
    if (!isAudioEnabled) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'click') {
      osc.frequency.setValueAtTime(400, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      osc.start();
      osc.stop(audioContext.currentTime + 0.08);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(600, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      osc.start();
      osc.stop(audioContext.currentTime + 0.2);
    }
  };

  const handleCorrectAnswer = () => {
    playSound('success');
    setScore(score + 10);
    setGameCompleted(true);
  };

  return (
    <div className="w-full bg-transparent border border-white/25 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-[2px] text-center flex flex-col items-center gap-5 animate-fade-in text-white">
      
      {/* Cabeçalho do Jogo com Controlo de Som */}
      <div className="w-full flex justify-between items-center bg-black/40 px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold text-[#bef264]">
          <Sparkles className="size-4" /> Jogos: {partyData.partyName}
        </div>
        <button 
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
          title={isAudioEnabled ? "Desativar Som" : "Ativar Som"}
        >
          {isAudioEnabled ? <Volume2 className="size-4 text-[#bef264]" /> : <VolumeX className="size-4 text-red-400" />}
        </button>
      </div>

      {!activeGame ? (
        // Menu de Seleção de Jogos Adaptados à Idade
        <div className="w-full flex flex-col gap-4">
          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <h2 className="text-base sm:text-lg font-black text-white">Bem-vindo, Explorador!</h2>
            <p className="text-xs text-white/80 mt-1">
              O teu guia <strong className="text-[#bef264]">{partyData.characterName || "Mascote"}</strong> preparou desafios incríveis!
            </p>
            <div className="mt-2 text-[11px] text-[#bef264] font-bold">
              Pontuação Atual: {score} pts 🌟
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => { playSound('click'); setActiveGame('quiz'); setGameCompleted(false); }}
              className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/20 hover:border-[#bef264] transition-all cursor-pointer group shadow-md backdrop-blur-md"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 rounded-xl bg-[#bef264]/20 text-[#bef264]">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm group-hover:text-[#bef264] transition-colors">Missão: O Tesouro Perdido</h3>
                  <p className="text-[11px] text-white/70">Desafio interativo do mascote</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-white/50 group-hover:text-[#bef264] transition-colors" />
            </button>
          </div>

          <button 
            onClick={onBackToMain}
            className="mt-2 text-xs text-white/70 hover:text-white underline cursor-pointer font-medium py-1"
          >
            Voltar ao menu anterior
          </button>
        </div>
      ) : (
        // Ecrã do Minijogo Ativo
        <div className="w-full flex flex-col gap-4 animate-fade-in">
          <div className="bg-black/40 p-5 rounded-2xl border border-white/20 text-left backdrop-blur-md shadow-md">
            <span className="text-[10px] uppercase tracking-wider text-[#bef264] font-bold block mb-1">
              Desafio de {partyData.characterName || "Mascote"} 🦖
            </span>
            <p className="text-sm font-medium text-white">
              "Conseguem descobrir qual é a cor principal da nossa aventura de hoje?"
            </p>
          </div>

          {!gameCompleted ? (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleCorrectAnswer}
                className="p-4 rounded-2xl bg-black/40 border border-white/20 hover:bg-[#bef264]/20 hover:border-[#bef264] transition-all cursor-pointer text-sm font-bold flex flex-col items-center gap-2 backdrop-blur-md shadow-md"
              >
                <span className="text-xl">🌿</span> Verde Floresta
              </button>
              <button 
                onClick={() => playSound('click')}
                className="p-4 rounded-2xl bg-black/40 border border-white/20 hover:bg-white/10 transition-all cursor-pointer text-sm font-bold flex flex-col items-center gap-2 backdrop-blur-md shadow-md"
              >
                <span className="text-xl">❄️</span> Azul Gelo
              </button>
            </div>
          ) : (
            <div className="bg-[#bef264]/20 border border-[#bef264] p-5 rounded-2xl flex flex-col items-center gap-3 animate-fade-in backdrop-blur-md shadow-lg">
              <CheckCircle2 className="size-10 text-[#bef264]" />
              <h3 className="font-bold text-base text-[#bef264]">Missão Concluída!</h3>
              <p className="text-xs text-white/90">Ganhaste +10 pontos de explorador!</p>
              <button 
                onClick={() => setActiveGame(null)}
                className="px-5 py-2 rounded-xl bg-[#bef264] text-black font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer mt-1 shadow-md"
              >
                Jogar Novamente / Outro Jogo
              </button>
            </div>
          )}

          {!gameCompleted && (
            <button 
              onClick={() => setActiveGame(null)}
              className="text-xs text-white/70 hover:text-white underline cursor-pointer mt-2"
            >
              Sair do Jogo
            </button>
          )}
        </div>
      )}

    </div>
  );
}
