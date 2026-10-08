import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { Sparkles, Cake, Users, Trophy, Settings } from "lucide-react";
import { supabase } from "./lib/supabase";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [themeBackgrounds, setThemeBackgrounds] = useState<Record<string, string>>({});

  // Carregar os fundos associados aos temas da tabela 'themes'
  useEffect(() => {
    async function fetchThemeBackgrounds() {
      const { data } = await supabase.from("themes").select("theme_name, background_url");
      if (data) {
        const bgMap: Record<string, string> = {};
        data.forEach(item => {
          bgMap[item.theme_name.toLowerCase()] = item.background_url;
        });
        setThemeBackgrounds(bgMap);
      }
    }
    fetchThemeBackgrounds();
  }, [isAdminOpen, partyData]);

  // Descobrir a imagem de fundo ideal com base no tema da festa
  function getBackgroundForTheme(themeName: string) {
    if (!themeName) return "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=1920&auto=format&fit=crop";
    const key = themeName.toLowerCase();
    if (themeBackgrounds[key]) {
      return themeBackgrounds[key];
    }
    // Fundo padrão de fallback
    return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop";
  }

  const bgImage = partyData 
    ? getBackgroundForTheme(partyData.theme) 
    : "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=1920&auto=format&fit=crop";

  return (
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 text-white overflow-x-hidden overflow-y-auto">
      {/* Imagem de Fundo Dinâmica Baseada no Tema */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-85 saturate-110 scale-105 transition-all duration-700"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      
      {/* Camada translúcida equilibrada */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Botão flutuante discreto para aceder à Administração */}
      {!partyData && !isAdminOpen && (
        <button
          onClick={() => setIsAdminOpen(true)}
          className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-xs font-bold hover:bg-black/70 transition-colors cursor-pointer"
        >
          <Settings className="size-4 text-[#a3e635]" /> Admin
        </button>
      )}

      {/* Conteúdo Principal */}
      <div className="relative z-10 w-full max-w-md sm:max-w-xl mx-auto flex items-center justify-center my-auto">
        {isAdminOpen ? (
          <AdminDashboard onBackToApp={() => setIsAdminOpen(false)} />
        ) : !partyData ? (
          <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
        ) : (
          <div className="w-full bg-black/30 border border-white/20 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-md text-center flex flex-col items-center gap-4 sm:gap-5 animate-fade-in">
            
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-black/40 border border-white/25 text-[#a3e635] text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md">
              <Sparkles className="size-4 animate-pulse" /> Tema: {partyData.theme}
            </div>

            <div className="space-y-1">
              <div className="text-2xl">🎉</div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                Bem-vindo à festa de {partyData.birthdayChildName}!
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2.5 w-full">
              <div className="flex items-center justify-center gap-3 bg-black/35 border border-white/15 px-4 py-2.5 rounded-2xl text-sm backdrop-blur-sm shadow-sm flex-1">
                <Cake className="size-4 text-[#a3e635] shrink-0" />
                <span>Idade: <strong className="text-[#a3e635]">{partyData.childAge} anos</strong></span>
              </div>

              <div className="flex items-center justify-center gap-3 bg-black/35 border border-white/15 px-4 py-2.5 rounded-2xl text-sm backdrop-blur-sm shadow-sm flex-1">
                <Users className="size-4 text-[#a3e635] shrink-0" />
                <span>Convidado: <strong className="text-[#a3e635]">{partyData.ageGroup}</strong></span>
              </div>
            </div>

            {partyData.characterName && (
              <div className="flex items-center justify-center gap-2 bg-black/35 border border-white/15 px-4 py-2.5 rounded-2xl text-white/95 text-sm w-full shadow-sm">
                <Trophy className="size-4 text-[#a3e635] shrink-0" />
                <span>Destaque: <span className="text-[#a3e635] font-bold">{partyData.characterName}</span></span>
              </div>
            )}

            <div className="w-full border-t border-white/15 pt-3 mt-1 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/80 font-medium">
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
