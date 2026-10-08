import { useState } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { Sparkles, Cake, Users, Trophy } from "lucide-react";

// Função para escolher o fundo ideal com base no tema da festa
function getThemeBackground(themeName: string) {
  const theme = (themeName || "").toLowerCase();
  
  if (theme.includes("dinossauro") || theme.includes("t-rex") || theme.includes("jurassico")) {
    // Cenário de dinossauros / floresta pré-histórica
    return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("frozen") || theme.includes("gelo") || theme.includes("neve")) {
    // Cenário de gelo / inverno
    return "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("espacio") || theme.includes("astronauta") || theme.includes("galaxia")) {
    // Cenário espacial
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop";
  } else if (theme.includes("safari") || theme.includes("selva") || theme.includes("animais")) {
    // Cenário de safari
    return "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1920&auto=format&fit=crop";
  }
  
  // Fundo padrão festivo neutro caso o tema seja personalizado
  return "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1920&auto=format&fit=crop";
}

export function App() {
  const [partyData, setPartyData] = useState<any>(null);

  // Define a imagem de fundo com base no tema atual da festa
  const bgImage = partyData ? getThemeBackground(partyData.theme) : "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop";

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 text-white overflow-hidden">
      {/* Imagem de Fundo Dinâmica Adaptada ao Tema */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-75 scale-105 transition-all duration-700"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      
      {/* Camada escura translúcida para contraste e legibilidade perfeitas */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Conteúdo Principal */}
      <div className="relative z-10 w-full max-w-2xl">
        {!partyData ? (
          <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
        ) : (
          <div className="w-full bg-[#0d2318]/85 border border-white/15 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center gap-6 animate-fade-in">
            
            {/* Cabeçalho do Tema */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/40 border border-white/20 text-[#a3e635] text-sm font-bold tracking-wider uppercase shadow-inner">
              <Sparkles className="size-4" /> Tema: {partyData.theme}
            </div>

            <div className="space-y-3">
              <div className="text-3xl">🎉</div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                Bem-vindo à festa de {partyData.birthdayChildName}!
              </h1>
            </div>

            <div className="flex flex-wrap justify-center gap-4 my-2 w-full">
              <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-5 py-3 rounded-2xl text-sm md:text-base backdrop-blur-md shadow-sm">
                <Cake className="size-5 text-[#a3e635]" />
                <span>Idade do Aniversariante: <strong className="text-[#a3e635]">{partyData.childAge} anos</strong></span>
              </div>

              <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-5 py-3 rounded-2xl text-sm md:text-base backdrop-blur-md shadow-sm">
                <Users className="size-5 text-[#a3e635]" />
                <span>Faixa do Convidado: <strong className="text-[#a3e635]">{partyData.ageGroup}</strong></span>
              </div>
            </div>

            {partyData.characterName && (
              <div className="flex items-center gap-2 bg-black/30 border border-white/10 px-6 py-3 rounded-2xl text-white/90 text-base shadow-inner">
                <Trophy className="size-5 text-[#a3e635]" />
                <span>Destaque Especial: <span className="text-[#a3e635] font-bold">{partyData.characterName}</span></span>
              </div>
            )}

            <div className="w-full border-t border-white/10 pt-6 mt-4 flex justify-between items-center text-xs text-white/60">
              <span>Painel Exclusivo do Convidado</span>
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#a3e635] underline cursor-pointer transition-colors font-medium"
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
