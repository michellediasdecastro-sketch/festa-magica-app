import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { PartyGames } from "./components/PartyGames";
import { Gamepad2, Cake, Sparkles, Compass, Trophy, Volume2 } from "lucide-react";
import { supabase } from "./lib/supabase";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInGames, setIsInGames] = useState(false);
  const [themeBackgrounds, setThemeBackgrounds] = useState<Record<string, string>>({});
  const [isInitializing, setIsInitializing] = useState(true);

  // Hook 1: Verifica a sessão salva no dispositivo
  useEffect(() => {
    const savedSession = localStorage.getItem('@party_guest_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.guestName) {
          setPartyData(parsed);
        }
      } catch (e) {
        console.error("Sessão inválida", e);
      }
    }
    setIsInitializing(false);
  }, []);

  // Hook 2: Verifica se o utilizador está a tentar entrar no painel admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      setIsAdminOpen(true);
    }
  }, []);

  // Hook 3: Carrega os fundos e as vozes
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
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, [isAdminOpen, partyData]);

  const childDisplayName = partyData?.childName || "Aniversariante";
  const childAgeDisplay = partyData?.childAge || "5";
  const guestName = partyData?.guestName || "Amigo";

  const speakWelcome = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') && v.name.includes('Google')) 
                 || voices.find(v => v.lang.includes('pt-BR'));

    const utterance1 = new SpeechSynthesisUtterance(partyData?.partyName || "Aventura Mágica");
    utterance1.lang = 'pt-BR';
    utterance1.rate = 0.85;
    utterance1.pitch = 1.15;
    if (ptVoice) utterance1.voice = ptVoice;

    const utterance2 = new SpeechSynthesisUtterance("Agora... clique no botão verde, para começarmos essa aventura!");
    utterance2.lang = 'pt-BR';
    utterance2.rate = 0.85;
    utterance2.pitch = 1.15;
    if (ptVoice) utterance2.voice = ptVoice;

    window.speechSynthesis.speak(utterance1);
    window.speechSynthesis.speak(utterance2);
  };

  // Hook 4: Toca a voz (Agora perfeitamente posicionado antes dos retornos visuais)
  useEffect(() => {
    if (partyData && !isInGames && !isAdminOpen) {
      const timer = setTimeout(() => speakWelcome(), 500);
      return () => clearTimeout(timer);
    }
  }, [partyData, isInGames, isAdminOpen]);

  const handleLogout = () => {
    localStorage.removeItem('@party_guest_session');
    setPartyData(null);
    setIsInGames(false);
    window.speechSynthesis.cancel();
  };

  function getBackgroundForTheme(themeName: string) {
    if (!themeName) return "";
    const key = themeName.trim().toLowerCase();
    return themeBackgrounds[key] || "";
  }

  const bgImage = partyData 
    ? (getBackgroundForTheme(partyData.theme) || partyData.photoUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1920&auto=format&fit=crop")
    : "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1920&auto=format&fit=crop";

  // --- RENDERS VISUAIS (Apenas depois de TODOS os hooks acima!) ---

  if (isInitializing) {
    return <div className="min-h-screen w-full bg-black flex items-center justify-center"><Sparkles className="size-8 text-[#bef264] animate-spin" /></div>;
  }

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
      {bgImage && (
        <div 
          key={bgImage}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-100 saturate-110 scale-105 transition-all duration-700"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0px]" />

      <div className="relative z-10 w-full max-w-[360px] sm:max-w-md mx-auto flex items-center justify-center my-auto py-6">
        {!partyData ? (
          <AccessLogin onLoginSuccess={(data) => { setPartyData(data); setIsInGames(false); }} />
        ) : isInGames ? (
          <PartyGames partyData={partyData} onBackToMain={() => setIsInGames(false)} />
        ) : (
          <div className="w-full bg-transparent border border-white/25 rounded-[2.5rem] p-6 sm:p-7 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-[2px] text-center flex flex-col items-center gap-3.5 animate-fade-in relative">
            
            <div className="relative -mt-10 mb-0">
              <div className="w-24 h-24 rounded-full border-4 border-[#bef264] bg-black/60 shadow-xl overflow-hidden flex items-center justify-center relative backdrop-blur-md">
                {partyData.photoUrl ? (
                  <img src={partyData.photoUrl} alt={childDisplayName} className="w-full h-full object-cover" />
                ) : (
                  <Cake className="size-10 text-[#bef264]" />
                )}
              </div>
              <span className="absolute bottom-0 right-0 p-1.5 bg-[#bef264] text-black rounded-full shadow-lg">
                <Sparkles className="size-4" />
              </span>
            </div>

            <div className="w-full flex flex-col gap-1 text-center relative">
              <button 
                onClick={speakWelcome}
                className="absolute -right-2 -top-2 p-2.5 bg-black/50 border border-white/30 rounded-full hover:bg-white/20 transition-colors shadow-lg group"
                title="Ouvir as instruções"
              >
                <Volume2 className="size-4 text-[#bef264] group-hover:scale-110 transition-transform" />
              </button>

              <span className="text-xs sm:text-sm font-bold text-[#bef264] tracking-wide drop-shadow pr-8">
                Prepare-se para uma grande aventura, {guestName}!
              </span>
              
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight mt-1">
                {partyData?.partyName || "Aventura Mágica"}
              </h1>
            </div>

            <div className="w-full flex flex-col gap-2.5 text-left text-xs sm:text-sm mt-2">
              <div className="flex items-start gap-3 bg-black/45 border border-white/30 px-4 py-3 rounded-2xl backdrop-blur-md shadow-md">
                <span className="p-2 rounded-xl bg-white/10 text-[#bef264] shrink-0 mt-0.5">
                  <Cake className="size-4" />
                </span>
                <div>
                  <strong className="text-white font-bold block">
                    {childDisplayName} está fazendo {childAgeDisplay} anos!
                  </strong>
                  <span className="text-white/80 text-[11px]">E você foi convidado para essa aventura.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-black/45 border border-white/30 px-4 py-3 rounded-2xl backdrop-blur-md shadow-md">
                <span className="p-2 rounded-xl bg-white/10 text-[#bef264] shrink-0 mt-0.5">
                  <Compass className="size-4" />
                </span>
                <div>
                  <strong className="text-white font-bold block">
                    Destino: {partyData.theme}
                  </strong>
                  <span className="text-white/80 text-[11px]">Um universo cheio de descobertas e desafios.</span>
                </div>
              </div>

              {partyData.characterName && (
                <div className="flex items-start gap-3 bg-black/45 border border-white/30 px-4 py-3 rounded-2xl backdrop-blur-md shadow-md">
                  <span className="p-2 rounded-xl bg-white/10 text-[#bef264] shrink-0 mt-0.5">
                    <Trophy className="size-4" />
                  </span>
                  <div>
                    <strong className="text-white font-bold block">
                      Seu companheiro: {partyData.characterName}
                    </strong>
                    <span className="text-white/80 text-[11px]">Vai guiar você por todo o jogo.</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsInGames(true)}
              className="w-full py-4 px-6 rounded-2xl bg-[#bef264] text-black font-black text-base sm:text-lg tracking-wide hover:opacity-95 transition-all cursor-pointer shadow-[0_0_30px_rgba(190,242,100,0.4)] flex items-center justify-center gap-2.5 transform active:scale-95 uppercase mt-3"
            >
              <Gamepad2 className="size-6" /> COMEÇAR A AVENTURA
            </button>

            <div className="w-full pt-2 flex justify-center items-center text-xs text-white/70 font-medium">
              <button 
                onClick={handleLogout}
                className="hover:text-[#bef264] underline cursor-pointer transition-colors font-medium py-1"
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
