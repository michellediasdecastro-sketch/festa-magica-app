import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { PartyGames } from "./components/PartyGames";
import { Gamepad2, Cake, Sparkles, Compass, Trophy, Footprints } from "lucide-react";
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
      
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0px]" />

      {/* Conteúdo Principal Estilo Aventura Infantil */}
      <div className="relative z-10 w-full max-w-[360px] sm:max-w-md mx-auto flex items-center justify-center my-auto py-6">
        {!partyData ? (
          <AccessLogin onLoginSuccess={(data) => { setPartyData(data); setIsInGames(false); }} />
        ) : isInGames ? (
          <PartyGames partyData={partyData} onBackToMain={() => setIsInGames(false)} />
        ) : (
          <div className="w-full bg-transparent border border-white/25 rounded-[2.5rem] p-6 sm:p-7 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-[2px] text-center flex flex-col items-center gap-3.5 animate-fade-in">
            
            {/* Foto / Avatar do Aniversariante */}
            <div className="relative -mt-10 mb-0">
              <div className="w-24 h-24 rounded-full border-4 border-[#bef264] bg-black/60 shadow-xl overflow-hidden flex items-center justify-center relative backdrop-blur-md">
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

            {/* Cabeçalho Narrativo (Frase Secundária + Título Principal) */}
            <div className="w-full flex flex-col gap-1 text-center">
              <span className="text-xs sm:text-sm font-bold text-[#bef264] tracking-wide drop-shadow">
                Prepare-se para uma grande aventura![cite: 15]
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">
                {partyData.partyName}
              </h1>
            </div>

            {/* Informações da Festa em Formato de Narrativa Lúdica (Sem aparência de formulário) */}
            <div className="w-full flex flex-col gap-2.5 text-left text-xs sm:text-sm">
              
              {/* Idade / Aniversariante */}
              <div className="flex items-start gap-3 bg-transparent border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-[1px] shadow-md">
                <span className="p-2 rounded-xl bg-white/10 text-[#bef264] shrink-0 mt-0.5">
                  <Cake className="size-4" />
                </span>
                <div>
                  <strong className="text-white font-bold block">
                    {partyData.childName} está fazendo {partyData.childAge || partyData.age} anos![cite: 15]
                  </strong>
                  <span className="text-white/80 text-[11px]">E você foi convidado para essa aventura.[cite: 15]</span>
                </div>
              </div>

              {/* Tema / Destino */}
              <div className="flex items-start gap-3 bg-transparent border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-[1px] shadow-md">
                <span className="p-2 rounded-xl bg-white/10 text-[#bef264] shrink-0 mt-0.5">
                  <Compass className="size-4" />
                </span>
                <div>
                  <strong className="text-white font-bold block">
                    Destino: {partyData.theme}[cite: 15]
                  </strong>
                  <span className="text-white/80 text-[11px]">Um universo cheio de descobertas e desafios.[cite: 15]</span>
                </div>
              </div>

              {/* Guia / Mascote */}
              {partyData.characterName && (
                <div className="flex items-start gap-3 bg-transparent border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-[1px] shadow-md">
                  <span className="p-2 rounded-xl bg-white/10 text-[#bef264] shrink-0 mt-0.5">
                    <Trophy className="size-4" />
                  </span>
                  <div>
                    <strong className="text-white font-bold block">
                      Seu companheiro: {partyData.characterName}[cite: 15]
                    </strong>
                    <span className="text-white/80 text-[11px]">Vai guiar você por todo o jogo.[cite: 15]</span>
                  </div>
                </div>
              )}

            </div>

            {/* Botão COMEÇAR A AVENTURA */}
            <button
              onClick={() => setIsInGames(true)}
              className="w-full py-4 px-6 rounded-2xl bg-[#bef264] text-black font-black text-base sm:text-lg tracking-wide hover:opacity-95 transition-all cursor-pointer shadow-[0_0_30px_rgba(190,242,100,0.4)] flex items-center justify-center gap-2.5 transform active:scale-95 uppercase mt-1"
            >
              <Gamepad2 className="size-6" /> COMEÇAR A AVENTURA[cite: 15]
            </button>

            {/* Rodapé Discreto */}
            <div className="w-full pt-2 flex justify-center items-center text-xs text-white/70 font-medium">
              <button 
                onClick={() => setPartyData(null)}
                className="hover:text-[#bef264] underline cursor-pointer transition-colors font-medium py-1"
              >
                Sair / Inserir outro código[cite: 15]
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

export default App;
