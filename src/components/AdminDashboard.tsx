import React, { useState, useEffect } from "react";
import { Users, PartyPopper, ExternalLink, Plus, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export function AdminDashboard({ onBackToApp }: { onBackToApp: () => void }) {
  const [activeTab, setActiveTab] = useState("clientes");
  const [clients, setClients] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states - Clients
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    const { data: clientsData } = await supabase.from("clients").select("*").order('created_at', { ascending: false });
    if (clientsData) setClients(clientsData);

    const { data: partiesData } = await supabase.from("parties").select("*, clients(name)").order('created_at', { ascending: false });
    if (partiesData) setParties(partiesData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    
    const { error } = await supabase.from('clients').insert([{
      name: clientName,
      email: clientEmail,
      phone: clientPhone
    }]);

    if (!error) {
      setClientName(""); setClientEmail(""); setClientPhone("");
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      <div className="w-full md:w-64 border-r border-white/10 p-4 flex flex-col gap-2 bg-zinc-900">
        <button onClick={onBackToApp} className="mb-4 text-left text-sm text-white/50 hover:text-white underline">← Voltar ao App</button>
        <button onClick={() => setActiveTab("clientes")} className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${activeTab === "clientes" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}>
          <Users className="size-5" /> Clientes
        </button>
        <button onClick={() => setActiveTab("festas")} className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${activeTab === "festas" ? "bg-[#bef264] text-black font-bold" : "hover:bg-white/5"}`}>
          <PartyPopper className="size-5" /> Festas
        </button>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="size-8 text-[#bef264] animate-spin" /></div>
        ) : (
          <>
            {activeTab === "clientes" && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Gestão de Clientes</h2>
                
                <form onSubmit={handleCreateClient} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Nome do Cliente" value={clientName} onChange={e => setClientName(e.target.value)} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-[#bef264] outline-none" required />
                  <input type="email" placeholder="E-mail (opcional)" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-[#bef264] outline-none" />
                  <input type="tel" placeholder="Telefone (opcional)" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-[#bef264] outline-none" />
                  <button type="submit" className="md:col-span-3 bg-[#bef264] text-black font-bold py-3 rounded-lg hover:bg-[#a3e635] flex items-center justify-center gap-2">
                    <Plus className="size-5" /> Adicionar Cliente
                  </button>
                </form>

                <div className="grid gap-3">
                  {clients.map(c => (
                    <div key={c.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-xs text-white/50">{c.email} | {c.phone}</p>
                      </div>
                    </div>
                  ))}
                  {clients.length === 0 && <p className="text-white/50 text-center py-4">Nenhum cliente cadastrado.</p>}
                </div>
              </div>
            )}

            {activeTab === "festas" && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Festas Cadastradas</h2>
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-6 text-sm text-blue-200">
                  Para criar ou editar festas a fundo, continue usando a interface que já tem no seu AdminDashboard atual. A lista abaixo foca no acesso ao painel do cliente.
                </div>
                
                <div className="grid gap-4">
                  {parties.map(party => (
                    <div key={party.id} className="bg-white/5 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/10">
                      <div>
                        <h3 className="font-bold text-lg text-[#bef264]">{party.theme}</h3>
                        <p className="text-sm">Aniversariante: {party.guestName || party.childName}</p>
                        <p className="text-xs text-white/50 mt-1">Cliente: {party.clients?.name || "Não vinculado"}</p>
                      </div>
                      
                      <a href={`/?painel=${party.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors whitespace-nowrap">
                        Acessar Painel do Cliente <ExternalLink className="size-4" />
                      </a>
                    </div>
                  ))}
                  {parties.length === 0 && <p className="text-white/50 text-center py-4">Nenhuma festa cadastrada.</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
