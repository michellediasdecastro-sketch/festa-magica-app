import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Wand2, Hand, Volume2 } from 'lucide-react';

interface MagicalMissionProps {
  partyData: any;
  onUnlock: () => void;
  isReplay?: boolean;
}

export const MagicalMission: React.FC<MagicalMissionProps> = ({ partyData, onUnlock, isReplay = false }) => {
  const [phase, setPhase] = useState<'story' | 'demo' | 'drawing' | 'success'>('story');
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [magicPower, setMagicPower] = useState(0);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawing = useRef(false);

  const guestName = partyData?.guestName || "Amigo";
  const childName = partyData?.childName || "Aniversariante";

  // TEXTOS DA NARRATIVA
  const storyText = isReplay 
    ? `Vamos fazer a magia acontecer de novo, ${guestName}? Desenhe a espiral mágica!`
    : `${childName} descobriu que existe um gesto mágico capaz de liberar as brincadeiras com um feitiço muito especial! E deixou a magia escondida por todo o cenário e precisa que você a desperte. Vamos fazer a magia acontecer?`;

  const instructionText = "Coloque o dedo na tela e desenhe a espiral para despertar o poder!";
  const successTextFallback = `${guestName}, você conseguiu! Divirta-se com os jogos que o ${childName} preparou para você.`;

  // MOTOR DE ÁUDIO REVISADO (Narrador vs Aniversariante)
  const playAudio = (type: 'story' | 'instruction' | 'success', text: string) => {
    window.speechSynthesis.cancel();
    
    // Sucesso: Tenta tocar a voz real do aniversariante (PLANO A)
    if (type === 'success' && partyData?.successAudioUrl) {
      const audio = new Audio(partyData.successAudioUrl);
      audio.play().catch(e => console.log("Erro no audio do aniversariante", e));
      return;
    }
    
    // História, Dicas ou Sucesso sem áudio (PLANO B): Usa o Narrador do Sistema
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // CRONOGRAMA DA CENA MÁGICA
  useEffect(() => {
    playAudio('story', storyText);
    
    const timer1 = setTimeout(() => {
      setPhase('demo');
      playAudio('instruction', instructionText);
    }, 12000); // Dá tempo do narrador ler a história maior

    const timer2 = setTimeout(() => {
      setPhase('drawing');
    }, 17000); 

    return () => { clearTimeout(timer1); clearTimeout(timer2); window.speechSynthesis.cancel(); };
  }, [isReplay]);

  // SISTEMA DE AJUDA AUTOMÁTICA (IDLE TIMER)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    
    if (phase === 'drawing' && magicPower === 0) {
      idleTimer = setTimeout(() => {
         setPhase('demo');
         playAudio('instruction', instructionText);
         
         setTimeout(() => {
           setPhase('drawing');
         }, 4000);
      }, 10000);
    }
    
    return () => clearTimeout(idleTimer);
  }, [phase, magicPower]);

  // CAPTURA DO DESENHO MÁGICO
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
    // O playAudio vai decidir se usa o áudio gravado (Plano A) ou a fala do Narrador (Plano B)
    playAudio('success', successTextFallback);
  };

  const handleRepeatStory = () => {
    setPhase('story');
    setPoints([]);
    setMagicPower(0);
    playAudio('story', storyText);
    setTimeout(() => { setPhase('demo'); playAudio('instruction', instructionText); }, 12000);
    setTimeout(() => setPhase('drawing'), 17000);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black/40 border border-white/20 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md flex flex-col items-center relative overflow-hidden animate-fade-in min-h-[450px]">
      
      {/* ------------------------------------------------------------------ */}
      {/* CENA 1: MISSÃO E DESENHO (Ocultada quando vence)                     */}
      {/* ------------------------------------------------------------------ */}
      {phase !== 'success' && (
        <div className="w-full flex flex-col items-center animate-fade-in">
          
          {/* Avatar no Topo (Silencioso, apenas decorativo) */}
          <div className="relative -mt-12 mb-4 z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/50 bg-black/80 overflow-hidden flex items-center justify-center shadow-xl">
              {partyData.childAvatarUrl ? (
                <img src={partyData.childAvatarUrl} alt="Aniversariante" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👑</span>
              )}
            </div>
          </div>

          {/* Texto do Narrador */}
          <div className={`w-full transition-all duration-500 min-h-[5rem] flex flex-col items-center ${phase === 'story' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="bg-white/10 border border-white/20 text-white p-4 rounded-3xl mb-4 text-center">
              <p className="text-sm sm:text-[15px] font-medium leading-snug drop-shadow-md">
                "{storyText}"
              </p>
            </div>
          </div>

          <div className={`text-center mb-4 min-h-[2.5rem] flex items-center justify-center transition-all ${phase === 'story' ? 'hidden' : ''}`}>
            {phase === 'demo' && <h2 className="text-xl font-black text-[#bef264] animate-pulse">Veja como fazer!</h2>}
            {phase === 'drawing' && <h2 className="text-xl font-black text-white drop-shadow-md">Desenhe a espiral mágica!</h2>}
          </div>

          {/* Botão de Som da Instrução */}
          {(phase === 'demo' || phase === 'drawing') && (
            <button onClick={handleRepeatStory} className="absolute top-4 right-4 p-3 bg-black/50 border border-white/30 rounded-full hover:bg-white/20 transition-all shadow-lg text-[#bef264] z-50">
              <Volume2 size={20} />
            </button>
          )}

          {/* Área Mágica de Desenho */}
          <div className="relative w-full aspect-square bg-black/50 rounded-3xl border-2 border-dashed border-white/30 overflow-hidden touch-none" style={{ touchAction: 'none' }}>
            
            {partyData.photoUrl && (
               <div className="absolute inset-0 bg-cover bg-center mix-blend-screen opacity-30" style={{ backgroundImage: `url('${partyData.photoUrl}')` }} />
            )}

            {phase === 'drawing' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/60 rounded-full overflow-hidden border border-white/20 z-10">
                <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-[#bef264] transition-all duration-200" style={{ width: `${magicPower}%` }} />
              </div>
            )}

            {phase === 'demo' && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="animate-[spin_2s_linear_infinite] origin-center opacity-80">
                  <div className="translate-y-8 animate-[ping_2s_ease-out_infinite]"><Hand className="text-white size-14" /></div>
                </div>
                <svg className="absolute inset-0 w-full h-full">
                  <path d="M 150,150 m 0,-50 a 50,50 0 1,1 0,100 a 50,50 0 1,1 0,-100" fill="none" stroke="#bef264" strokeWidth="4" strokeDasharray="10,15" className="opacity-60 animate-[spin_10s_linear_infinite] origin-center" />
                </svg>
              </div>
            )}

            <svg 
              ref={svgRef}
              className={`absolute inset-0 w-full h-full z-40 ${phase === 'drawing' ? 'cursor-crosshair' : 'pointer-events-none'}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {points.length > 1 && (
                <polyline 
                  points={points.map(p => `${p.x},${p.y}`).join(' ')} 
                  fill="none" 
                  stroke="#a78bfa" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_15px_rgba(190,242,100,0.8)]"
                />
              )}
            </svg>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CENA 2: SUCESSO (Avatar na tela toda e áudio de parabéns)           */}
      {/* ------------------------------------------------------------------ */}
      {phase === 'success' && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 animate-fade-in rounded-[2.5rem]">
          
          <Sparkles className="absolute top-10 text-[#bef264] size-32 drop-shadow-[0_0_40px_#bef264] opacity-20 animate-[spin_10s_linear_infinite]" />
          
          {/* Avatar GIGANTE do aniversariante */}
          <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full border-8 border-[#bef264] bg-black/80 overflow-hidden flex items-center justify-center shadow-[0_0_80px_rgba(190,242,100,0.5)] mb-8 animate-[bounce_2s_ease-in-out_infinite]">
            {partyData.childAvatarUrl ? (
              <img src={partyData.childAvatarUrl} alt="Aniversariante" className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">👑</span>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#bef264] drop-shadow-lg mb-8 text-center z-10 uppercase tracking-widest">
            Magia Desperta!
          </h2>

          {/* Plano B Escrito na tela caso o áudio não chame a atenção */}
          {!partyData.successAudioUrl && (
            <p className="text-white/80 text-center mb-8 font-medium px-4 text-sm z-10">
              {successTextFallback}
            </p>
          )}

          <button
            onClick={onUnlock}
            className="w-full py-4 px-6 rounded-2xl bg-[#bef264] text-black font-black text-lg tracking-wide hover:opacity-95 shadow-[0_0_40px_rgba(190,242,100,0.8)] flex items-center justify-center gap-3 transform active:scale-95 z-10"
          >
            <Wand2 className="size-8" /> {isReplay ? "VOLTAR AOS JOGOS" : "DESBLOQUEAR OS JOGOS"}
          </button>

        </div>
      )}

    </div>
  );
};
