import React, { useState, useEffect } from "react";
import { UserPlus, Crown, Users, Check, Sparkles, Trash2, Loader2, Share2, BookOpen, AlertTriangle, Edit, Gamepad2, X, Calendar, PlayCircle } from "lucide-react";
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
  
  // Estado para Adição e Edição
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestAge, setNewGuestAge] = useState("4-5");
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para Prévia Única
  const [usedPreviews, setUsedPreviews] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewAge, setPreviewAge] = useState("");

  useEffect(() => {
    // Carrega o histórico de prévias usadas para esta festa específica
    const storedPreviews = localStorage.getItem(`@preview_used_${partyId}`);
    if (storedPreviews) {
      setUsedPreviews(JSON.parse(storedPreviews));
    }
  }, [partyId]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    // Busca dados da festa junto com o limite do pacote e o nome do cliente vinculado
    const { data: party } = await supabase.from('parties').select('*, packages(max_limit), clients(name)').eq('id', partyId).single();
    
    if (party) {
      setPartyData({
        id: party.id,
        name: party.party_name || party.theme || "Nossa Festa",
        theme: party.theme,
        childName: party.host_name || "Aniversariante",
        childAvatar: party.host_avatar,
        childAgeGroup: party.host_age || "4-5",
        packageLimit: party.packages?.max_limit || 30,
        hostCode: party.host_code || `${(party.host_name || 'MASTER').toUpperCase().replace(/\s+/g, '')}-VIP`,
        validUntil: party.valid_until,
        clientName: party.clients?.name || "Cliente Responsável" // Nome do cliente para a missão da prévia
      });
    }
    const { data: guestsData } = await supabase.from('guests').select('*').eq('party_id', partyId).order('created_at', { ascending: false });
    if (guestsData) setGuests(guestsData);
    setIsLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, [partyId]);

  const handleEditClick = (guest: any) => {
    setEditingGuestId(guest.id);
    setNewGuestName(guest.name);
    setNewGuestAge(guest.age_group);
  };

  const handleCancelEdit = () => {
    setEditingGuestId(null);
    setNewGuestName("");
    setNewGuestAge("4-5");
  };

  const handleAddOrEditGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !partyData) return;
    
    if (editingGuestId) {
      const { data, error } = await supabase.from('guests').update({ 
        name: newGuestName.trim(), 
        age_group: newGuestAge 
      }).eq('id', editingGuestId).select().single();

      if (error) alert("Erro ao editar: " + error.message);
      else if (data) {
        setGuests(guests.map(g => g.id === editingGuestId ? data : g));
        handleCancelEdit();
      }
    } else {
      if (guests.length >= partyData.packageLimit) return;
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase.from('guests').insert([{ 
        party_id: partyId, name: newGuestName.trim(), age_group: newGuestAge, code: code 
      }]).select().single();
      
      if (error) alert("ERRO AO ADICIONAR: " + error.message);
      else if (data) {
        setGuests([data, ...guests]);
        setNewGuestName("");
      }
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este convidado? O código dele deixará de funcionar.")) {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (!error) setGuests(guests.filter(g => g.id !== id));
    }
  };

  const copyInvite = (guest: any) => {
    const inviteText = `Você foi convidado para a aventura de aniversário do ${partyData.childName}!\nAcesse: ${window.location.origin}\nSeu código: ${guest.code}`;
    navigator.clipboard.writeText(inviteText);
    setCopiedCode(guest.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const goToGame = () => {
    window.location.href = "/";
  };

  // --- FUNÇÕES DA PRÉVIA ÚNICA ---
  const triggerPreview = (age: string) => {
    setPreviewAge(age);
    setShowPreviewModal(true);
  };

  const confirmPreview = () => {
    // 1. Marca como usado e salva no navegador
    const updatedUsed = [...usedPreviews, previewAge];
    setUsedPreviews(updatedUsed);
    localStorage.setItem(`@preview_used_${partyId}`, JSON.stringify(updatedUsed));

    // 2. Extrai os números corretos para o jogo funcionar
    const parsedGuestAge = parseInt(previewAge.split('-')[0], 10) || 5;
    const parsedHostAge = parseInt(partyData.childAgeGroup.split('-')[0], 10) || 5;

    // 3. Monta a sessão mágica usando o NOME DO CLIENTE e redireciona
    const previewSession = {
      partyId: partyData.id,
      partyName: partyData.name,
      childName: partyData.childName,
      childAge: parsedHostAge,
      photoUrl: partyData.childAvatar,
      theme: partyData.theme,
      guestName: partyData.clientName, // O nome do pai/cliente no jogo
      guestAge: parsedGuestAge,
      guestAgeGroup: previewAge,
      isPreview: true
    };

    localStorage.setItem('@party_guest_session', JSON.stringify(previewSession));
    window.location.href = "/";
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="size-8 text-[#bef264] animate-spin" /></div>;
  if (!partyData) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Festa não encontrada.</div>;

  const isPackageFull = guests.length >= partyData.packageLimit;
  const isUnlimited = partyData.packageLimit > 90000;

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 sm:p-8 font-sans overflow-y-auto">
      
      {/* MODAL DA PRÉVIA ÚNICA */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/20 p-6 rounded-3xl max-w-md w-full text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="size-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Acessar Jogo ({previewAge} anos)</h3>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              Esta é uma prévia de acesso único. Após entrar, você não poderá acessá-la novamente. Deseja continuar?
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowPreviewModal(false)} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">
                AGORA NÃO
              </button>
              <button onClick={confirmPreview} className="flex-1 py-3 rounded-xl bg-[#bef264] hover:bg-[#a3e635] text-black font-bold transition-colors">
                SIM
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black text-[#bef264] flex items-center gap-2"><Sparkles className="size-6" /> {partyData.name}</h1>
            <p className="text-white/60 text-sm mt-1">Tema: <strong className="text-white">{partyData.theme}</strong></p>
            {partyData.validUntil && (
              <p className="text-white/60 text-sm mt-2 flex items-center gap-1.5">
                <Calendar className="size-4 text-blue-400" /> 
                Validade da Festa: <strong className="text-blue-300">{new Date(partyData.validUntil).toLocaleDateString()}</strong>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={goToGame} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm font-bold">
              <Gamepad2 className="size-4" /> Ir para o Jogo
            </button>
            {onLogout && (
              <button onClick={onLogout} className="text-sm underline text-white/50 hover:text-white">
                Sair
              </button>
            )}
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
              <div className="space-y-6">
                {Object.entries(educationalBenefits).map(([age, info]) => {
                  const isUsed = usedPreviews.includes(age);
                  return (
                    <div key={age} className="text-sm border-b border-white/10 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <strong className="text-white text-base block">{info.title}</strong>
                        <button 
                          onClick={() => !isUsed && triggerPreview(age)}
                          disabled={isUsed}
                          className={`text-[10px] sm:text-xs px-3 py-1.5 rounded font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${isUsed ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/40'}`}
                        >
                          <PlayCircle className="size-3" />
                          {isUsed ? 'PRÉVIA UTILIZADA' : 'PRÉVIA ÚNICA'}
                        </button>
                      </div>
                      <span className="text-white/60">{info.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md flex flex-col">
            
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="size-6 text-orange-400 shrink-0" />
              <p className="text-orange-200 text-sm">
                <strong className="text-orange-300">Atenção:</strong> Não utilize os códigos dos convidados para testar o aplicativo, pois eles não poderão ser recuperados. Utilize os botões de <strong>Prévia Única</strong> disponíveis ao lado para testar.
              </p>
            </div>

            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="size-5 text-[#bef264]" /> Convidados</h2>
                <p className="text-xs text-white/60 mt-1">Gere e gerencie os códigos individuais</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${isPackageFull ? 'text-red-400' : 'text-white'}`}>{guests.length}</span>
                <span className="text-white/50 text-sm"> / {isUnlimited ? 'Ilimitado' : partyData.packageLimit}</span>
              </div>
            </div>

            <form onSubmit={handleAddOrEditGuest} className="flex flex-col sm:flex-row gap-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
              <input type="text" placeholder="Nome do Convidado" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} disabled={isPackageFull && !editingGuestId} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#bef264] outline-none disabled:opacity-50" />
              <select value={newGuestAge} onChange={(e) => setNewGuestAge(e.target.value)} disabled={isPackageFull && !editingGuestId} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#bef264] outline-none disabled:opacity-50 [&>option]:bg-zinc-900">
                <option value="4-5">4 a 5 anos</option><option value="6-7">6 a 7 anos</option><option value="8-9">8 a 9 anos</option><option value="10-11">10 a 11 anos</option>
              </select>
              
              <div className="flex gap-2">
                <button type="submit" disabled={(isPackageFull && !editingGuestId) || !newGuestName.trim()} className="bg-[#bef264] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#a3e635] disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                  {editingGuestId ? "Salvar Edição" : <><UserPlus className="size-4" /> Adicionar</>}
                </button>
                {editingGuestId && (
                  <button type="button" onClick={handleCancelEdit} className="bg-red-500/20 text-red-400 p-3 rounded-xl hover:bg-red-500/40" title="Cancelar Edição">
                    <X className="size-5" />
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
              {guests.map(guest => (
                <div key={guest.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl gap-4">
                  <div>
                    <span className="font-bold text-sm block">{guest.name}</span>
                    <span className="text-xs text-white/50">Faixa: {guest.age_group} anos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs hidden sm:block ${guest.status === 'revogado' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{guest.status || 'ativo'}</span>
                    
                    <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="font-mono text-sm tracking-widest text-[#bef264]">{guest.code}</span>
                    </div>
                    
                    {guest.status !== 'revogado' && (
                      <button onClick={() => copyInvite(guest)} className="p-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 rounded-lg transition-all" title="Copiar Convite">
                        {copiedCode === guest.code ? <Check className="size-4" /> : <Share2 className="size-4" />}
                      </button>
                    )}
                    <button onClick={() => handleEditClick(guest)} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-all" title="Editar Convidado">
                      <Edit className="size-4" />
                    </button>
                    <button onClick={() => handleDeleteGuest(guest.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg transition-all" title="Excluir Convidado">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
