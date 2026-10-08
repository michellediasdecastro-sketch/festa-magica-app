import { useState } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { Sparkles, Cake, Users, Trophy } from "lucide-react";

// Função para escolher fundos altamente cinematográficos, lúdicos e coloridos baseados no tema
function getThemeBackground(themeName: string) {
  const theme = (themeName || "").toLowerCase();
  
  if (theme.includes("dinossauro") || theme.includes("t-rex") || theme.includes("jurassico")) {
    // Cenário lúdico e cinematográfico de dinossauros em habitat natural exuberante
    return "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("frozen") || theme.includes("gelo") || theme.includes("neve")) {
    // Cenário cinematográfico de gelo mágico
    return "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("espacio") || theme.includes("astronauta") || theme.includes("galaxia")) {
    // Cenário espacial mágico e colorido
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("safari") || theme.includes("selva") || theme.includes("animais")) {
    // Cenário de selva vibrante
    return "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1920&auto=format&fit=crop";
  }
  
  // Fundo lúdico padrão de floresta encantada para festas gerais
  return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop";
}

export function App() {
  const [partyData, setPartyData] = useState<any>(null);

  // Tela inicial: Floresta mágica vibrante e lúdica. 2ª Tela: Fundo adaptado ao tema da festa.
  const bgImage = partyData 
    ? getThemeBackground(partyData.theme) 
    : "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=1920&auto=format&fit=crop";

  return (
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center p-3 sm:p-6 text-white overflow-x-hidden overflow-y-auto">
      {/* Imagem de Fundo Cinematográfica */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-90 saturate-125 scale-105 transition-all duration-700"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      
      {/* Camada de escurecimento suave para garantir leitura sem apagar a imagem de fundo */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Conteúdo Principal com largura adaptada para telemóveis e PCs */}
      <div className="relative z-10 w-full max-w-lg sm:max-w-xl mx-auto flex items-center justify-center my-auto">
        {!partyData ? (
          <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
        ) : (
          <div className="w-full bg-black/40 border border-white/25 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-md text-center flex flex-col items-center gap-4 sm:gap-6 animate-fade-in">
            
            {/* Cabeçalho do Tema */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-white/30 text-[#a3e635] text-xs sm:text-sm font-bold tracking-wider uppercase shadow-lg">
              <Sparkles className="size-4 animate-pulse" /> Tema: {partyData.theme}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl">🎉</div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                Bem-vindo à festa de {partyData.birthdayChildName}!
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 my-1 w-full">
              <div className="flex items-center justify-center gap-3 bg-black/45 border border-white/20 px-4 py-3 rounded-2xl text-sm sm:text-base backdrop-blur-md shadow-md flex-1">
                <Cake className="size-5 text-[#a3e635] shrink-0" />
                <span>Idade: <strong className="text-[#a3e635]">{partyData.childAge} anos</strong></span>
              </div>

              <div className="flex items-center justify-center gap-3 bg-black/45 border border-white/20 px-4 py-3 rounded-2xl text-sm sm:text-base backdrop-blur-md shadow-md flex-1">
                <Users className="size-5 text-[#a3e635] shrink-0" />
                <span>Convidado: <strong className="text-[#a3e635]">{partyData.ageGroup}</strong></span>
              </div>
            </div>

            {partyData.characterName && (
              <div className="flex items-center justify-center gap-2 bg-black/45 border border-white/20 px-5 py-3 rounded-2xl text-white/95 text-sm sm:text-base w-full shadow-md">
                <Trophy className="size-5 text-[#a3e635] shrink-0" />
                <span>Destaque: <span className="text-[#a3e635] font-bold">{partyData.characterName}</span></span>
              </div>
            )}

            <div className="w-full border-t border-white/20 pt-4 mt-2 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/80 font-medium">
              <span>Painel Exclusivo do Convidado</span>
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#a3e635] underline cursor-pointer transition-colors py-1"
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
