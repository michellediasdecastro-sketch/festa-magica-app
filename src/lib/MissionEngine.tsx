import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

// Tipos de Mecânicas
type MechanicType = 'FIND' | 'ODD_ONE_OUT' | 'SEQUENCE' | 'COUNT' | 'SHADOW';

export interface MissionDef {
  id: number;
  mechanic: MechanicType;
  title: string;
  instruction: string;
}

// Gera o Catálogo de 50 Missões Variadas
export const getMissionCatalog = (): MissionDef[] => {
  const catalog: MissionDef[] = [];
  const mechanics: MechanicType[] = ['FIND', 'ODD_ONE_OUT', 'SEQUENCE', 'COUNT', 'SHADOW'];
  
  for (let i = 1; i <= 50; i++) {
    const mechanic = mechanics[i % mechanics.length];
    let title = "";
    let instruction = "";

    switch (mechanic) {
      case 'FIND':
        title = "Busca Rápida";
        instruction = "Encontre o objeto correto que está escondido!";
        break;
      case 'ODD_ONE_OUT':
        title = "O Intruso";
        instruction = "Qual destas imagens é diferente das outras?";
        break;
      case 'SEQUENCE':
        title = "Lógica Visual";
        instruction = "O que vem a seguir nesta sequência?";
        break;
      case 'COUNT':
        title = "Contagem Mágica";
        instruction = "Quantos objetos deste tipo você consegue ver?";
        break;
      case 'SHADOW':
        title = "Sombra Misteriosa";
        instruction = "De quem é esta sombra?";
        break;
    }

    catalog.push({ id: i, mechanic, title, instruction });
  }
  return catalog;
};

// Componente Visual da Missão que processa as lógicas
export const InteractiveMission: React.FC<{
  mission: MissionDef;
  images: string[];
  onSuccess: () => void;
}> = ({ mission, images, onSuccess }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [answer, setAnswer] = useState<any>(null);
  const [errorShake, setErrorShake] = useState(false);
  const fallbackImages = images.length >= 3 ? images : ["🍎", "⭐", "🎈", "🚗"];

  useEffect(() => {
    // Constrói a missão com base na mecânica
    const shuffled = [...fallbackImages].sort(() => Math.random() - 0.5);
    const target = shuffled[0];

    if (mission.mechanic === 'FIND' || mission.mechanic === 'SHADOW') {
      const opts = [target, shuffled[1], shuffled[2]].sort(() => Math.random() - 0.5);
      setOptions(opts);
      setAnswer(target);
    } 
    else if (mission.mechanic === 'ODD_ONE_OUT') {
      const opts = [shuffled[1], shuffled[1], shuffled[1], target].sort(() => Math.random() - 0.5);
      setOptions(opts);
      setAnswer(target); // O target é o intruso
    }
    else if (mission.mechanic === 'COUNT') {
      const count = Math.floor(Math.random() * 3) + 2; // 2 a 4
      setAnswer(count);
      setOptions([count - 1, count, count + 1].sort(() => Math.random() - 0.5));
    }
    else if (mission.mechanic === 'SEQUENCE') {
      // Ex: A B A B ? -> Answer is A
      setOptions([shuffled[0], shuffled[1], shuffled[2]].sort(() => Math.random() - 0.5));
      setAnswer(shuffled[0]);
    }
  }, [mission.id, images]);

  const handleSelect = (opt: any) => {
    if (opt === answer) {
      onSuccess();
    } else {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const renderItem = (item: any, isShadow = false) => {
    if (typeof item === 'number') return <span className="text-4xl font-black">{item}</span>;
    if (item.startsWith('http')) {
      return <img src={item} alt="item" className={`w-16 h-16 object-contain ${isShadow ? 'brightness-0 opacity-70' : 'drop-shadow-md'}`} />;
    }
    return <span className={`text-5xl ${isShadow ? 'brightness-0 opacity-70' : ''}`}>{item}</span>;
  };

  return (
    <div className={`w-full flex flex-col items-center gap-6 mt-4 ${errorShake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
      
      {/* Área de Contexto da Missão */}
      <div className="w-full bg-black/40 border border-white/20 p-4 rounded-3xl flex items-center justify-center min-h-[6rem]">
        {mission.mechanic === 'SHADOW' && renderItem(answer, true)}
        {mission.mechanic === 'ODD_ONE_OUT' && <span className="text-white/80 font-bold">Encontre o Intruso!</span>}
        {mission.mechanic === 'COUNT' && (
          <div className="flex gap-2">
            {Array.from({ length: answer }).map((_, i) => <div key={i}>{renderItem(fallbackImages[0])}</div>)}
          </div>
        )}
        {mission.mechanic === 'SEQUENCE' && (
          <div className="flex gap-2 items-center">
            {renderItem(fallbackImages[0])} {renderItem(fallbackImages[1])} {renderItem(fallbackImages[0])} {renderItem(fallbackImages[1])} <span className="text-3xl text-[#bef264]">?</span>
          </div>
        )}
        {mission.mechanic === 'FIND' && (
           <div className="flex flex-col items-center">
             <span className="text-xs text-white/50 mb-2">Procure por:</span>
             {renderItem(answer)}
           </div>
        )}
      </div>

      {/* Botões de Resposta */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(opt)}
            className="aspect-square bg-black/60 border border-white/30 rounded-3xl hover:border-[#bef264] flex items-center justify-center active:scale-95 transition-all shadow-xl"
          >
            {renderItem(opt)}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          50% { transform: translateX(5px) rotate(5deg); }
          75% { transform: translateX(-5px) rotate(-5deg); }
        }
      `}</style>
    </div>
  );
};
