import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { Sparkles, Cake, Users, Trophy } from "lucide-react";
import { supabase } from "./lib/supabase";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [themeBackgrounds, setThemeBackgrounds] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      setIsAdminOpen(true);
    }
  }, []);

  useEffect(() => {
    async function fetchThemeBackgrounds() {
      const { data } = await supabase.from("themes").select("theme_name, background_url");
      if (data) {
        const bgMap: Record<string, string> = {};
        data.forEach(item => {
          if (item.theme_name && item.background_url) {
            bgMap[item.theme_name.trim().toLowerCase()] = item.background_url.trim();
          }
        });
        setThemeBackgrounds(bgMap);
      }
    }
    fetchThemeBackgrounds();
  }, [isAdminOpen, partyData]);

  function getBackgroundForTheme(themeName: string) {
    if (!themeName) return "";
    const key = themeName.trim().toLowerCase();
    return themeBackgrounds[key] || "";
  }

  const bgImage = partyData 
    ? getBackgroundForTheme(partyData.theme) 
    : "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1920&auto=format&fit=crop";

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-3 sm:p-6 text-white overflow-x-hidden overflow-y-auto bg-black">
      {/* Imagem de Fundo Estrita */}
      {bgImage && (
        <div 
          key={bgImage}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-95 saturate-110 scale-105 transition-all duration-700"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      
      {/* Camada translúcida geral muito leve para preservar o fundo vivo */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />

      {/* Conteúdo Principal com Largura Responsiva Inteligente */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto flex items-center justify-center my-auto py-6">
        {isAdminOpen ? (
          <AdminDashboard onBackToApp={() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsAdminOpen(false);
          }} />
        ) : !partyData ? (
          <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
        ) : (
          <div className="w-full bg-black/20 border border-white/25 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md text-center flex flex-col items-center gap-3.5 sm:gap-4 animate-fade-in">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/35 border border-white/30 text-[#a3e635] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-md">
              <Sparkles className="size-3.5 animate-pulse" /> Tema: {partyData.theme}
            </div>

            <div className="space-y-1">
              <div className="text-xl">🎉</div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md leading-snug">
                Bem-vindo à festa de {partyData.birthdayChildName}!
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2 w-full">
              <div className="flex items-center justify-center gap-2.5 bg-black/25 border border-white/15 px-3.5 py-2 rounded-2xl text-xs sm:text-sm backdrop-blur-sm shadow-sm flex-1">
                <Cake className="size-4 text-[#a3e635] shrink-0" />
                <span>Idade: <strong className="text-[#a3e635]">{partyData.childAge} anos</strong></span>
              </div>

              <div className="flex items-center justify-center gap-2.5 bg-black/25 border border-white/15 px-3.5 py-2 rounded-2xl text-xs sm:text-sm backdrop-blur-sm shadow-sm flex-1">
                <Users className="size-4 text-[#a3e635] shrink-0" />
                <span>Convidado: <strong className="text-[#a3e635]">{partyData.ageGroup}</strong></span>
              </div>
            </div>

            {partyData.characterName && (
              <div className="flex items-center justify-center gap-2 bg-black/25 border border-white/15 px-3.5 py-2 rounded-2xl text-white/95 text-xs sm:text-sm w-full shadow-sm">
                <Trophy className="size-4 text-[#a3e635] shrink-0" />
                <span>Destaque: <span className="text-[#a3e635] font-bold">{partyData.characterName}</span></span>
              </div>
            )}

            <div className="w-full border-t border-white/15 pt-2.5 mt-1 flex flex-col sm:flex-row justify-between items-center gap-1.5 text-[11px] sm:text-xs text-white/80 font-medium">
              <span>Painel Exclusivo do Convidado</span>
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#a3e635] underline cursor-pointer transition-colors py-0.5"
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
