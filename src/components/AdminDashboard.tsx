import React, { useState, useEffect } from "react";
import { Users, PartyPopper, ExternalLink, Image as ImageIcon, Package, BarChart3, ShieldCheck, Plus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export function AdminDashboard({ onBackToApp }: { onBackToApp: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({ clients: [], themes: [], packages: [], parties: [], guests: [] });
  
  // States para Formulários
  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "" });
  const [themeForm, setThemeForm] = useState({ name: "", bgUrl: "", missionBgs: "", gameImages: "" });
  const [partyForm, setPartyForm] = useState({ name: "", clientId: "", themeId: "", packageId: "", date: "", hostName: "", hostAge: "", hostAvatar: "", hostAudio: "" });

  const fetchData = async () => {
    const [clientsRes, themesRes, packagesRes, partiesRes, guestsRes] = await Promise.all([
      supabase.from("clients").select("*").order('created_at', { ascending: false }),
      supabase.from("themes").select("*"),
      supabase.from("packages").select("*").order('max_limit', { ascending: true }),
      supabase.from("parties").select("*, clients(name), packages(name, max_limit)").order('created_at', { ascending: false }),
      supabase.from("guests").select("*, parties(name, host_name)")
    ]);

    setData({
      clients: clientsRes.data || [],
      themes: themesRes.data || [],
      packages: packagesRes.data || [],
      parties: partiesRes.data || [],
      guests: guestsRes.data || []
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('clients').insert([clientForm]);
    setClientForm({ name: "", email: "", phone: "" });
    fetchData();
  };

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('themes').insert([{
      theme_name: themeForm.name,
      background_url: themeForm.bgUrl,
      background_urls: themeForm.missionBgs.split(',').map(s => s.trim()),
      game_images: themeForm.gameImages.split(',').map(s => s.trim())
    }]);
    setThemeForm({ name: "", bgUrl: "", missionBgs: "", gameImages: "" });
    fetchData();
  };

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTheme = data.themes.find((t: any) => t.id === partyForm.themeId);
    
    await supabase.from('parties').insert([{
      name: partyForm.name,
      client_id: partyForm.clientId,
      theme_id: partyForm.themeId,
      package_id: partyForm.packageId,
      theme: selectedTheme?.theme_name || "Aventura",
      host_name: partyForm.hostName,
      host_age: partyForm.hostAge,
      host_avatar: partyForm.hostAvatar,
      host_audio: partyForm.hostAudio,
      party_date: partyForm.date || null
    }]);
    setPartyForm({ name: "", clientId: "", themeId: "", packageId: "", date: "", hostName: "", hostAge: "", hostAvatar: "", hostAudio: "" });
    fetchData();
  };

  const overviewStats = {
    totalClients: data.clients.length,
    totalParties: data.parties.length,
    activeParties: data.parties.filter((p: any) => p.status === 'ativa').length,
    totalGuests: data.guests.length,
    totalCapacity: data.parties.reduce((acc, p: any) => acc + (p.packages?.max_limit || 0), 0)
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row font-sans">
      <div className="w-full md:w-64 border-r border-white/10 p-4 flex flex-col gap-2 bg-zinc-900">
        <button onClick={onBackToApp} className="mb-4 text-left text-sm text-white/50 hover:text-white underline">← Sair do Admin</button>
        
        <button onClick={() => setActiveTab("overview")} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "overview" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><BarChart3 className="size-5" /> Visão Geral</button>
        <button onClick={() => setActiveTab("clients")} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "clients" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><Users className="size-5" /> Clientes</button>
        <button onClick={() => setActiveTab("themes")} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "themes" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><ImageIcon className="size-5" /> Temas</button>
        <button onClick={() => setActiveTab("packages")} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "packages" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><Package className="size-5" /> Pacotes</button>
        <button onClick={() => setActiveTab("parties")} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "parties" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><PartyPopper className="size-5" /> Festas</button>
        <button onClick={() => setActiveTab("accesses")} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "accesses" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><ShieldCheck className="size-5" /> Acessos</button>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-white/50 text-sm">Total de Clientes</p><p className="text-3xl font-black text-[#bef264]">{overviewStats.totalClients}</p></div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-white/50 text-sm">Festas Ativas</p><p className="text-3xl font-black text-[#bef264]">{overviewStats.activeParties}</p></div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-white/50 text-sm">Convidados Cadastrados</p><p className="text-3xl font-black text-[#bef264]">{overviewStats.totalGuests}</p></div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-white/50 text-sm">Vagas Globais Disponíveis</p><p className="text-3xl font-black text-[#bef264]">{overviewStats.totalCapacity > 90000 ? 'Ilimitado' : overviewStats.totalCapacity - overviewStats.totalGuests}</p></div>
            </div>
          </div>
        )}

        {activeTab === "clients" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Cadastro de Clientes</h2>
            <form onSubmit={handleCreateClient} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Nome do Responsável" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-[#bef264]" required />
              <input type="email" placeholder="E-mail" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-[#bef264]" required />
              <input type="tel" placeholder="Telefone" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-[#bef264]" />
              <button type="submit" className="md:col-span-3 bg-[#bef264] text-black font-bold py-3 rounded-lg hover:bg-[#a3e635]">Adicionar Cliente</button>
            </form>
            <div className="grid gap-3">
              {data.clients.map((c: any) => (
                <div key={c.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between"><p className="font-bold">{c.name} <span className="text-xs font-normal text-white/50 ml-2">{c.email} | {c.phone}</span></p><span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">{c.status}</span></div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "themes" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Cadastro de Temas</h2>
            <form onSubmit={handleCreateTheme} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 grid grid-cols-1 gap-4">
              <input type="text" placeholder="Nome do Tema (ex: Dinossauros)" value={themeForm.name} onChange={e => setThemeForm({...themeForm, name: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3" required />
              <input type="url" placeholder="URL do Fundo Principal (Jogos)" value={themeForm.bgUrl} onChange={e => setThemeForm({...themeForm, bgUrl: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3" required />
              <textarea placeholder="URLs dos Fundos da Missão (separados por vírgula)" value={themeForm.missionBgs} onChange={e => setThemeForm({...themeForm, missionBgs: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 h-20" required />
              <textarea placeholder="URLs dos Personagens dos Jogos (separados por vírgula)" value={themeForm.gameImages} onChange={e => setThemeForm({...themeForm, gameImages: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 h-20" required />
              <button type="submit" className="bg-[#bef264] text-black font-bold py-3 rounded-lg hover:bg-[#a3e635]">Salvar Tema</button>
            </form>
            <div className="grid gap-3">
              {data.themes.map((t: any) => (
                <div key={t.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                  <div><p className="font-bold">{t.theme_name}</p><p className="text-xs text-white/50">{t.game_images?.length || 0} personagens cadastrados</p></div>
                  <img src={t.background_url} alt="bg" className="h-12 w-20 object-cover rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "packages" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Pacotes Comerciais</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.packages.map((pkg: any) => (
                <div key={pkg.id} className="bg-white/5 p-6 rounded-xl border border-white/10 flex justify-between items-center">
                  <span className="font-bold">{pkg.name}</span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">{pkg.max_limit > 90000 ? 'Ilimitado' : `Máx: ${pkg.max_limit}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "parties" && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Cadastro de Festas</h2>
            <form onSubmit={handleCreateParty} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Dados Gerais</label>
                  <input type="text" placeholder="Nome da Festa" value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3" required />
                  <select value={partyForm.clientId} onChange={e => setPartyForm({...partyForm, clientId: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3" required><option value="">Selecione o Cliente</option>{data.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  <select value={partyForm.themeId} onChange={e => setPartyForm({...partyForm, themeId: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3" required><option value="">Selecione o Tema</option>{data.themes.map((t: any) => <option key={t.id} value={t.id}>{t.theme_name}</option>)}</select>
                  <select value={partyForm.packageId} onChange={e => setPartyForm({...partyForm, packageId: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3" required><option value="">Selecione o Pacote</option>{data.packages.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                  <input type="date" value={partyForm.date} onChange={e => setPartyForm({...partyForm, date: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Dados do Aniversariante</label>
                  <input type="text" placeholder="Nome do Aniversariante" value={partyForm.hostName} onChange={e => setPartyForm({...partyForm, hostName: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3" required />
                  <input type="text" placeholder="Faixa Etária / Idade" value={partyForm.hostAge} onChange={e => setPartyForm({...partyForm, hostAge: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3" required />
                  <input type="url" placeholder="URL do Avatar (opcional)" value={partyForm.hostAvatar} onChange={e => setPartyForm({...partyForm, hostAvatar: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3" />
                  <input type="url" placeholder="URL do Áudio (opcional)" value={partyForm.hostAudio} onChange={e => setPartyForm({...partyForm, hostAudio: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#bef264] text-black font-bold py-3 rounded-lg hover:bg-[#a3e635]">Criar Festa e Vincular Cliente</button>
            </form>

            <div className="grid gap-4">
              {data.parties.map((party: any) => {
                const guestsForParty = data.guests.filter((g: any) => g.party_id === party.id).length;
                const limit = party.packages?.max_limit || 0;
                return (
                  <div key={party.id} className="bg-white/5 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/10">
                    <div>
                      <h3 className="font-bold text-lg text-[#bef264]">{party.name || party.theme}</h3>
                      <p className="text-sm">Aniversariante: <span className="font-bold">{party.host_name}</span> ({party.host_age})</p>
                      <p className="text-xs text-white/50 mt-1">Cliente: {party.clients?.name} | Pacote: {party.packages?.name}</p>
                      <p className="text-xs mt-2 text-blue-300">Vagas: {guestsForParty} / {limit > 90000 ? 'Ilimitado' : limit} ocupadas (Aniversariante não contabiliza)</p>
                    </div>
                    <a href={`/?painel=${party.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20">
                      Painel do Cliente <ExternalLink className="size-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "accesses" && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Controle de Acessos</h2>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/50">
                  <tr><th className="p-4">Convidado</th><th className="p-4">Faixa Etária</th><th className="p-4">Código</th><th className="p-4">Festa</th><th className="p-4">Status</th></tr>
                </thead>
                <tbody>
                  {data.guests.map((g: any) => (
                    <tr key={g.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4 font-bold">{g.name}</td>
                      <td className="p-4 text-white/60">{g.age_group}</td>
                      <td className="p-4 font-mono text-[#bef264]">{g.code}</td>
                      <td className="p-4">{g.parties?.name || 'Festa Genérica'}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">{g.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
