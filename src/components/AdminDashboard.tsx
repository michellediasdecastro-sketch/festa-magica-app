import { useState, useEffect, type FormEvent } from "react";
import { Sparkles, PlusCircle, Layers, Calendar, KeyRound, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export function AdminDashboard({ onBackToApp }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"themes" | "parties" | "codes">("themes");
  
  // Estados para Temas
  const [themes, setThemes] = useState<any[]>([]);
  const [themeName, setThemeName] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");

  // Estados para Festas
  const [parties, setParties] = useState<any[]>([]);
  const [partyName, setPartyName] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [characterName, setCharacterName] = useState("");

  // Mensagens de feedback
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadThemes();
    loadParties();
  }, []);

  async function loadThemes() {
    const { data } = await supabase.from("themes").select("*");
    if (data) setThemes(data);
  }

  async function loadParties() {
    const { data } = await supabase.from("parties").select("*");
    if (data) setParties(data);
  }

  async function handleCreateTheme(e: FormEvent) {
    e.preventDefault();
    if (!themeName || !backgroundUrl) {
      setMessage("Preencha o nome do tema e a URL da imagem.");
      return;
    }

    const { error } = await supabase.from("themes").insert([
      { theme_name: themeName, background_url: backgroundUrl }
    ]);

    if (error) {
      setMessage(`Erro ao criar tema: ${error.message}`);
    } else {
      setMessage("Tema criado com sucesso!");
      setThemeName("");
      setBackgroundUrl("");
      loadThemes();
    }
  }

  async function handleCreateParty(e: FormEvent) {
    e.preventDefault();
    if (!partyName || !childName || !selectedThemeId) {
      setMessage("Preencha os campos obrigatórios da festa.");
      return;
    }

    const selectedTheme = themes.find(t => t.id === selectedThemeId);

    const { error } = await supabase.from("parties").insert([
      {
        party_name: partyName,
        birthday_child_name: childName,
        child_age: parseInt(childAge) || 1,
        theme: selectedTheme ? selectedTheme.theme_name : "Geral",
        character_name: characterName,
        photo_url: selectedTheme ? selectedTheme.background_url : ""
      }
    ]);

    if (error) {
      setMessage(`Erro ao criar festa: ${error.message}`);
    } else {
      setMessage("Festa criada com sucesso!");
      setPartyName("");
      setChildName("");
      setChildAge("");
      setCharacterName("");
      loadParties();
    }
  }

  return (
    <div className="w-full max-w-4xl bg-black/60 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl text-white my-8">
      <div className="flex justify-between items-center pb-6 border-b border-white/15">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToApp}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            title="Voltar ao Convidado"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-black">Painel de Administração</h1>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("themes")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'themes' ? 'bg-[#a3e635] text-black' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <Layers className="inline size-4 mr-1.5" /> Temas
          </button>
          <button 
            onClick={() => setActiveTab("parties")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'parties' ? 'bg-[#a3e635] text-black' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <Calendar className="inline size-4 mr-1.5" /> Festas
          </button>
        </div>
      </div>

      {message && (
        <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/25 text-center text-sm font-medium text-[#a3e635]">
          {message}
        </div>
      )}

      {/* ABA DE TEMAS */}
      {activeTab === "themes" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleCreateTheme} className="flex flex-col gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
            <h2 className="text-lg font-bold flex items-center gap-2"><PlusCircle className="size-5 text-[#a3e635]" /> Novo Tema e Imagem</h2>
            
            <div>
              <label className="text-xs text-white/70 block mb-1">Nome do Tema (ex: Dinossauros)</label>
              <input 
                type="text" 
                value={themeName} 
                onChange={(e) => setThemeName(e.target.value)} 
                placeholder="Ex: Dinossauros" 
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/30 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">URL da Imagem Cinematográfica de Fundo</label>
              <input 
                type="text" 
                value={backgroundUrl} 
                onChange={(e) => setBackgroundUrl(e.target.value)} 
                placeholder="https://exemplo.com/imagem.jpg" 
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/30 text-sm"
              />
            </div>

            <button type="submit" className="mt-2 py-2.5 rounded-xl bg-[#a3e635] text-black font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer">
              Salvar Tema
            </button>
          </form>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 max-h-80 overflow-y-auto">
            <h2 className="text-lg font-bold mb-3">Temas Registados ({themes.length})</h2>
            <div className="flex flex-col gap-2">
              {themes.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10 text-sm">
                  <span className="font-bold text-[#a3e635]">{t.theme_name}</span>
                  <a href={t.background_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/70 hover:text-white">Ver Imagem</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA DE FESTAS */}
      {activeTab === "parties" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleCreateParty} className="flex flex-col gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
            <h2 className="text-lg font-bold flex items-center gap-2"><PlusCircle className="size-5 text-[#a3e635]" /> Registar Nova Festa</h2>
            
            <div>
              <label className="text-xs text-white/70 block mb-1">Nome da Festa</label>
              <input 
                type="text" 
                value={partyName} 
                onChange={(e) => setPartyName(e.target.value)} 
                placeholder="Ex: Aniversário do Lucas" 
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/30 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-white/70 block mb-1">Nome da Criança</label>
                <input 
                  type="text" 
                  value={childName} 
                  onChange={(e) => setChildName(e.target.value)} 
                  placeholder="Lucas" 
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/30 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-white/70 block mb-1">Idade</label>
                <input 
                  type="number" 
                  value={childAge} 
                  onChange={(e) => setChildAge(e.target.value)} 
                  placeholder="5" 
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/30 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Selecionar Tema</label>
              <select 
                value={selectedThemeId} 
                onChange={(e) => setSelectedThemeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-sm"
              >
                <option value="">Escolha um tema...</option>
                {themes.map(t => (
                  <option key={t.id} value={t.id}>{t.theme_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">Personagem em Destaque (Opcional)</label>
              <input 
                type="text" 
                value={characterName} 
                onChange={(e) => setCharacterName(e.target.value)} 
                placeholder="Ex: T-Rex Amigável" 
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/30 text-sm"
              />
            </div>

            <button type="submit" className="mt-2 py-2.5 rounded-xl bg-[#a3e635] text-black font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer">
              Criar Festa
            </button>
          </form>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 max-h-80 overflow-y-auto">
            <h2 className="text-lg font-bold mb-3">Festas Ativas ({parties.length})</h2>
            <div className="flex flex-col gap-2">
              {parties.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-black/30 border border-white/10 text-sm flex flex-col gap-1">
                  <span className="font-bold text-[#a3e635]">{p.party_name}</span>
                  <span className="text-xs text-white/70">Aniversariante: {p.birthday_child_name} ({p.child_age} anos) | Tema: {p.theme}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
