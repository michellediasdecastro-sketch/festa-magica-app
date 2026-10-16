import { useState, useEffect } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { PartyGames } from "./components/PartyGames";
import { Sparkles, Volume2, Gamepad2, ArrowRight } from "lucide-react";
import { supabase } from "./lib/supabase";
import { getMissionCatalog, InteractiveMission } from "./lib/MissionEngine";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Controles da Nova Missão
  const [missionCleared, setMissionCleared] = useState(false); // Trava de Segurança
  const [missionIndex, setMissionIndex] = useState(0); // 0 a 49
  const [backgrounds, setBackgrounds] = useState<string[]>([]);

  useEffect(() => {
    const savedSession = localStorage.getItem('@party_guest_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.guestName) {
          setPartyData(parsed);
          
          // Recupera o progresso deste convidado específico! Persistência garantida.
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

  // Carrega Múltiplos Backgrounds para a Rotação
  useEffect(() => {
    async function fetchBackgrounds() {
      if (!partyData?.theme) return;
      // Aqui o ideal será a tabela themes ter uma coluna background_urls (array) no futuro. 
      // Por agora, garantimos que puxa o fundo principal e permite a mecânica.
      const { data } = await supabase.from("themes").select("background_url").eq('theme_name', partyData.theme);
      if (data && data.length > 0) {
        setBackgrounds(data.map(d => d.background_url));
      }
    }
    fetchBackgrounds();
  }, [partyData]);

  // Gestão de Áudio (Suporta voz real gravada ou robô TTS)
  const playAudio = (type: 'instruction' | 'success', textToSpeak: string) => {
    window.speechSynthesis.cancel(); // Para áudios anteriores
    
    // Se existir áudio gravado no painel, usa-o! (Custo zero IA, emoção máxima)
    const customAudioUrl = type === 'instruction' ? partyData?.welcomeAudioUrl : partyData?.successAudioUrl;
    
    if (customAudioUrl) {
      const audio = new Audio(customAudioUrl);
      audio.play().catch(e => console.log("Erro no audio custom", e));
      return;
    }

    // Fallback: Robô (Text-to-Speech)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMissionSuccess = () => {
    setMissionCleared(true);
    playAudio('success', `Uhuu, ${partyData.guestName}! Você conseguiu ajudar o ${partyData.childName || 'aniversariante'}! Jogos liberados!`);
    
    // Avança o índice para a próxima vez que ele entrar na app! (Ciclo de 50)
    const nextIndex = (missionIndex + 1) % 50;
    const progressKey = `@mission_progress_${partyData.guestName}_${partyData.partyId}`;
    localStorage.setItem(progressKey, nextIndex.toString());
    setMissionIndex(nextIndex);
  };

  const handleLogout = () => {
    localStorage.removeItem('@party_guest_session');
    setPartyData(null);
    setMissionCleared(false);
    window.speechSynthesis.cancel();
  };

  if (isInitializing) {
    return <div className="min-h-screen w-full bg-black flex items-center justify-center"><Sparkles className="size-8 text-[#bef264] animate-spin" /></div>;
  }

  if (isAdminOpen) {
    return <AdminDashboard onBackToApp={() => { window.history.replaceState({}, document.title, window.location.pathname); setIsAdminOpen(false); }} />;
  }

  // Lógica de Rotação Cíclica
  const catalog = getMissionCatalog();
  const currentMission = catalog[missionIndex];
  
  // Rotação da imagem de fundo baseada na missão atual (evita repetições na mesma sessão)
  const activeBg = backgrounds.length > 0 
    ? backgrounds[missionIndex % backgrounds.length] 
    : partyData?.photoUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1920&auto=format&fit=crop";

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-3 sm:p-6 text-white bg-black overflow-hidden">
      
      {/* Background Rotativo */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-100 saturate-110" style={{ backgroundImage: `url('${activeBg}')` }} />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-[360px] sm:max-w-md mx-auto flex flex-col items-center justify-center py-6 h-full">
        
        {!partyData ? (
          <AccessLogin onLoginSuccess={(data) => { setPartyData(data); setMissionCleared(false); }} />
        ) : missionCleared ? (
          // JOGOS DESBLOQUEADOS APENAS AQUI!
          <PartyGames partyData={partyData} onBackToMain={() => { /* Bloqueamos o botão voltar para forçar a ficar nos jogos ou sair */ }} />
        ) : (
          
          // NOVA TELA DE MISSÃO OBRIGATÓRIA
          <div className="w-full bg-black/40 border border-white/20 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md text-center flex flex-col items-center animate-fade-in relative">
            
            {/* Avatar do Aniversariante */}
            <div className="relative -mt-12 mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-[#bef264] bg-black/80 shadow-2xl overflow-hidden flex items-center justify-center">
                {partyData.childAvatarUrl ? (
                  <img src={partyData.childAvatarUrl} alt="Aniversariante" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">👑</span>
                )}
              </div>
            </div>

            <button onClick={() => playAudio('instruction', `Oi ${partyData.guestName}! O ${partyData.childName || 'aniversariante'} precisa da sua ajuda. ${currentMission.instruction}`)} className="absolute top-4 right-4 p-3 bg-black/50 border border-white/30 rounded-full hover:bg-white/20 transition-all shadow-lg text-[#bef264]">
              <Volume2 size={20} />
            </button>

            <span className="text-xs font-bold text-[#bef264] uppercase tracking-widest mb-1">Missão {missionIndex + 1} de 50</span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
              Oi {partyData.guestName}! <br/>O {partyData.childName || 'Aniversariante'} precisa de você!
            </h2>
            <p className="text-sm text-white/80 font-medium px-4">{currentMission.instruction}</p>

            {/* Injeta a Missão Interativa */}
            <InteractiveMission 
              mission={currentMission} 
              images={partyData.gameImages || ["🍎", "⭐", "🎈", "🚗"]} 
              onSuccess={handleMissionSuccess} 
            />

            <div className="mt-8">
              <button onClick={handleLogout} className="text-xs text-white/50 underline">Sair da Sessão</button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default App;
