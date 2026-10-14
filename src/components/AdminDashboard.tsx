import { useState, useEffect, type FormEvent } from "react";
import { Sparkles, PlusCircle, Layers, Calendar, ArrowLeft, Trash2, Edit2, Image as ImageIcon } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export function AdminDashboard({ onBackToApp }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"themes" | "parties">("themes");
  const [message, setMessage] = useState("");

  // Estados para Temas
  const [themes, setThemes] = useState<any[]>([]);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [gameImagesInput, setGameImagesInput] = useState("");

  // Estados para Experiências/Festas
  const [parties, setParties] = useState<any[]>([]);
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);
  const [partyName, setPartyName] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [characterName, setCharacterName] = useState("");

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

  // ---- FUNÇÕES DE TEMAS ----
  function handleEditTheme(t: any) {
    setEditingThemeId(t.id);
    setThemeName(t.theme_name);
    setBackgroundUrl(t.background_url || "");
    setGameImagesInput(t.game_images ? t.game_images.join(", ") : "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetThemeForm() {
    setEditingThemeId(null);
    setThemeName("");
    setBackgroundUrl("");
    setGameImagesInput("");
  }

  async function handleSaveTheme(e: FormEvent) {
    e.preventDefault();
    if (!themeName || !backgroundUrl) return setMessage("Preencha o nome e a imagem de fundo.");

    const gameImagesArray = gameImagesInput ? gameImagesInput.split(',').map(url => url.trim()).filter(Boolean) : [];

    if (editingThemeId) {
      const { error } = await supabase.from("themes").update({ 
        theme_name: themeName, 
        background_url: backgroundUrl,
        game_images: gameImagesArray 
      }).eq("id", editingThemeId);
      
      if (error) setMessage(`Erro: ${error.message}`);
      else { setMessage("Tema atualizado!"); resetThemeForm(); loadThemes(); }
    } else {
      const { error } = await supabase.from("themes").insert([{ 
        theme_name: themeName, 
        background_url: backgroundUrl,
        game_images: gameImagesArray 
      }]);
      
      if (error) setMessage(`Erro: ${error.message}`);
      else { setMessage("Tema criado!"); resetThemeForm(); loadThemes(); }
    }
  }

  async function handleDeleteTheme(id: string) {
    if (!confirm("Apagar este tema?")) return;
    await supabase.from("themes").delete().eq("id", id);
    loadThemes();
  }

  // ---- FUNÇÕES DE FESTAS ----
  function handleEditParty(p: any) {
    setEditingPartyId(p.id);
    setPartyName(p.party_name);
    setChildName(p.birthday_child_name);
    setChildAge(p.child_age?.toString() || "");
    setCharacterName(p.character_name || "");
    
    const themeFound = themes.find(t => t.theme_name === p.theme);
    if (themeFound) setSelectedThemeId(themeFound.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetPartyForm() {
    setEditingPartyId(null);
    setPartyName("");
    setChildName("");
    setChildAge("");
    setSelectedThemeId("");
    setCharacterName("");
  }

  async function handleSaveParty(e: FormEvent) {
    e.preventDefault();
    if (!partyName || !childName || !selectedThemeId) return setMessage("Preencha os campos obrigatórios.");

    const selectedTheme = themes.find(t => t.id === selectedThemeId);

    const payload = {
      party_name: partyName,
      birthday_child_name: childName,
      child_age: parseInt(childAge) || 1,
      theme: selectedTheme ? selectedTheme.theme_name : "Geral",
      character_name: characterName,
      photo_url: selectedTheme ? selectedTheme.background_url : ""
    };

    if (editingPartyId) {
      const { error } = await supabase.from("parties").update(payload).eq("id", editingPartyId);
      if (error) setMessage(`Erro: ${error.message}`);
      else { setMessage("Festa atualizada!"); resetPartyForm(); loadParties(); }
    } else {
      const { error } = await supabase.from("parties").insert([payload]);
      if (error) setMessage(`Erro: ${error.message}`);
      else { setMessage("Festa criada!"); resetPartyForm(); loadParties(); }
    }
  }

  async function handleDeleteParty(id: string) {
    if (!confirm("Apagar esta experiência?")) return;
    await supabase.from("parties").delete().eq("id", id);
    loadParties();
  }

  return (
    <div className="w-full min-h-[100dvh] bg-black/90 text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-white/15 gap-4">
          <button onClick={onBackToApp} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold flex items-center gap-2">
            <ArrowLeft className="size-5" /> Voltar
          </button>
          <div className="flex gap-2">
            <button onClick={() => { setActiveTab("themes"); resetThemeForm(); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'themes' ? 'bg-[#bef264] text-black' : 'bg-white/10 hover:bg-white/20'}`}>
              <Layers className="inline size-4 mr-1.5" /> Temas
            </button>
            <button onClick={() => { setActiveTab("parties"); resetPartyForm(); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'parties' ? 'bg-[#bef264] text-black' : 'bg-white/10 hover:bg-white/20'}`}>
              <Calendar className="inline size-4 mr-1.5" /> Festas
            </button>
          </div>
        </div>

        {message && <div className="mt-4 p-3 bg-white/10 border border-white/20 text-center text-[#bef264] rounded-xl">{message}</div>}

        {/* ABA TEMAS */}
        {activeTab === "themes" && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSaveTheme} className="flex flex-col gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
              <h2 className="text-xl font-bold text-[#bef264]">{editingThemeId ? "Editar Tema" : "Novo Tema"}</h2>
              <input type="text" value={themeName} onChange={(e) => setThemeName(e.target.value)} placeholder="Nome do Tema" className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm" />
              <input type="text" value={backgroundUrl} onChange={(e) => setBackgroundUrl(e.target.value)} placeholder="URL do Fundo Principal" className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm" />
              <textarea value={gameImagesInput} onChange={(e) => setGameImagesInput(e.target.value)} placeholder="Imagens PNG sem fundo separadas por vírgula (MUITO IMPORTANTE para os jogos)" rows={4} className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-3 bg-[#bef264] text-black font-bold rounded-xl text-sm">Salvar</button>
                {editingThemeId && <button type="button" onClick={resetThemeForm} className="px-4 bg-white/10 rounded-xl text-sm font-bold">Cancelar</button>}
              </div>
            </form>

            <div className="lg:col-span-2 space-y-4">
              {themes.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-black/40 border border-white/10 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-[#bef264]">{t.theme_name}</h3>
                    <p className="text-xs text-white/50">{t.game_images?.length || 0} imagens temáticas (PNGs)</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTheme(t)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"><Edit2 className="size-4" /></button>
                    <button onClick={() => handleDeleteTheme(t.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA FESTAS */}
        {activeTab === "parties" && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSaveParty} className="flex flex-col gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
              <h2 className="text-xl font-bold text-[#bef264]">{editingPartyId ? "Editar Festa" : "Nova Festa"}</h2>
              <input type="text" value={partyName} onChange={(e) => setPartyName(e.target.value)} placeholder="Nome da Festa (Ex: Mundo do Lucas)" className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Nome da Criança" className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm" />
                <input type="number" value={childAge} onChange={(e) => setChildAge(e.target.value)} placeholder="Idade Exata" className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm" />
              </div>
              <select value={selectedThemeId} onChange={(e) => setSelectedThemeId(e.target.value)} className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm">
                <option value="">Selecione o Tema...</option>
                {themes.map(t => <option key={t.id} value={t.id}>{t.theme_name}</option>)}
              </select>
              <input type="text" value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Nome do Mascote (Opcional)" className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-3 bg-[#bef264] text-black font-bold rounded-xl text-sm">Salvar</button>
                {editingPartyId && <button type="button" onClick={resetPartyForm} className="px-4 bg-white/10 rounded-xl text-sm font-bold">Cancelar</button>}
              </div>
            </form>

            <div className="lg:col-span-2 space-y-4">
              {parties.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-black/40 border border-white/10 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-[#bef264]">{p.party_name}</h3>
                    <p className="text-xs text-white/50">{p.birthday_child_name} ({p.child_age} anos) - Tema: {p.theme}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditParty(p)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"><Edit2 className="size-4" /></button>
                    <button onClick={() => handleDeleteParty(p.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
