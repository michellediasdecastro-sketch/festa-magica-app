import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { PartyGames } from "./components/PartyGames";
import { Trophy, Gamepad2, Cake, Sparkles } from "lucide-react";
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
          <div className="w-full bg-transparent border border-white/25 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-[2px] text-center flex flex-col items-center gap-4 animate-fade-in">
            
            {/* Foto / Avatar do Aniversariante */}
            <div className="relative -mt-10 mb-1">
              <div className="w-24 h-24 rounded-full border-4 border-[#bef264] bg-black/50 shadow-xl overflow-hidden flex items-center justify-center relative backdrop-blur-md">
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

            {/* Nome da Festa em Destaque (Totalmente Transparente) */}
            <div className="w-full px-4 py-3 rounded-2xl bg-transparent border border-white/20 shadow-md backdrop-blur-[1px]">
              <span className="text-[10px] uppercase tracking-widest text-[#bef264] font-extrabold block mb-0.5">Experiência Exclusiva</span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow leading-tight">
                {partyData.partyName}
              </h1>
            </div>

            {/* Informações Detalhadas (Festa de X aninhos, Tema, Mascote) */}
            <div className="w-full grid grid-cols-1 gap-2.5">
              <div className="flex items-center justify-between bg-transparent border border-white/20 px-4 py-3 rounded-2xl text-sm backdrop-blur-[1px] shadow-md">
                <span className="text-white/80 font-medium">Idade:</span>
                <strong className="text-[#bef264] font-bold text-base">Festa de {partyData.childAge || partyData.age} aninhos</strong>
              </div>

              <div className="flex items-center justify-between bg-transparent border border-white/20 px-4 py-3 rounded-2xl text-sm backdrop-blur-[1px] shadow-md">
                <span className="text-white/80 font-medium">Tema da Festa:</span>
                <strong className="text-white font-bold">{partyData.theme}</strong>
              </div>

              {partyData.characterName && (
                <div className="flex items-center justify-between bg-transparent border border-white/20 px-4 py-3 rounded-2xl text-sm backdrop-blur-[1px] shadow-md">
                  <span className="text-white/80 font-medium">Guia / Mascote:</span>
                  <span className="text-[#bef264] font-bold flex items-center gap-1.5">
                    <Trophy className="size-4" /> {partyData.characterName}
                  </span>
                </div>
              )}
            </div>

            {/* Botão JOGAR Destacado */}
            <button
              onClick={() => setIsInGames(true)}
              className="w-full py-4 px-6 rounded-2xl bg-[#bef264] text-black font-black text-lg tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-[0_0_30px_rgba(190,242,100,0.4)] flex items-center justify-center gap-2 transform active:scale-95 uppercase mt-1"
            >
              <Gamepad2 className="size-6" /> JOGAR
            </button>

            {/* Rodapé Limpo (Apenas o botão de Sair) */}
            <div className="w-full border-t border-white/20 pt-3 mt-1 flex justify-center items-center text-xs text-white/80 font-medium px-2">
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#bef264] underline cursor-pointer transition-colors font-bold py-1"
              >
                Sair / Inserir Outro Código
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

export default App;
