import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Wand2, Hand } from 'lucide-react';

interface MagicalMissionProps {
  partyData: any;
  onUnlock: () => void;
  isReplay?: boolean;
}

export const MagicalMission: React.FC<MagicalMissionProps> = ({ partyData, onUnlock, isReplay = false }) => {
  const [phase, setPhase] = useState<'intro' | 'demo' | 'drawing' | 'success'>('intro');
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [magicPower, setMagicPower] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawing = useRef(false);

  const guestName = partyData?.guestName || "Amigo";
  const childName = partyData?.childName || "Aniversariante";

  const playAudio = (type: 'instruction' | 'success', text: string) => {
    window.speechSynthesis.cancel();
    const customUrl = type === 'instruction' ? partyData?.welcomeAudioUrl : partyData?.successAudioUrl;
    
    if (customUrl) {
      const audio = new Audio(customUrl);
      audio.play().catch(e => console.log("Erro no audio", e));
      return;
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Início da experiência
    const introText = isReplay 
      ? `Vamos despertar a magia de novo, ${guestName}! Desenhe a espiral mágica!`
      : `Oi, ${guestName}! Eu sou o ${childName} e deixei um poder mágico escondido aqui. Desenhe uma espiral com o dedo para despertá-la!`;
    
    playAudio('instruction', introText);
    
    const timer1 = setTimeout(() => setPhase('demo'), 2000);
    const timer2 = setTimeout(() => setPhase('drawing'), 6000);
    
    return () => { clearTimeout(timer1); clearTimeout(timer2); window.speechSynthesis.cancel(); };
  }, [isReplay]);

  // Função que captura o desenho do dedo/mouse
  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== 'drawing') return;
    isDrawing.current = true;
    addPoint(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || phase !== 'drawing') return;
    addPoint(e);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const addPoint = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPoints(prev => {
      const newPoints = [...prev, { x, y }];
      // A cada ponto adicionado, a "magia" aumenta. Cerca de 80-100 pontos disparam a vitória.
      const newPower = Math.min(100, (newPoints.length / 80) * 100);
      setMagicPower(newPower);
      
      if (newPower >= 100 && phase === 'drawing') {
        triggerSuccess();
      }
      return newPoints;
    });
  };

  const triggerSuccess = () => {
    setPhase('success');
    isDrawing.current = false;
    playAudio('success', `Uhuu! ${guestName}, você despertou a magia! Agora você tem o poder de liberar os jogos!`);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black/40 border border-white/20 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md flex flex-col items-center relative overflow-hidden animate-fade-in">
      
      {/* Avatar do Aniversariante Observando */}
      <div className={`relative transition-all duration-1000 ${phase === 'success' ? 'scale-110 -mt-8 mb-4' : '-mt-12 mb-4'}`}>
        <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 ${phase === 'success' ? 'border-[#bef264] shadow-[0_0_40px_#bef264]' : 'border-white/50'} bg-black/80 overflow-hidden flex items-center justify-center transition-all duration-700`}>
          {partyData.childAvatarUrl ? (
            <img src={partyData.childAvatarUrl} alt="Aniversariante" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">👑</span>
          )}
        </div>
      </div>

      {/* Instruções */}
      <div className="text-center mb-6 min-h-[4rem]">
        {phase === 'intro' && <h2 className="text-xl sm:text-2xl font-black text-white animate-pulse">A magia está adormecida...</h2>}
        {phase === 'demo' && <h2 className="text-xl sm:text-2xl font-black text-[#bef264]">Veja como fazer!</h2>}
        {phase === 'drawing' && <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">Desenhe a espiral mágica!</h2>}
        {phase === 'success' && <h2 className="text-2xl sm:text-3xl font-black text-[#bef264] drop-shadow-[0_0_10px_rgba(190,242,100,0.8)]">Magia Desperta!</h2>}
      </div>

      {/* Área Mágica de Desenho */}
      <div className="relative w-full aspect-square bg-black/50 rounded-3xl border-2 border-dashed border-white/30 overflow-hidden touch-none" style={{ touchAction: 'none' }}>
        
        {/* Fundo do Tema DENTRO da área de desenho (opcional, dá um efeito lindo) */}
        {partyData.photoUrl && (
           <div className={`absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen transition-opacity duration-1000 ${phase === 'success' ? 'opacity-100' : ''}`} style={{ backgroundImage: `url('${partyData.photoUrl}')` }} />
        )}

        {/* Barra de Progresso do Poder (Muda de cor conforme enche) */}
        {phase === 'drawing' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 z-10">
            <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-[#bef264] transition-all duration-200" style={{ width: `${magicPower}%` }} />
          </div>
        )}

        {/* Animação de Demonstração (Mão girando) */}
        {phase === 'demo' && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="animate-[spin_2s_linear_infinite] origin-center opacity-70">
              <div className="translate-y-8 animate-[ping_2s_ease-out_infinite]">
                <Hand className="text-white size-12" />
              </div>
            </div>
            <svg className="absolute inset-0 w-full h-full">
              <path d="M 150,150 m 0,-50 a 50,50 0 1,1 0,100 a 50,50 0 1,1 0,-100" fill="none" stroke="#bef264" strokeWidth="4" strokeDasharray="5,15" className="opacity-50 animate-[spin_10s_linear_infinite] origin-center" />
            </svg>
          </div>
        )}

        {/* Objeto Mágico (Aparece no sucesso) */}
        {phase === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center z-30 animate-[bounce_2s_ease-in-out_infinite]">
            <Sparkles className="text-[#bef264] size-32 drop-shadow-[0_0_30px_#bef264] animate-pulse" />
          </div>
        )}

        {/* Canvas de Interação (onde a criança desenha) */}
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full z-40 cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Rastro Luminoso Desenhado pela Criança */}
          {points.length > 1 && (
            <polyline 
              points={points.map(p => `${p.x},${p.y}`).join(' ')} 
              fill="none" 
              stroke={phase === 'success' ? '#bef264' : '#a78bfa'} 
              strokeWidth={phase === 'success' ? '12' : '8'} 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="drop-shadow-[0_0_15px_rgba(190,242,100,0.8)] transition-all duration-300"
            />
          )}
        </svg>

      </div>

      {/* Botão de Desbloqueio Final */}
      {phase === 'success' && (
        <button
          onClick={onUnlock}
          className="mt-6 w-full py-4 px-6 rounded-2xl bg-[#bef264] text-black font-black text-lg tracking-wide hover:opacity-95 shadow-[0_0_30px_rgba(190,242,100,0.6)] flex items-center justify-center gap-2 transform active:scale-95 animate-[bounce_1s_ease-out]"
        >
          <Wand2 className="size-6" /> {isReplay ? "VOLTAR AOS JOGOS" : "DESBLOQUEAR OS JOGOS"}
        </button>
      )}

      {/* Botão de Repetir a Instrução se estiver parada */}
      {phase === 'drawing' && (
        <button 
          onClick={() => {
             setPoints([]); setMagicPower(0);
             setPhase('demo');
             playAudio('instruction', "Vamos tentar de novo! Desenhe a espiral mágica com o dedo!");
             setTimeout(() => setPhase('drawing'), 3000);
          }}
          className="mt-6 text-sm text-white/60 underline hover:text-white"
        >
          Ouvir instrução de novo
        </button>
      )}
    </div>
  );
};
