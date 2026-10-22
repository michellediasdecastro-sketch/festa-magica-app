import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { PartyGames } from "./components/PartyGames";
import { Sparkles } from "lucide-react";
import { supabase } from "./lib/supabase";
import { MagicalMission } from "./components/MagicalMission";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Controle de Bloqueio dos Jogos e Rotação
  const [hasUnlockedMagic, setHasUnlockedMagic] = useState(false);
  const [isReplayingMagic, setIsReplayingMagic] = useState(false);
  
  const [missionBackgrounds, setMissionBackgrounds] = useState<string[]>([]);
  const [missionIndex, setMissionIndex] = useState(0);

  useEffect(() => {
    const savedSession = localStorage.getItem('@party_guest_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.guestName) {
          setPartyData(parsed);
          
          // Verifica se a magia já foi desbloqueada
          const unlockKey = `@magic_unlocked_${parsed.guestName}_${parsed.partyId}`;
          if (localStorage.getItem(unlockKey) === 'true') {
            setHasUnlockedMagic(true);
          }

          // Recupera o índice da missão para rotacionar o fundo da missão inicial
          const progressKey = `@mission_progress_${parsed.guestName}_${parsed.partyId}`;
          const savedIndex = localStorage.getItem(progressKey);
          if (savedIndex !== null) {
            setMissionIndex(parseInt(savedIndex, 10));
          }
        }
      } catch (e) {
        console.error("Sessão inválida", e);
      }
    }
    
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") setIsAdminOpen(true);
    
    setIsInitializing(false);
  }, []);

  // Busca os fundos rotativos da Missão
  useEffect(() => {
    async function fetchBackgrounds() {
      if (!partyData?.theme) return;
      const { data } = await supabase.from("themes").select("background_urls").eq('theme_name', partyData.theme);
      if (data && data.length > 0) {
        const themeData = data[0];
        if (themeData.background_urls && themeData.background_urls.length > 0) {
          setMissionBackgrounds(themeData.background_urls);
        }
      }
    }
    fetchBackgrounds();
  }, [partyData]);

  const handleMagicUnlocked = () => {
    if (isReplayingMagic) {
      setIsReplayingMagic(false);
    } else {
      const unlockKey = `@magic_unlocked_${partyData.guestName}_${partyData.partyId}`;
      localStorage.setItem(unlockKey, 'true');
      setHasUnlockedMagic(true);
      
      // Avança o índice da missão rotativa para a próxima sessão
      const nextIndex = (missionIndex + 1) % (missionBackgrounds.length || 1);
      const progressKey = `@mission_progress_${partyData.guestName}_${partyData.partyId}`;
      localStorage.setItem(progressKey, nextIndex.toString());
      setMissionIndex(nextIndex);
    }
    window.speechSynthesis.cancel();
  };

  const handleLogout = () => {
    localStorage.removeItem('@party_guest_session');
    setPartyData(null);
    setHasUnlockedMagic(false);
    setIsReplayingMagic(false);
    window.speechSynthesis.cancel();
  };

  if (isInitializing) {
    return <div className="min-h-screen w-full bg-black flex items-center justify-center"><Sparkles className="size-8 text-[#bef264] animate-spin" /></div>;
  }

  if (isAdminOpen) {
    return <AdminDashboard onBackToApp={() => { window.history.replaceState({}, document.title, window.location.pathname); setIsAdminOpen(false); }} />;
  }

  // Verifica se estamos na tela da missão (1ª vez ou quando o botão "Rever" é clicado)
  const isMissionScreen = !hasUnlockedMagic || isReplayingMagic;

  const activeBg = isMissionScreen && missionBackgrounds.length > 0
    ? missionBackgrounds[missionIndex % missionBackgrounds.length]
    : partyData?.photoUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1920&auto=format&fit=crop";

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center text-white bg-black overflow-hidden">
      
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-100 saturate-110 transition-all duration-1000" style={{ backgroundImage: `url('${activeBg}')` }} />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-1000" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        
        {!partyData ? (
          <div className="p-4 w-full max-w-md mx-auto">
            <AccessLogin onLoginSuccess={(data) => { 
              setPartyData(data); 
              // CORREÇÃO: Verifica se já desbloqueou a magia no momento do login para não forçar a missão de novo
              const unlockKey = `@magic_unlocked_${data.guestName}_${data.partyId}`;
              setHasUnlockedMagic(localStorage.getItem(unlockKey) === 'true');
            }} />
          </div>
        ) : 
        
        isMissionScreen ? (
          <div className="p-4 w-full h-full flex flex-col justify-center">
            <MagicalMission partyData={partyData} onUnlock={handleMagicUnlocked} isReplay={isReplayingMagic} />
            
            {!isReplayingMagic && (
               <button onClick={handleLogout} className="mt-8 text-xs text-white/50 underline mx-auto block z-50">Sair da Sessão</button>
            )}
          </div>
        ) : 
        
        (
          <div className="w-full h-full flex flex-col">
            <div className="w-full p-3 sm:p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
               <button onClick={handleLogout} className="text-xs text-white/70 underline hover:text-white">
                 Sair
               </button>
               <button 
                 onClick={() => setIsReplayingMagic(true)} 
                 className="flex items-center gap-2 px-4 py-2 bg-black/50 border border-white/20 rounded-full hover:bg-white/20 hover:border-[#bef264] transition-all text-xs font-bold text-[#bef264] shadow-lg"
               >
                 <Sparkles className="size-3" /> Rever Missão Mágica
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <PartyGames partyData={partyData} onBackToMain={handleLogout} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default App;
