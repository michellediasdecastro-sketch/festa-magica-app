import { useState } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { Sparkles, Cake, Users, Trophy } from "lucide-react";

// Função para escolher o fundo ideal com base no tema da festa
function getThemeBackground(themeName: string) {
  const theme = (themeName || "").toLowerCase();
  
  if (theme.includes("dinossauro") || theme.includes("t-rex") || theme.includes("jurassico")) {
    // Cenário perfeito de dinossauros / floresta tropical pré-histórica
    return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("frozen") || theme.includes("gelo") || theme.includes("neve")) {
    return "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("espacio") || theme.includes("astronauta") || theme.includes("galaxia")) {
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("safari") || theme.includes("selva") || theme.includes("animais")) {
    return "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1920&auto=format&fit=crop";
  }
  
  // Fundo padrão de floresta encantada para festas gerais
  return "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=1920&auto=format&fit=crop";
}

export function App() {
  const [partyData, setPartyData] = useState<any>(null);

  // Fundo dinâmico: se estiver na tela inicial, usa uma floresta mágica genérica; se entrou na festa, usa o do tema
  const bgImage = partyData 
    ? getThemeBackground(partyData.theme) 
    : "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=1920&auto=format&fit=crop";

  return (
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 text-white overflow-x-hidden overflow-y-auto">
      {/* Imagem de Fundo Adaptada (Responsiva e cobrindo todo o ecrã) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-75 scale-105 transition-all duration-700"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      
      {/* Camada escura translúcida equilibrada para contraste e legibilidade em telemóvel/PC */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Conteúdo Principal */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex items-center justify-center my-auto">
        {!partyData ? (
          <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
        ) : (
          <div className="w-full bg-black/50 border border-white/20 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center gap-5 sm:gap-6 animate-fade-in">
            
            {/* Cabeçalho do Tema */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-white/25 text-[#a3e635] text-xs sm:text-sm font-bold tracking-wider uppercase shadow-inner">
              <Sparkles className="size-4" /> Tema: {partyData.theme}
            </div>

            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl">🎉</div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                Bem-vindo à festa de {partyData.birthdayChildName}!
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 my-1 w-full">
              <div className="flex items-center justify-center gap-3 bg-black/40 border border-white/15 px-4 py-3 rounded-2xl text-sm sm:text-base backdrop-blur-md shadow-sm flex-1">
                <Cake className="size-5 text-[#a3e635] shrink-0" />
                <span>Idade: <strong className="text-[#a3e635]">{partyData.childAge} anos</strong></span>
              </div>

              <div className="flex items-center justify-center gap-3 bg-black/40 border border-white/15 px-4 py-3 rounded-2xl text-sm sm:text-base backdrop-blur-md shadow-sm flex-1">
                <Users className="size-5 text-[#a3e635] shrink-0" />
                <span>Convidado: <strong className="text-[#a3e635]">{partyData.ageGroup}</strong></span>
              </div>
            </div>

            {partyData.characterName && (
              <div className="flex items-center justify-center gap-2 bg-black/40 border border-white/15 px-5 py-3 rounded-2xl text-white/90 text-sm sm:text-base w-full shadow-inner">
                <Trophy className="size-5 text-[#a3e635] shrink-0" />
                <span>Destaque: <span className="text-[#a3e635] font-bold">{partyData.characterName}</span></span>
              </div>
            )}

            <div className="w-full border-t border-white/15 pt-5 mt-2 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/70">
              <span>Painel Exclusivo do Convidado</span>
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#a3e635] underline cursor-pointer transition-colors font-medium py-1"
              >
                Sair / Inserir outro código
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

export default App;
