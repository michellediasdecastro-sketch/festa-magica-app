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
      
      {/* Camada translúcida geral extremamente suave (Quase imperceptível) */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />

      {/* Conteúdo Principal com Transparência Ultra Alta */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto flex items-center justify-center my-auto py-6">
        {isAdminOpen ? (
          <AdminDashboard onBackToApp={() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsAdminOpen(false);
          }} />
        ) : !partyData ? (
          <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
        ) : (
          <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl text-center flex flex-col items-center gap-4 animate-fade-in">
            
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#bef264] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-inner">
              <Sparkles className="size-3.5" /> Tema: {partyData.theme}
            </div>

            <div className="space-y-1.5">
              <div className="text-2xl">🎉</div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] leading-tight">
                Bem-vindo à festa de {partyData.birthdayChildName}!
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 w-full mt-1">
              <div className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-sm backdrop-blur-sm shadow-inner flex-1">
                <Cake className="size-5 text-[#bef264] shrink-0" />
                <span className="text-white/90">Idade: <strong className="text-[#bef264] font-bold">{partyData.childAge} anos</strong></span>
              </div>

              <div className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-sm backdrop-blur-sm shadow-inner flex-1">
                <Users className="size-5 text-[#bef264] shrink-0" />
                <span className="text-white/90">Convidado: <strong className="text-[#bef264] font-bold">{partyData.ageGroup}</strong></span>
              </div>
            </div>

            {partyData.characterName && (
              <div className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-white/95 text-sm w-full shadow-inner">
                <Trophy className="size-5 text-[#bef264] shrink-0" />
                <span className="text-white/90">Destaque: <span className="text-[#bef264] font-bold">{partyData.characterName}</span></span>
              </div>
            )}

            <div className="w-full border-t border-white/10 pt-3 mt-2 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/70 font-medium">
              <span>Painel Exclusivo do Convidado</span>
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#bef264] underline cursor-pointer transition-colors py-1"
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
