import React, { useState, useEffect } from "react";
import { Copy, UserPlus, Crown, Users, Check, Sparkles, Trash2, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Guest {
  id: string;
  name: string;
  age_group: string;
  code: string;
}

export function ClientDashboard({ partyId, onLogout }: { partyId: string; onLogout?: () => void }) {
  const [partyData, setPartyData] = useState<any>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestAge, setNewGuestAge] = useState("4-5");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [partyId]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    // Busca dados da festa
    const { data: party } = await supabase.from('parties').select('*').eq('id', partyId).single();
    if (party) {
      setPartyData({
        theme: party.theme,
        childName: party.guestName || party.childName,
        packageLimit: party.package_limit || 30,
        hostCode: party.host_code || `${party.guestName?.toUpperCase()}-VIP`
      });
    }

    // Busca convidados cadastrados
    const { data: guestsData } = await supabase.from('guests').select('*').eq('party_id', partyId).order('created_at', { ascending: false });
    if (guestsData) setGuests(guestsData);
    
    setIsLoading(false);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !partyData || guests.length >= partyData.packageLimit) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGuest = {
      party_id: partyId,
      name: newGuestName.trim(),
      age_group: newGuestAge,
      code: code
    };

    const { data, error } = await supabase.from('guests').insert([newGuest]).select().single();
    if (!error && data) {
      setGuests([data, ...guests]);
      setNewGuestName("");
    } else {
      alert("Erro ao adicionar convidado. Tente novamente.");
    }
  };

  const handleRemoveGuest = async (id: string) => {
    const { error } = await supabase.from('guests').delete().eq('id', id);
    if (!error) {
      setGuests(guests.filter(g => g.id !== id));
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="size-8 text-[#bef264] animate-spin" /></div>;
  if (!partyData) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Festa não encontrada.</div>;

  const isPackageFull = guests.length >= partyData.packageLimit;

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 sm:p-8 font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black text-[#bef264] flex items-center gap-2">
              <Sparkles className="size-6" /> Painel da Festa
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Tema: <strong className="text-white">{partyData.theme}</strong>
            </p>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="text-sm underline text-white/50 hover:text-white">
              Sair do Painel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gradient-to-br from-[#bef264]/20 to-black/40 border border-[#bef264]/40 p-6 rounded-3xl backdrop-blur-md flex flex-col items-center text-center shadow-[0_0_20px_rgba(190,242,100,0.1)]">
            <Crown className="size-12 text-[#bef264] mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">Acesso Especial</h2>
            <p className="text-xs text-white/60 mb-4">Código mestre de {partyData.childName}</p>
            
            <div className="w-full bg-black/60 border border-white/10 rounded-xl p-3 flex justify-between items-center mb-2">
              <span className="font-mono font-black tracking-widest text-[#bef264]">{partyData.hostCode}</span>
              <button onClick={() => copyToClipboard(partyData.hostCode)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                {copiedCode === partyData.hostCode ? <Check className="size-4 text-green-400" /> : <Copy className="size-4 text-white" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md flex flex-col">
            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="size-5 text-[#bef264]" /> Convidados</h2>
                <p className="text-xs text-white/60 mt-1">Cadastre quem vai jogar no aplicativo</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${isPackageFull ? 'text-red-400' : 'text-white'}`}>{guests.length}</span>
                <span className="text-white/50 text-sm"> / {partyData.packageLimit}</span>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Pacote Atual</p>
              </div>
            </div>

            <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input type="text" placeholder="Nome do Convidado" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} disabled={isPackageFull} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#bef264] disabled:opacity-50" />
              <select value={newGuestAge} onChange={(e) => setNewGuestAge(e.target.value)} disabled={isPackageFull} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#bef264] disabled:opacity-50 [&>option]:bg-zinc-900">
                <option value="4-5">4 a 5 anos</option>
                <option value="6-7">6 a 7 anos</option>
                <option value="8-9">8 a 9 anos</option>
                <option value="10-11">10 a 11 anos</option>
              </select>
              <button type="submit" disabled={isPackageFull || !newGuestName.trim()} className="bg-[#bef264] hover:bg-[#a3e635] text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <UserPlus className="size-4" /> Adicionar
              </button>
            </form>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
              {guests.length === 0 ? (
                <div className="text-center text-white/30 py-8 text-sm">Nenhum convidado cadastrado ainda.</div>
              ) : (
                guests.map(guest => (
                  <div key={guest.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{guest.name}</span>
                      <span className="text-xs text-white/50">Faixa Etária: {guest.age_group} anos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-black/50 px-3 py-1 rounded-lg border border-white/10">
                        <span className="font-mono text-sm tracking-widest text-white/80">{guest.code}</span>
                      </div>
                      <button onClick={() => copyToClipboard(guest.code)} className="p-2 text-white/50 hover:text-white transition-colors">
                        {copiedCode === guest.code ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
                      </button>
                      <button onClick={() => handleRemoveGuest(guest.id)} className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all ml-1">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
