import React, { useState, useEffect } from "react";
import { Copy, UserPlus, Crown, Users, Check, Sparkles, Trash2, Loader2, Share2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export function ClientDashboard({ partyId, onLogout }: { partyId: string; onLogout?: () => void }) {
  const [partyData, setPartyData] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestAge, setNewGuestAge] = useState("4-5");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { data: party } = await supabase.from('parties').select('*, packages(max_limit)').eq('id', partyId).single();
    if (party) {
      setPartyData({
        name: party.name || "Nossa Festa",
        theme: party.theme,
        childName: party.host_name || party.childName || "Aniversariante",
        childAvatar: party.host_avatar,
        packageLimit: party.packages?.max_limit || 30,
        hostCode: `${(party.host_name || 'MASTER').toUpperCase()}-VIP`
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
    const { data, error } = await supabase.from('guests').insert([{ party_id: partyId, name: newGuestName.trim(), age_group: newGuestAge, code }]).select().single();
    if (!error && data) {
      setGuests([data, ...guests]);
      setNewGuestName("");
    }
  };

  const handleRemoveGuest = async (id: string) => {
    const { error } = await supabase.from('guests').delete().eq('id', id);
    if (!error) setGuests(guests.filter(g => g.id !== id));
  };

  const copyInvite = (guest: any) => {
    const inviteText = `Você foi convidado para a aventura de aniversário do ${partyData.childName}!\n\nAcesse o aplicativo:\n${window.location.origin}\n\nSeu código de acesso:\n${guest.code}\n\nPrepare-se para muita diversão!`;
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
        
        <div className="flex justify-between items-center bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black text-[#bef264] flex items-center gap-2"><Sparkles className="size-6" /> {partyData.name}</h1>
            <p className="text-white/60 text-sm mt-1">Tema: <strong className="text-white">{partyData.theme}</strong></p>
          </div>
          {onLogout && <button onClick={onLogout} className="text-sm underline text-white/50 hover:text-white">Sair do Painel</button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gradient-to-br from-[#bef264]/20 to-black/40 border border-[#bef264]/40 p-6 rounded-3xl flex flex-col items-center text-center shadow-[0_0_20px_rgba(190,242,100,0.1)] h-fit">
            {partyData.childAvatar ? (
               <img src={partyData.childAvatar} alt="Avatar" className="size-20 rounded-full border-2 border-[#bef264] mb-3 object-cover" />
            ) : (
               <Crown className="size-16 text-[#bef264] mb-3" />
            )}
            <h2 className="text-xl font-bold text-white mb-1">Acesso do Aniversariante</h2>
            <p className="text-xs text-white/60 mb-4">{partyData.childName} (Este acesso é extra e não consome vagas)</p>
            
            <div className="w-full bg-black/60 border border-white/10 rounded-xl p-3 flex justify-between items-center">
              <span className="font-mono font-black tracking-widest text-[#bef264]">{partyData.hostCode}</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md flex flex-col">
            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="size-5 text-[#bef264]" /> Gerenciar Convidados</h2>
                <p className="text-xs text-white/60 mt-1">Gere os códigos individuais e copie o convite</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${isPackageFull ? 'text-red-400' : 'text-white'}`}>{guests.length}</span>
                <span className="text-white/50 text-sm"> / {isUnlimited ? 'Ilimitado' : partyData.packageLimit}</span>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Vagas Usadas</p>
              </div>
            </div>

            {isPackageFull && !isUnlimited && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                Você atingiu o limite de convidados do seu pacote. Entre em contato conosco para conhecer as opções de expansão.
              </div>
            )}

            <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row gap-3 mb-6">
              <input type="text" placeholder="Nome do Convidado" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} disabled={isPackageFull} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#bef264] disabled:opacity-50" />
              <select value={newGuestAge} onChange={(e) => setNewGuestAge(e.target.value)} disabled={isPackageFull} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#bef264] disabled:opacity-50 [&>option]:bg-zinc-900">
                <option value="4-5">4 a 5 anos</option>
                <option value="6-7">6 a 7 anos</option>
                <option value="8-9">8 a 9 anos</option>
                <option value="10-11">10 a 11 anos</option>
              </select>
              <button type="submit" disabled={isPackageFull || !newGuestName.trim()} className="bg-[#bef264] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#a3e635] disabled:opacity-50 flex items-center justify-center gap-2">
                <UserPlus className="size-4" /> Adicionar
              </button>
            </form>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
              {guests.length === 0 ? (
                <div className="text-center text-white/30 py-8 text-sm">Nenhum convidado cadastrado.</div>
              ) : (
                guests.map(guest => (
                  <div key={guest.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                    <div>
                      <span className="font-bold text-sm block">{guest.name}</span>
                      <span className="text-xs text-white/50">Faixa: {guest.age_group} anos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 hidden sm:block">
                        <span className="font-mono text-sm tracking-widest text-[#bef264]">{guest.code}</span>
                      </div>
                      <button onClick={() => copyInvite(guest)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 rounded-lg text-xs font-bold transition-all">
                        {copiedCode === guest.code ? <Check className="size-4" /> : <Share2 className="size-4" />}
                        <span className="hidden sm:inline">{copiedCode === guest.code ? 'Copiado!' : 'Copiar Convite'}</span>
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
