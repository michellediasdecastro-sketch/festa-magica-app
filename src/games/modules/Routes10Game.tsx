import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

const generateRoutes10Challenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  const source = context.gameImages.length >= 3 ? context.gameImages : ["🍎", "⭐", "🚗"];
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  
  const pointC = shuffled[0]; // Destino final
  
  // Distâncias aleatórias
  const distAB = Math.floor(Math.random() * 20) + 10;
  const distBC = Math.floor(Math.random() * 25) + 15;
  const distDirect = distAB + distBC - (Math.floor(Math.random() * 10) + 2); // Caminho direto é ligeiramente mais curto, mas a missão pede com escala
  
  const answer = distAB + distBC; // A rota solicitada é A -> B -> C

  const optionsSet = new Set<number>([answer, distDirect, distAB, distBC]);
  while (optionsSet.size < 4) {
    const wrong = answer + (Math.floor(Math.random() * 15) - 7);
    if (wrong > 0 && !optionsSet.has(wrong)) optionsSet.add(wrong);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `routes10-${Date.now()}-${Math.random()}`,
    instruction: "Calcule a Rota Completa!",
    spokenText: "Precisamos chegar ao destino final, mas fazendo uma paragem no meio do caminho. Qual é a distância total?",
    data: { distAB, distBC, distDirect, pointC, options, answer }
  };
};

const Routes10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { distAB, distBC, distDirect, pointC, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="bg-black/40 p-6 rounded-3xl border border-white/20 w-full shadow-inner flex flex-col gap-4 relative">
        <h4 className="text-[#bef264] font-black text-sm uppercase tracking-widest text-center">Mapa de Navegação</h4>
        
        {/* Grafo Visual da Rota */}
        <div className="relative h-32 w-full mt-4">
          <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 border-2 border-white/40 rounded-full flex items-center justify-center font-bold text-xl z-10">A</div>
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 border-2 border-white/40 rounded-full flex items-center justify-center font-bold text-xl z-10">B</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#bef264]/20 border-2 border-[#bef264] rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_rgba(190,242,100,0.3)]">
            {pointC.startsWith('http') ? (
              <img src={pointC} alt="C" className="w-3/4 h-3/4 object-contain drop-shadow-md pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            ) : <span className="text-3xl pointer-events-none">{pointC}</span>}
          </div>

          {/* Linhas de conexão */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {/* A para B */}
            <line x1="15%" y1="20%" x2="85%" y2="20%" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeDasharray="6 6" />
            <text x="50%" y="15%" fill="rgba(255,255,255,0.7)" fontSize="14" textAnchor="middle" fontWeight="bold">{distAB} km</text>
            
            {/* B para C */}
            <line x1="85%" y1="20%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeDasharray="6 6" />
            <text x="75%" y="60%" fill="rgba(255,255,255,0.7)" fontSize="14" textAnchor="middle" fontWeight="bold">{distBC} km</text>
            
            {/* A para C (Direto) */}
            <line x1="15%" y1="20%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <text x="25%" y="60%" fill="rgba(255,255,255,0.3)" fontSize="12" textAnchor="middle">{distDirect} km</text>
          </svg>
        </div>

        <div className="bg-black/50 p-3 rounded-xl border border-white/10 mt-2 text-center text-white/80 font-medium">
          Missão: Viajar de <strong className="text-white">A</strong> até ao <strong className="text-[#bef264]">Destino Final</strong>, com paragem obrigatória em <strong className="text-white">B</strong>.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt: number, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 45)}
            className="py-4 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] transition-all text-3xl sm:text-4xl font-black shadow-xl active:scale-95 text-white"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Routes10GameModule: GameModule = {
  id: "routes-planning-10",
  title: "Planeamento de Rotas",
  categoryId: "rotas-10",
  supportedAges: ["10-11"],
  generateChallenge: generateRoutes10Challenge,
  component: Routes10Component
};
