import { useState, useEffect, type FormEvent } from "react";
import { Sparkles, PlusCircle, Layers, Calendar, ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export function AdminDashboard({ onBackToApp }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"themes" | "parties">("themes");
  
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

    const { error } = await supabase.from("themes").upsert(
      [{ theme_name: themeName, background_url: backgroundUrl }],
      { onConflict: 'theme_name' }
    );

    if (error) {
      setMessage(`Erro ao salvar tema: ${error.message}`);
    } else {
      setMessage("Tema guardado/atualizado com sucesso!");
      setThemeName("");
      setBackgroundUrl("");
      loadThemes();
    }
  }

  async function handleDeleteTheme(id: string) {
    if (!confirm("Tem certeza que deseja apagar este tema?")) return;
    const { error } = await supabase.from("themes").delete().eq("id", id);
    if (error) {
      setMessage(`Erro ao apagar tema: ${error.message}`);
    } else {
      setMessage("Tema apagado com sucesso!");
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

  async function handleDeleteParty(id: string) {
    if (!confirm("Tem certeza que deseja apagar esta festa?")) return;
    const { error } = await supabase.from("parties").delete().eq("id", id);
    if (error) {
      setMessage(`Erro ao apagar festa: ${error.message}`);
    } else {
      setMessage("Festa apagada com sucesso!");
      loadParties();
    }
  }

  return (
    <div className="w-full min-h-[100dvh] bg-black/80 backdrop-blur-xl text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho do Admin */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/15 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToApp}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-2 text-sm font-bold"
            >
              <ArrowLeft className="size-5" /> Voltar ao Site
            </button>
            <h1 className="text-2xl md:text-4xl font-black">Painel de Administração</h1>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab("themes")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'themes' ? 'bg-[#a3e635] text-black shadow-lg shadow-[#a3e635]/20' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <Layers className="inline size-4 mr-1.5" /> Temas ({themes.length})
            </button>
            <button 
              onClick={() => setActiveTab("parties")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'parties' ? 'bg-[#a3e635] text-black shadow-lg shadow-[#a3e635]/20' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <Calendar className="inline size-4 mr-1.5" /> Festas ({parties.length})
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-6 p-4 rounded-xl bg-white/10 border border-white/25 text-center text-sm font-medium text-[#a3e635] animate-fade-in">
            {message}
          </div>
        )}

        {/* ABA DE TEMAS */}
        {activeTab === "themes" && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleCreateTheme} className="flex flex-col gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#a3e635]"><PlusCircle className="size-5" /> Registar / Atualizar Tema</h2>
              
              <div>
                <label className="text-xs text-white/70 block mb-1">Nome do Tema</label>
                <input 
                  type="text" 
                  value={themeName} 
                  onChange={(e) => setThemeName(e.target.value)} 
                  placeholder="Ex: Dinossauros" 
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#a3e635]"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">URL Direta da Imagem de Fundo (Supabase ou Direta)</label>
                <input 
                  type="text" 
                  value={backgroundUrl} 
                  onChange={(e) => setBackgroundUrl(e.target.value)} 
                  placeholder="https://..." 
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#a3e635]"
                />
              </div>

              <button type="submit" className="mt-2 py-3 rounded-xl bg-[#a3e635] text-black font-bold text-sm hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-[#a3e635]/20">
                Salvar Tema
              </button>
            </form>

            <div className="lg:col-span-2 bg-white/5 p-6 rounded-3xl border border-white/10">
              <h2 className="text-xl font-bold mb-4">Temas Registados ({themes.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themes.map(t => (
                  <div key={t.id} className="flex flex-col justify-between p-4 rounded-2xl bg-black/40 border border-white/10 gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-[#a3e635]">{t.theme_name}</span>
                      <button 
                        onClick={() => handleDeleteTheme(t.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        title="Apagar Tema"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <a href={t.background_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/70 hover:text-white truncate">
                      {t.background_url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA DE FESTAS */}
        {activeTab === "parties" && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleCreateParty} className="flex flex-col gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#a3e635]"><PlusCircle className="size-5" /> Registar Nova Festa</h2>
              
              <div>
                <label className="text-xs text-white/70 block mb-1">Nome da Festa</label>
                <input 
                  type="text" 
                  value={partyName} 
                  onChange={(e) => setPartyName(e.target.value)} 
                  placeholder="Ex: Aniversário do Lucas" 
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#a3e635]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/70 block mb-1">Aniversariante</label>
                  <input 
                    type="text" 
                    value={childName} 
                    onChange={(e) => setChildName(e.target.value)} 
                    placeholder="Lucas" 
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#a3e635]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 block mb-1">Idade</label>
                  <input 
                    type="number" 
                    value={childAge} 
                    onChange={(e) => setChildAge(e.target.value)} 
                    placeholder="5" 
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#a3e635]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Selecionar Tema</label>
                <select 
                  value={selectedThemeId} 
                  onChange={(e) => setSelectedThemeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm focus:outline-none focus:border-[#a3e635]"
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
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#a3e635]"
                />
              </div>

              <button type="submit" className="mt-2 py-3 rounded-xl bg-[#a3e635] text-black font-bold text-sm hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-[#a3e635]/20">
                Criar Festa
              </button>
            </form>

            <div className="lg:col-span-2 bg-white/5 p-6 rounded-3xl border border-white/10">
              <h2 className="text-xl font-bold mb-4">Festas Ativas ({parties.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {parties.map(p => (
                  <div key={p.id} className="flex flex-col justify-between p-4 rounded-2xl bg-black/40 border border-white/10 gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-lg text-[#a3e635] block">{p.party_name}</span>
                        <span className="text-xs text-white/70 block mt-1">Aniversariante: {p.birthday_child_name} ({p.child_age} anos)</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteParty(p.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer shrink-0"
                        title="Apagar Festa"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90 w-fit">
                      <Sparkles className="size-3 text-[#a3e635]" /> Tema: {p.theme}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
