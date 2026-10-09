import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { PartyGames } from "./components/PartyGames";
import { Users, Trophy, Gamepad2 } from "lucide-react";
import { supabase } from "./lib/supabase";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInGames, setIsInGames] = useState(false);
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

  if (isAdminOpen) {
    return (
      <AdminDashboard onBackToApp={() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsAdminOpen(false);
      }} />
    );
  }

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-3 sm:p-6 text-white overflow-x-hidden overflow-y-auto bg-black">
      {/* Imagem de Fundo Estrita */}
      {bgImage && (
        <div 
          key={bgImage}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-100 saturate-110 scale-105 transition-all duration-700"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[0px]" />

      {/* Conteúdo Principal do Convidado */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto flex items-center justify-center my-auto py-6">
        {!partyData ? (
          <AccessLogin onLoginSuccess={(data) => { setPartyData(data); setIsInGames(false); }} />
        ) : isInGames ? (
          <PartyGames partyData={partyData} onBackToMain={() => setIsInGames(false)} />
        ) : (
          <div className="w-full bg-transparent border border-white/25 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-[2px] text-center flex flex-col items-center gap-4 animate-fade-in">
            
            {/* Bloco do Nome da Festa em Destaque */}
            <div className="w-full px-4 py-3 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-md">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">
                {partyData.partyName}
              </h1>
            </div>

            {/* Faixa Etária */}
            <div className="w-full">
              <div className="flex items-center justify-center gap-3 bg-black/40 border border-white/20 px-4 py-3 rounded-2xl text-sm backdrop-blur-md shadow-md w-full">
                <Users className="size-5 text-[#bef264] shrink-0" />
                <span className="text-white drop-shadow">Convidado: Faixa etária <strong className="text-[#bef264] font-bold">{partyData.ageGroup}</strong></span>
              </div>
            </div>

            {/* Personagem em Destaque / Mascote */}
            {partyData.characterName && (
              <div className="flex items-center justify-center gap-3 bg-black/40 border border-white/20 px-4 py-3 rounded-2xl text-white text-sm w-full shadow-md backdrop-blur-md">
                <Trophy className="size-5 text-[#bef264] shrink-0" />
                <span className="drop-shadow">Guia / Mascote: <span className="text-[#bef264] font-bold">{partyData.characterName}</span></span>
              </div>
            )}

            {/* Botão de Acesso aos Jogos */}
            <button
              onClick={() => setIsInGames(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#bef264] text-black font-extrabold text-sm hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#bef264]/20 flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Gamepad2 className="size-5" /> Entrar na Central de Jogos
            </button>

            <div className="w-full border-t border-white/20 pt-3 mt-2 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/90 font-medium px-2 py-1 bg-black/30 rounded-xl backdrop-blur-md">
              <span>Experiência Interativa</span>
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#bef264] underline cursor-pointer transition-colors py-1 font-bold"
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
