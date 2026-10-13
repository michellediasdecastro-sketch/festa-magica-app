import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { PartyGames } from "./components/PartyGames";
import { Users, Trophy, Gamepad2, Cake, Sparkles } from "lucide-react";
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
      {/* Imagem de Fundo Estrita do Tema */}
      {bgImage && (
        <div 
          key={bgImage}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-100 saturate-110 scale-105 transition-all duration-700"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[0px]" />

      {/* Conteúdo Principal Personalizado */}
      <div className="relative z-10 w-full max-w-[360px] sm:max-w-md mx-auto flex items-center justify-center my-auto py-6">
        {!partyData ? (
          <AccessLogin onLoginSuccess={(data) => { setPartyData(data); setIsInGames(false); }} />
        ) : isInGames ? (
          <PartyGames partyData={partyData} onBackToMain={() => setIsInGames(false)} />
        ) : (
          <div className="w-full bg-black/40 border border-white/30 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-md text-center flex flex-col items-center gap-4 animate-fade-in">
            
            {/* Foto / Avatar do Aniversariante (se houver photo_url ou usa um ícone festivo) */}
            <div className="relative -mt-12 mb-1">
              <div className="w-24 h-24 rounded-full border-4 border-[#bef264] bg-black/70 shadow-xl overflow-hidden flex items-center justify-center relative">
                {partyData.photoUrl ? (
                  <img src={partyData.photoUrl} alt={partyData.childName} className="w-full h-full object-cover" />
                ) : (
                  <Cake className="size-10 text-[#bef264]" />
                )}
              </div>
              <span className="absolute bottom-0 right-0 p-1.5 bg-[#bef264] text-black rounded-full shadow-lg">
                <Sparkles className="size-4" />
              </span>
            </div>

            {/* Nome da Festa em Destaque */}
            <div className="w-full px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md">
              <span className="text-[10px] uppercase tracking-widest text-[#bef264] font-extrabold block mb-0.5">Experiência Exclusiva</span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow leading-tight">
                {partyData.partyName}
              </h1>
            </div>

            {/* Informações Detalhadas do Aniversariante */}
            <div className="w-full grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between bg-black/50 border border-white/20 px-4 py-3 rounded-2xl text-sm backdrop-blur-md shadow-md">
                <span className="text-white/80 font-medium">Aniversariante:</span>
                <strong className="text-[#bef264] font-bold text-base">{partyData.childName} ({partyData.childAge || partyData.age} anos)</strong>
              </div>

              <div className="flex items-center justify-between bg-black/50 border border-white/20 px-4 py-3 rounded-2xl text-sm backdrop-blur-md shadow-md">
                <span className="text-white/80 font-medium">Tema da Festa:</span>
                <strong className="text-white font-bold">{partyData.theme}</strong>
              </div>

              {partyData.characterName && (
                <div className="flex items-center justify-between bg-black/50 border border-white/20 px-4 py-3 rounded-2xl text-sm backdrop-blur-md shadow-md">
                  <span className="text-white/80 font-medium">Guia / Mascote:</span>
                  <span className="text-[#bef264] font-bold flex items-center gap-1.5">
                    <Trophy className="size-4" /> {partyData.characterName}
                  </span>
                </div>
              )}
            </div>

            {/* Botão JOGAR Destacado (Focado no Aniversariante) */}
            <button
              onClick={() => setIsInGames(true)}
              className="w-full py-4 px-6 rounded-2xl bg-[#bef264] text-black font-black text-lg tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-[0_0_30px_rgba(190,242,100,0.4)] flex items-center justify-center gap-2 transform active:scale-95 uppercase mt-1"
            >
              <Gamepad2 className="size-6" /> JOGAR
            </button>

            <div className="w-full border-t border-white/20 pt-3 mt-1 flex justify-between items-center text-xs text-white/80 font-medium px-2">
              <span>Feito para {partyData.childName}</span>
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#bef264] underline cursor-pointer transition-colors font-bold"
              >
                Sair / Outro Código
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

export default App;
