import React, { useState, useEffect } from "react";
import { Users, PartyPopper, ExternalLink, Image as ImageIcon, Package, BarChart3, ShieldCheck, Plus, Trash2, Edit, Search } from "lucide-react";
import { supabase } from "../lib/supabase";

export function AdminDashboard({ onBackToApp }: { onBackToApp: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({ clients: [], themes: [], packages: [], parties: [], guests: [] });
  const [search, setSearch] = useState("");
  
  const [clientForm, setClientForm] = useState({ id: "", name: "", email: "", phone: "", observations: "", status: "ativo" });
  const [themeForm, setThemeForm] = useState({ id: "", name: "", bgUrl: "", missionBgs: "", gameImages: "" });
  const [packageForm, setPackageForm] = useState({ id: "", price: "" });
  const [partyForm, setPartyForm] = useState({ id: "", name: "", clientId: "", themeId: "", packageId: "", date: "", hostName: "", hostAge: "", hostAvatar: "", hostAudio: "" });

  const fetchData = async () => {
    const [clientsRes, themesRes, packagesRes, partiesRes, guestsRes] = await Promise.all([
      supabase.from("clients").select("*").order('created_at', { ascending: false }),
      supabase.from("themes").select("*"),
      supabase.from("packages").select("*").order('max_limit', { ascending: true }),
      supabase.from("parties").select("*, clients(name), packages(name, max_limit)").order('created_at', { ascending: false }),
      supabase.from("guests").select("*, parties(party_name, host_name)")
    ]);
    setData({ clients: clientsRes.data || [], themes: themesRes.data || [], packages: packagesRes.data || [], parties: partiesRes.data || [], guests: guestsRes.data || [] });
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (table: string, id: string) => {
    if (window.confirm("ATENÇÃO: Tem certeza que deseja excluir este registro permanentemente?")) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) alert("Erro ao excluir: " + error.message);
      else fetchData();
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    let error;
    if (clientForm.id) {
      const res = await supabase.from('clients').update({ name: clientForm.name, email: clientForm.email, phone: clientForm.phone, observations: clientForm.observations, status: clientForm.status }).eq('id', clientForm.id);
      error = res.error;
    } else {
      const res = await supabase.from('clients').insert([{ name: clientForm.name, email: clientForm.email, phone: clientForm.phone, observations: clientForm.observations }]);
      error = res.error;
    }
    
    if (error) alert("Erro ao salvar cliente: " + error.message);
    else {
      setClientForm({ id: "", name: "", email: "", phone: "", observations: "", status: "ativo" });
      fetchData();
    }
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { theme_name: themeForm.name, background_url: themeForm.bgUrl, background_urls: themeForm.missionBgs.split(',').map(s => s.trim()), game_images: themeForm.gameImages.split(',').map(s => s.trim()) };
    let error;
    
    if (themeForm.id) {
      const res = await supabase.from('themes').update(payload).eq('id', themeForm.id);
      error = res.error;
    } else {
      const res = await supabase.from('themes').insert([payload]);
      error = res.error;
    }

    if (error) alert("Erro ao salvar tema: " + error.message);
    else {
      setThemeForm({ id: "", name: "", bgUrl: "", missionBgs: "", gameImages: "" });
      fetchData();
    }
  };

  const handleSaveParty = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTheme = data.themes.find((t: any) => t.id === partyForm.themeId);
    
    const hostCodeStr = partyForm.hostName ? `${partyForm.hostName.toUpperCase().replace(/\s+/g, '')}-VIP` : 'MASTER-VIP';

    const payload = {
      party_name: partyForm.name,
      birthday_child_name: partyForm.hostName, 
      child_age: parseInt(partyForm.hostAge, 10) || 5, 
      character_name: 'Mascote',
      photo_url: partyForm.hostAvatar || '', 
      client_id: partyForm.clientId || null,
      theme_id: partyForm.themeId || null,
      package_id: partyForm.packageId || null,
      theme: selectedTheme?.theme_name || "Aventura",
      host_name: partyForm.hostName,
      host_age: partyForm.hostAge,
      host_avatar: partyForm.hostAvatar,
      host_audio: partyForm.hostAudio,
      host_code: hostCodeStr,
      party_date: partyForm.date || null
    };

    let error;
    if (partyForm.id) {
      const res = await supabase.from('parties').update(payload).eq('id', partyForm.id);
      error = res.error;
    } else {
      const res = await supabase.from('parties').insert([payload]);
      error = res.error;
    }
    
    if (error) {
      alert("Erro ao salvar a festa! Detalhe: " + error.message);
    } else {
      setPartyForm({ id: "", name: "", clientId: "", themeId: "", packageId: "", date: "", hostName: "", hostAge: "", hostAvatar: "", hostAudio: "" });
      fetchData();
    }
  };

  const handleUpdatePackagePrice = async (e: React.FormEvent, id: string, price: string) => {
    e.preventDefault();
    const { error } = await supabase.from('packages').update({ price: parseFloat(price) || 0 }).eq('id', id);
    if (error) alert("Erro ao atualizar preço: " + error.message);
    else {
      setPackageForm({ id: "", price: "" });
      fetchData();
    }
  };

  const handleRevokeAccess = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'revogado' ? 'ativo' : 'revogado';
    if (window.confirm(`Deseja alterar o status para ${newStatus}? Acessos revogados são bloqueados imediatamente.`)) {
      const { error } = await supabase.from('guests').update({ status: newStatus }).eq('id', id);
      if (error) alert("Erro ao alterar status: " + error.message);
      else fetchData();
    }
  };

  const filteredData = (list: any[], fields: string[]) => list.filter(item => fields.some(field => String(item[field] || '').toLowerCase().includes(search.toLowerCase())));

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
        <button onClick={() => {setActiveTab("clients"); setSearch("");}} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "clients" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><Users className="size-5" /> Clientes</button>
        <button onClick={() => {setActiveTab("themes"); setSearch("");}} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "themes" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><ImageIcon className="size-5" /> Temas</button>
        <button onClick={() => setActiveTab("packages")} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "packages" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><Package className="size-5" /> Pacotes</button>
        <button onClick={() => {setActiveTab("parties"); setSearch("");}} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "parties" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><PartyPopper className="size-5" /> Festas</button>
        <button onClick={() => {setActiveTab("accesses"); setSearch("");}} className={`flex items-center gap-2 p-3 rounded-lg ${activeTab === "accesses" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}><ShieldCheck className="size-5" /> Acessos</button>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {["clients", "themes", "parties", "accesses"].includes(activeTab) && (
            <div className="mb-6 flex bg-white/5 border border-white/20 rounded-lg p-2 items-center">
              <Search className="size-5 text-white/50 mx-2" />
              <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none text-white outline-none flex-1" />
            </div>
          )}

          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-white/50 text-sm">Total de Clientes</p><p className="text-3xl font-black text-[#bef264]">{overviewStats.totalClients}</p></div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-white/50 text-sm">Festas Ativas</p><p className="text-3xl font-black text-[#bef264]">{overviewStats.activeParties}</p></div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-white/50 text-sm">Convidados</p><p className="text-3xl font-black text-[#bef264]">{overviewStats.totalGuests}</p></div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-white/50 text-sm">Vagas Disponíveis</p><p className="text-3xl font-black text-[#bef264]">{overviewStats.totalCapacity > 90000 ? 'Ilimitado' : overviewStats.totalCapacity - overviewStats.totalGuests}</p></div>
              </div>
            </div>
          )}

          {activeTab === "clients" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Cadastro de Clientes</h2>
              <form onSubmit={handleSaveClient} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Nome" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-[#bef264]" required />
                <input type="email" placeholder="E-mail" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-[#bef264]" />
                <input type="tel" placeholder="Telefone" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-[#bef264]" />
                <input type="text" placeholder="Observações Administrativas" value={clientForm.observations} onChange={e => setClientForm({...clientForm, observations: e.target.value})} className="md:col-span-2 bg-black/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-[#bef264]" />
                <select value={clientForm.status} onChange={e => setClientForm({...clientForm, status: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white outline-none focus:border-[#bef264]">
                  <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
                </select>
                <button type="submit" className="md:col-span-3 bg-[#bef264] text-black font-bold py-3 rounded-lg hover:bg-[#a3e635]">{clientForm.id ? "Atualizar Cliente" : "Adicionar Cliente"}</button>
              </form>

              <div className="grid gap-4">
                {filteredData(data.clients, ['name', 'email', 'phone']).map((c: any) => {
                  const clientParties = data.parties.filter((p: any) => p.client_id === c.id);
                  
                  return (
                    <div key={c.id} className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col gap-4 transition-all">
                      <div className="flex justify-between items-start md:items-center">
                        <div>
                          <p className="font-bold text-lg">{c.name} <span className="text-xs font-normal text-white/50 ml-2">Cód: {c.code} | Criado em: {new Date(c.created_at).toLocaleDateString()}</span></p>
                          <p className="text-sm text-white/60">{c.email} | {c.phone} {c.observations && `- Obs: ${c.observations}`}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className={`text-xs px-2 py-1 rounded ${c.status === 'ativo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.status}</span>
                          <button onClick={() => setClientForm({ id: c.id, name: c.name, email: c.email || "", phone: c.phone || "", observations: c.observations || "", status: c.status || "ativo" })} className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/40" title="Editar Cliente"><Edit className="size-4" /></button>
                          <button onClick={() => handleDelete('clients', c.id)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40" title="Excluir Cliente"><Trash2 className="size-4" /></button>
                        </div>
                      </div>

                      <div className="bg-black/40 rounded-lg border border-white/5 p-4 mt-2">
                        <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">Festas Contratadas ({clientParties.length})</h4>
                        {clientParties.length > 0 ? (
                          <div className="grid gap-2">
                            {clientParties.map((cp: any) => (
                              <div key={cp.id} className="flex flex-col md:flex-row justify-between md:items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                <div>
                                  <p className="font-bold text-[#bef264] text-sm">{cp.party_name || cp.theme}</p>
                                  <p className="text-xs text-white/60 mt-0.5">Tema: {cp.theme} | Aniversariante: {cp.host_name}</p>
                                </div>
                                <div className="text-xs text-white/70 flex flex-wrap items-center gap-3 mt-2 md:mt-0">
                                  <span className="bg-black/50 px-2 py-1 rounded">Pacote: {cp.packages?.name || 'Não definido'}</span>
                                  <span className="bg-black/50 px-2 py-1 rounded">Validade: {cp.valid_until ? new Date(cp.valid_until).toLocaleDateString() : 'N/A'}</span>
                                  <span className={`px-2 py-1 rounded font-bold ${cp.status === 'ativa' || !cp.status ? 'text-green-400' : 'text-red-400'}`}>{cp.status || 'ativa'}</span>
                                  <a href={`/?painel=${cp.id}`} target="_blank" rel="noopener noreferrer" className="ml-2 flex items-center gap-1 text-blue-300 hover:text-blue-200 transition-colors">
                                    Acessar Painel <ExternalLink className="size-3" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/30 italic">Nenhuma festa vinculada a este cliente.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "themes" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Cadastro de Temas</h2>
              <form onSubmit={handleSaveTheme} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 grid grid-cols-1 gap-4">
                <input type="text" placeholder="Nome do Tema" value={themeForm.name} onChange={e => setThemeForm({...themeForm, name: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3" required />
                <input type="url" placeholder="URL Fundo Principal" value={themeForm.bgUrl} onChange={e => setThemeForm({...themeForm, bgUrl: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3" required />
                <textarea placeholder="URLs Missão (separados por vírgula)" value={themeForm.missionBgs} onChange={e => setThemeForm({...themeForm, missionBgs: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 h-20" />
                <textarea placeholder="URLs Personagens (separados por vírgula)" value={themeForm.gameImages} onChange={e => setThemeForm({...themeForm, gameImages: e.target.value})} className="bg-black/50 border border-white/20 rounded-lg p-3 h-20" />
                <button type="submit" className="bg-[#bef264] text-black font-bold py-3 rounded-lg hover:bg-[#a3e635]">{themeForm.id ? "Atualizar Tema" : "Salvar Tema"}</button>
              </form>
              <div className="grid gap-3">
                {filteredData(data.themes, ['theme_name']).map((t: any) => (
                  <div key={t.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={t.background_url} alt="bg" className="h-12 w-20 object-cover rounded" />
                      <div><p className="font-bold">{t.theme_name}</p><p className="text-xs text-white/50">{t.game_images?.length || 0} personagens</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setThemeForm({ id: t.id, name: t.theme_name, bgUrl: t.background_url, missionBgs: (t.background_urls || []).join(', '), gameImages: (t.game_images || []).join(', ') })} className="p-2 bg-blue-500/20 text-blue-300 rounded"><Edit className="size-4" /></button>
                      <button onClick={() => handleDelete('themes', t.id)} className="p-2 bg-red-500/20 text-red-400 rounded"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "packages" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Pacotes Comerciais</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {data.packages.map((pkg: any) => (
                  <div key={pkg.id} className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{pkg.name}</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">{pkg.max_limit > 90000 ? 'Ilimitado' : `Máx: ${pkg.max_limit}`}</span>
                    </div>
                    {packageForm.id === pkg.id ? (
                      <form onSubmit={(e) => handleUpdatePackagePrice(e, pkg.id, packageForm.price)} className="flex gap-2">
                        <input type="number" step="0.01" value={packageForm.price} onChange={e => setPackageForm({...packageForm, price: e.target.value})} className="bg-black/50 border border-white/20 rounded p-2 flex-1 outline-none" placeholder="Preço R$" required />
                        <button type="submit" className="bg-[#bef264] text-black px-4 rounded font-bold">Salvar</button>
                      </form>
                    ) : (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">Preço: <strong className="text-white">R$ {Number(pkg.price || 0).toFixed(2)}</strong></span>
                        <button onClick={() => setPackageForm({ id: pkg.id, price: pkg.price })} className="text-[#bef264] underline">Editar Preço</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "parties" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Gestão de Festas</h2>
              <form onSubmit={handleSaveParty} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Dados Gerais</label>
                    <input type="text" placeholder="Nome da Festa" value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3 outline-none focus:border-[#bef264]" required />
                    <select value={partyForm.clientId} onChange={e => setPartyForm({...partyForm, clientId: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3 outline-none focus:border-[#bef264]" required><option value="">Selecione o Cliente</option>{data.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <select value={partyForm.themeId} onChange={e => setPartyForm({...partyForm, themeId: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3 outline-none focus:border-[#bef264]" required><option value="">Selecione o Tema</option>{data.themes.map((t: any) => <option key={t.id} value={t.id}>{t.theme_name}</option>)}</select>
                    <select value={partyForm.packageId} onChange={e => setPartyForm({...partyForm, packageId: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3 outline-none focus:border-[#bef264]" required><option value="">Selecione o Pacote</option>{data.packages.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <input type="date" value={partyForm.date} onChange={e => setPartyForm({...partyForm, date: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 outline-none focus:border-[#bef264]" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Dados do Aniversariante</label>
                    <input type="text" placeholder="Nome do Aniversariante" value={partyForm.hostName} onChange={e => setPartyForm({...partyForm, hostName: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3 outline-none focus:border-[#bef264]" required />
                    <select value={partyForm.hostAge} onChange={e => setPartyForm({...partyForm, hostAge: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3 outline-none focus:border-[#bef264]" required>
                      <option value="">Selecione a Faixa Etária</option><option value="4-5">4 a 5 anos</option><option value="6-7">6 a 7 anos</option><option value="8-9">8 a 9 anos</option><option value="10-11">10 a 11 anos</option>
                    </select>
                    <input type="url" placeholder="URL do Avatar (opcional)" value={partyForm.hostAvatar} onChange={e => setPartyForm({...partyForm, hostAvatar: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 mb-3 outline-none focus:border-[#bef264]" />
                    <input type="url" placeholder="URL do Áudio (opcional)" value={partyForm.hostAudio} onChange={e => setPartyForm({...partyForm, hostAudio: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 outline-none focus:border-[#bef264]" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#bef264] text-black font-bold py-3 rounded-lg hover:bg-[#a3e635]">{partyForm.id ? "Atualizar Festa" : "Criar Festa e Vincular Cliente"}</button>
              </form>

              <div className="grid gap-4">
                {filteredData(data.parties, ['party_name', 'theme', 'host_name']).map((party: any) => (
                  <div key={party.id} className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#bef264]">{party.party_name || party.theme}</h3>
                      <p className="text-sm">Aniversariante: {party.host_name} ({party.host_age}) | Cód Master: <span className="font-mono text-[#bef264]">{party.host_code || 'Não gerado'}</span></p>
                      <p className="text-xs text-white/50 mt-1">Cliente: {party.clients?.name} | Validade: {new Date(party.valid_until).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setPartyForm({ id: party.id, name: party.party_name || "", clientId: party.client_id || "", themeId: party.theme_id || "", packageId: party.package_id || "", date: party.party_date || "", hostName: party.host_name || "", hostAge: party.host_age || "", hostAvatar: party.host_avatar || "", hostAudio: party.host_audio || "" })} className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/40" title="Editar Festa"><Edit className="size-4" /></button>
                       <a href={`/?painel=${party.id}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20" title="Acessar Painel do Cliente"><ExternalLink className="size-4" /></a>
                       <button onClick={() => handleDelete('parties', party.id)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40" title="Excluir Festa"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "accesses" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Controle e Revogação de Acessos</h2>
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/50">
                    <tr><th className="p-4">Convidado</th><th className="p-4">Código</th><th className="p-4">Festa</th><th className="p-4">Status</th><th className="p-4">Ação</th></tr>
                  </thead>
                  <tbody>
                    {filteredData(data.guests, ['name', 'code']).map((g: any) => (
                      <tr key={g.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-4 font-bold">{g.name} <span className="block text-xs text-white/50">{g.age_group}</span></td>
                        <td className="p-4 font-mono text-[#bef264]">{g.code}</td>
                        <td className="p-4">{g.parties?.party_name || 'Festa Genérica'}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${g.status === 'revogado' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{g.status}</span></td>
                        <td className="p-4">
                          <button onClick={() => handleRevokeAccess(g.id, g.status)} className={`px-3 py-1 rounded text-xs font-bold ${g.status === 'revogado' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                            {g.status === 'revogado' ? 'Restaurar' : 'Revogar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
