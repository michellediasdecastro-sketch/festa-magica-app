import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface MagicalMissionProps {
  partyData: any;
  onUnlock: () => void;
  isReplay?: boolean;
}

export const MagicalMission: React.FC<MagicalMissionProps> = ({ partyData, onUnlock, isReplay = false }) => {
  const [phase, setPhase] = useState<'story' | 'interaction' | 'opening' | 'success'>('story');
  
  // Posições das partículas mágicas pela tela
  const [particles, setParticles] = useState([
    { id: 1, top: '15%', left: '25%', gathered: false },
    { id: 2, top: '30%', left: '80%', gathered: false },
    { id: 3, top: '55%', left: '15%', gathered: false },
    { id: 4, top: '75%', left: '75%', gathered: false },
    { id: 5, top: '85%', left: '30%', gathered: false },
  ]);

  const guestName = partyData?.guestName || "Amigo";
  const childName = partyData?.childName || "Aniversariante";
  const theme = partyData?.theme || "Mundo Mágico";

  // TEXTOS
  const storyText = isReplay 
    ? `Vamos brincar de novo, ${guestName}? Ajude a despertar o poder do portal novamente!`
    : `O ${childName} descobriu um portal secreto no ${theme}! Mas a magia que o mantém aberto desapareceu. Ajude a despertar o poder do portal!`;
  
  const instructionText = "Toque nas luzes mágicas para enviar energia ao portal!";
  const successTextFallback = `Você conseguiu! O portal está aberto! Você desbloqueou os jogos!`;

  // MOTOR DE ÁUDIO COM TRANSIÇÃO AUTOMÁTICA (onEnd)
  const playAudio = (type: 'story' | 'instruction' | 'success', text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    
    // Sucesso: Tenta tocar a voz real do aniversariante (PLANO A)
    if (type === 'success' && partyData?.successAudioUrl) {
      const audio = new Audio(partyData.successAudioUrl);
      audio.onended = () => { if (onEnd) onEnd(); };
      audio.play().catch(e => {
        console.log("Erro no audio do aniversariante", e);
        if (onEnd) setTimeout(onEnd, 4000); // Fallback se o áudio falhar
      });
      return;
    }
    
    // História ou Sucesso sem áudio (PLANO B): Usa o Narrador do Sistema
    if ('speechSynthesis' in window) {
      let ended = false;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.onend = () => { 
        if (!ended) { ended = true; if (onEnd) onEnd(); }
      };
      utterance.onerror = () => { 
        if (!ended) { ended = true; if (onEnd) setTimeout(onEnd, 3000); }
      };
      window.speechSynthesis.speak(utterance);
      
      // Fallback de segurança caso o navegador bloqueie o evento onend
      setTimeout(() => {
         if (!ended) { ended = true; if (onEnd) onEnd(); }
      }, type === 'story' ? 12000 : 5000);
    } else {
      if (onEnd) setTimeout(onEnd, 4000);
    }
  };

  // FLUXO PRINCIPAL: HISTÓRIA -> INTERAÇÃO
  useEffect(() => {
    playAudio('story', storyText, () => {
      setPhase('interaction');
      playAudio('instruction', instructionText);
    });
    return () => window.speechSynthesis.cancel();
  }, [isReplay]);

  // VERIFICA SE TODAS AS PARTÍCULAS FORAM COLETADAS
  useEffect(() => {
    if (phase === 'interaction' && particles.every(p => p.gathered)) {
      setPhase('opening'); // O Portal treme e brilha
      
      // Espera 2.5 segundos de animação do portal abrindo e vai para o sucesso
      setTimeout(() => {
        setPhase('success');
        
        // Toca o áudio de sucesso. Quando acabar, ENTRA DIRETO NOS JOGOS!
        playAudio('success', successTextFallback, () => {
          onUnlock();
        });
      }, 2500);
    }
  }, [particles, phase]);

  const gatherParticle = (id: number) => {
    if (phase !== 'interaction') return;
    setParticles(prev => prev.map(p => p.id === id ? { ...p, gathered: true } : p));
  };

  return (
    // fixed inset-0 garante que ocupe a TELA INTEIRA passando por cima de qualquer margem do App.tsx
    // Sem bg-black/40 para não ter o "retângulo" cinzento! O fundo será a própria imagem da festa (que já está no App.tsx)
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden touch-none">
      
      {/* ------------------------------------------------------------------ */}
      {/* CENA 1 e 2: NARRATIVA E PORTAL (Ocultado no final)                 */}
      {/* ------------------------------------------------------------------ */}
      {phase !== 'success' && (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
          
          {/* Textos da Narrativa (flutuando na tela sem fundo opaco) */}
          <div className="absolute top-12 md:top-20 px-6 w-full max-w-2xl text-center z-20 pointer-events-none transition-all duration-700">
            {phase === 'story' && (
              <h2 className="text-xl md:text-3xl font-black text-white leading-tight drop-shadow-[0_2px_15px_rgba(0,0,0,1)] animate-fade-in">
                "{storyText}"
              </h2>
            )}
            {phase === 'interaction' && (
              <h2 className="text-2xl md:text-4xl font-black text-[#bef264] drop-shadow-[0_2px_15px_rgba(0,0,0,1)] animate-pulse">
                Toque nas luzes para abrir o portal!
              </h2>
            )}
          </div>

          {/* O PORTAL CENTRAL */}
          <div className={`absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-transparent transition-all duration-1000 flex items-center justify-center z-10
            -translate-x-1/2 -translate-y-1/2
            ${phase === 'story' ? 'opacity-30 scale-75' : 'opacity-100 scale-100'}
            ${phase === 'opening' ? 'animate-portal-shake border-[#bef264] shadow-[0_0_150px_rgba(190,242,100,1)] scale-125 bg-white/20' : 'border-white/20'}
          `}>
            {/* Efeito Giratório dentro do Portal */}
            <div className={`w-full h-full rounded-full border-[8px] border-dashed border-[#bef264]/60 animate-[spin_8s_linear_infinite] transition-all duration-1000 ${phase === 'opening' ? 'border-[#bef264]' : ''}`} />
            
            {/* Brilho interior intenso ao abrir */}
            {phase === 'opening' && (
              <Sparkles className="absolute text-white size-24 animate-pulse drop-shadow-[0_0_20px_#fff]" />
            )}
          </div>

          {/* AS PARTÍCULAS LUMINOSAS */}
          {particles.map(p => (
            <div
              key={p.id}
              onClick={() => gatherParticle(p.id)}
              onPointerDown={() => gatherParticle(p.id)} // Funciona com toque rápido também
              style={{
                top: p.gathered ? '50%' : p.top,
                left: p.gathered ? '50%' : p.left,
                transform: p.gathered ? 'translate(-50%, -50%) scale(0)' : 'translate(-50%, -50%) scale(1)',
                opacity: phase === 'story' ? 0 : (p.gathered ? 0 : 1)
              }}
              className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full cursor-pointer z-30 transition-all duration-700 ease-in flex items-center justify-center
                         bg-gradient-to-tr from-[#bef264] to-white shadow-[0_0_30px_#bef264] animate-pulse"
            >
              <Sparkles className="text-black/50 size-5" />
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CENA 3: RECOMPENSA E DESBLOQUEIO (Avatar Gigante)                  */}
      {/* ------------------------------------------------------------------ */}
      {phase === 'success' && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
          
          <Sparkles className="absolute top-1/4 text-[#bef264] size-40 drop-shadow-[0_0_50px_#bef264] opacity-30 animate-[spin_10s_linear_infinite]" />
          
          {/* Avatar na TELA INTEIRA (Gigante) */}
          <div className="relative z-10 w-56 h-56 md:w-72 md:h-72 rounded-full border-[10px] border-[#bef264] bg-black/80 overflow-hidden flex items-center justify-center shadow-[0_0_100px_rgba(190,242,100,0.6)] mb-8 animate-[bounce_2s_ease-in-out_infinite]">
            {partyData.childAvatarUrl ? (
              <img src={partyData.childAvatarUrl} alt="Aniversariante" className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl">👑</span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_5px_15px_rgba(0,0,0,1)] text-center z-10 leading-tight">
            Você conseguiu!<br/>
            <span className="text-[#bef264]">O portal está aberto!</span>
          </h1>

          {!partyData.successAudioUrl && (
             <p className="text-white/60 text-center mt-4 font-medium text-sm md:text-base z-10">
               {successTextFallback}
             </p>
          )}

          {/* O sistema já vai entrar direto pelo onUnlock, mas deixamos um aviso discreto ou botão de fallback caso a internet trave o áudio */}
          <div className="mt-12 opacity-50 animate-pulse text-xs uppercase tracking-widest z-10">
            Entrando nos jogos...
          </div>
        </div>
      )}

      {/* Estilos customizados para a vibração do portal */}
      <style>{`
        @keyframes portal-shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1.25); }
          25% { transform: translate(-52%, -48%) rotate(-2deg) scale(1.25); }
          50% { transform: translate(-48%, -52%) rotate(2deg) scale(1.25); }
          75% { transform: translate(-52%, -52%) rotate(-2deg) scale(1.25); }
        }
        .animate-portal-shake {
          animation: portal-shake 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
