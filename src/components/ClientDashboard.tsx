import React, { useState, useEffect } from "react";
import { Copy, UserPlus, Crown, Users, Check, Sparkles, Trash2, Loader2, Share2, BookOpen, AlertTriangle, Edit, X, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

const educationalBenefits: Record<string, { title: string, desc: string }> = {
  "4-5": { title: "4 a 5 anos", desc: "Foco em coordenação motora fina, reconhecimento visual e associação básica de formas e cores." },
  "6-7": { title: "6 a 7 anos", desc: "Estimula a leitura inicial, raciocínio lógico e resolução de problemas através de quebra-cabeças." },
  "8-9": { title: "8 a 9 anos", desc: "Aprimora o foco, cálculo rápido e retenção de informações através de desafios de memória avançada." },
  "10-11": { title: "10 a 11 anos", desc: "Exige planejamento estratégico, antecipação de jogadas e adaptação a regras dinâmicas." }
};

export function ClientDashboard({ partyId, onLogout }: { partyId: string; onLogout?: () => void }) {
  const [partyData, setPartyData] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestAge, setNewGuestAge] = useState("4-5");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de edição inline
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("4-5");

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { data: party } = await supabase.from('parties').select('*, packages(max_limit)').eq('id', partyId).single();
    if (party) {
      setPartyData({
        name: party.party_name || party.theme || "Nossa Festa",
        theme: party.theme,
        childName: party.host_name || "Aniversariante",
        childAvatar: party.host_avatar,
        childAgeGroup: party.host_age || "4-5",
        packageLimit: party.packages?.max_limit || 30,
        hostCode: party.host_code || `${(party.host_name || 'MASTER').toUpperCase().replace(/\s+/g, '')}-VIP`
      });
    }
    const { data: guestsData } = await supabase.from('guests').select('*').eq('party_id', partyId).order('created_at', { ascending: false });
    if (guestsData) setGuests(guestsData);
    setIsLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [partyId]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !partyData || guests.length >= partyData.packageLimit) return;
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase.from('guests').insert([{ 
      party_id: partyId, name: newGuestName.trim(), age_group: newGuestAge, code: code 
    }]).select().single();
    
    if (error) alert("ERRO AO ADICIONAR: " + error.message);
    else if (data) {
      setGuests([data, ...guests]);
      setNewGuestName("");
    }
  };

  const handleRemoveGuest = async (id: string) => {
    if(window.confirm("Deseja mesmo excluir este convidado?")) {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (!error) setGuests(guests.filter(g => g.id !== id));
    }
  };

  const startEdit = (guest: any) => {
    setEditingGuestId(guest.id);
    setEditName(guest.name);
    setEditAge(guest.age_group);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase.from('guests').update({ name: editName.trim(), age_group: editAge }).eq('id', id);
    if (!error) {
      setGuests(guests.map(g => g.id === id ? { ...g, name: editName.trim(), age_group: editAge } : g));
      setEditingGuestId(null);
    } else {
      alert("Erro ao editar: " + error.message);
    }
  };

  const copyInvite = (guest: any) => {
    const inviteText = `Você foi convidado para a aventura de aniversário do ${partyData.childName}!\nAcesse: ${window.location.origin}\nSeu código: ${guest.code}`;
    navigator.clipboard.writeText(inviteText);
    setCopiedCode(guest.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="size-8 text-[#bef264] animate-spin" /></div>;
  if (!partyData) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Festa não encontrada.</div>;

  const isPackageFull = guests.length >= partyData.packageLimit;
  const isUnlimited = partyData.packageLimit > 90000;

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 sm:p-8 font-sans overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black text-[#bef264] flex items-center gap-2"><Sparkles className="size-6" /> {partyData.name}</h1>
            <p className="text-white/60 text-sm mt-1">Tema: <strong className="text-white">{partyData.theme}</strong></p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.open(window.location.origin, '_blank')} className="text-sm font-bold text-[#bef264] hover:text-[#a3e635] flex items-center gap-1 transition-colors">
              Ir para o Jogo <ExternalLink className="size-4" />
            </button>
            {onLogout && <button onClick={onLogout} className="text-sm underline text-white/50 hover:text-white">Sair</button>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-[#bef264]/20 to-black/40 border border-[#bef264]/40 p-6 rounded-3xl flex flex-col items-center text-center">
              {partyData.childAvatar ? <img src={partyData.childAvatar} alt="Avatar" className="size-20 rounded-full border-2 border-[#bef264] mb-3 object-cover" /> : <Crown className="size-16 text-[#bef264] mb-3" />}
              <h2 className="text-xl font-bold text-white mb-1">Acesso do Aniversariante</h2>
              <p className="text-xs text-white/60 mb-4">{partyData.childName} (Faixa: {partyData.childAgeGroup})</p>
              <div className="w-full bg-black/60 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                <span className="font-mono font-black tracking-widest text-[#bef264]">{partyData.hostCode}</span>
              </div>
            </div>

            <div className="bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-[#bef264]"><BookOpen className="size-5" /> Benefícios Educativos</h3>
              <div className="space-y-4">
                {Object.entries(educationalBenefits).map(([age, info]) => (
                  <div key={age} className="text-sm">
                    <strong className="text-white">{info.title}:</strong> <span className="text-white/60">{info.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md flex flex-col">
            
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="size-6 text-orange-400 shrink-0" />
              <p className="text-orange-200 text-sm">
                <strong className="text-orange-300">Atenção:</strong> Não utilize os códigos dos convidados para testar o aplicativo. Para testes, utilize exclusivamente o código do aniversariante.
              </p>
            </div>

            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="size-5 text-[#bef264]" /> Convidados</h2>
                <p className="text-xs text-white/60 mt-1">Gere os códigos individuais</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${isPackageFull ? 'text-red-400' : 'text-white'}`}>{guests.length}</span>
                <span className="text-white/50 text-sm"> / {isUnlimited ? 'Ilimitado' : partyData.packageLimit}</span>
              </div>
            </div>

            <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row gap-3 mb-6">
              <input type="text" placeholder="Nome do Convidado" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} disabled={isPackageFull} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#bef264] outline-none" />
              <select value={newGuestAge} onChange={(e) => setNewGuestAge(e.target.value)} disabled={isPackageFull} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#bef264] outline-none [&>option]:bg-zinc-900">
                <option value="4-5">4 a 5 anos</option><option value="6-7">6 a 7 anos</option><option value="8-9">8 a 9 anos</option><option value="10-11">10 a 11 anos</option>
              </select>
              <button type="submit" disabled={isPackageFull || !newGuestName.trim()} className="bg-[#bef264] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#a3e635] disabled:opacity-50">Adicionar</button>
            </form>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
              {guests.map(guest => (
                <div key={guest.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl gap-4 sm:gap-0">
                  
                  {editingGuestId === guest.id ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full pr-4">
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="bg-black/50 border border-[#bef264] rounded px-3 py-1.5 text-sm text-white flex-1 outline-none" />
                      <select value={editAge} onChange={e => setEditAge(e.target.value)} className="bg-black/50 border border-[#bef264] rounded px-3 py-1.5 text-sm text-white outline-none [&>option]:bg-zinc-900">
                        <option value="4-5">4 a 5 anos</option><option value="6-7">6 a 7 anos</option><option value="8-9">8 a 9 anos</option><option value="10-11">10 a 11 anos</option>
                      </select>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button onClick={() => handleSaveEdit(guest.id)} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40" title="Salvar"><Check className="size-4" /></button>
                        <button onClick={() => setEditingGuestId(null)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40" title="Cancelar"><X className="size-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-sm block">{guest.name}</span>
                      <span className="text-xs text-white/50">Faixa: {guest.age_group} anos</span>
                    </div>
                  )}

                  {editingGuestId !== guest.id && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className={`px-2 py-1 rounded text-xs hidden sm:block ${guest.status === 'revogado' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{guest.status || 'ativo'}</span>
                      <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="font-mono text-sm tracking-widest text-[#bef264]">{guest.code}</span>
                      </div>
                      <button onClick={() => startEdit(guest)} className="p-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 rounded-lg transition-all" title="Editar Convidado"><Edit className="size-4" /></button>
                      {guest.status !== 'revogado' && (
                        <button onClick={() => copyInvite(guest)} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg text-xs font-bold transition-all">
                          {copiedCode === guest.code ? <Check className="size-4 text-green-400" /> : <Share2 className="size-4" />}
                        </button>
                      )}
                      <button onClick={() => handleRemoveGuest(guest.id)} className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Excluir Convidado"><Trash2 className="size-4" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
