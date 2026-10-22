import React, { useState, useEffect } from "react";
import { Copy, UserPlus, Crown, Users, Check, Sparkles, Trash2 } from "lucide-react";

// Interfaces baseadas no que você precisará no banco de dados (Supabase)
interface Guest {
  id: string;
  name: string;
  ageGroup: string;
  code: string;
}

interface ClientDashboardProps {
  partyId: string;
  // No futuro, passe a função de logout ou voltar para home
  onLogout?: () => void; 
}

export function ClientDashboard({ partyId, onLogout }: ClientDashboardProps) {
  // Simulação dos dados da festa vindos do banco
  const [partyData, setPartyData] = useState({
    theme: "Aventura Jurássica",
    childName: "Lucas",
    packageLimit: 30, // Limite de convidados comprado
    hostCode: "LUCAS-VIP", // Código fixo do aniversariante
  });

  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestAge, setNewGuestAge] = useState("4-5");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Aqui você faria o useEffect para buscar os convidados no Supabase
  // supabase.from('guests').select('*').eq('party_id', partyId)

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    if (guests.length >= partyData.packageLimit) return;

    // Geração de um código único simples de 6 caracteres
    const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    const newGuest: Guest = {
      id: Date.now().toString(),
      name: newGuestName.trim(),
      ageGroup: newGuestAge,
      code: generateCode(),
    };

    // Aqui você faria o INSERT no Supabase
    // await supabase.from('guests').insert([{ party_id: partyId, ...newGuest }])

    setGuests([newGuest, ...guests]);
    setNewGuestName("");
  };

  const handleRemoveGuest = (id: string) => {
    // Aqui você faria o DELETE no Supabase
    setGuests(guests.filter(g => g.id !== id));
  };

  const copyToClipboard = (code: string) => {
    // Opcional: Você pode montar o link completo aqui, ex: `https://seusite.com/?code=${code}`
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const guestsCount = guests.length;
  const isPackageFull = guestsCount >= partyData.packageLimit;

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 sm:p-8 font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabeçalho do Painel */}
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
          
          {/* Card do Aniversariante */}
          <div className="md:col-span-1 bg-gradient-to-br from-[#bef264]/20 to-black/40 border border-[#bef264]/40 p-6 rounded-3xl backdrop-blur-md flex flex-col items-center text-center shadow-[0_0_20px_rgba(190,242,100,0.1)]">
            <Crown className="size-12 text-[#bef264] mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">Acesso Especial</h2>
            <p className="text-xs text-white/60 mb-4">Código mestre do(a) aniversariante {partyData.childName}</p>
            
            <div className="w-full bg-black/60 border border-white/10 rounded-xl p-3 flex justify-between items-center mb-2">
              <span className="font-mono font-black tracking-widest text-[#bef264]">{partyData.hostCode}</span>
              <button 
                onClick={() => copyToClipboard(partyData.hostCode)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Copiar Código"
              >
                {copiedCode === partyData.hostCode ? <Check className="size-4 text-green-400" /> : <Copy className="size-4 text-white" />}
              </button>
            </div>
          </div>

          {/* Gestão de Convidados */}
          <div className="md:col-span-2 bg-black/40 border border-white/20 p-6 rounded-3xl backdrop-blur-md flex flex-col">
            
            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="size-5 text-[#bef264]" /> Convidados
                </h2>
                <p className="text-xs text-white/60 mt-1">Cadastre quem vai jogar no aplicativo</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${isPackageFull ? 'text-red-400' : 'text-white'}`}>
                  {guestsCount}
                </span>
                <span className="text-white/50 text-sm"> / {partyData.packageLimit}</span>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Pacote Atual</p>
              </div>
            </div>

            {/* Formulário de Adição */}
            <form onSubmit={handleAddGuest} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input
                type="text"
                placeholder="Nome do Convidado"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                disabled={isPackageFull}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#bef264] disabled:opacity-50"
              />
              <select
                value={newGuestAge}
                onChange={(e) => setNewGuestAge(e.target.value)}
                disabled={isPackageFull}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#bef264] disabled:opacity-50 [&>option]:bg-zinc-900"
              >
                <option value="4-5">4 a 5 anos</option>
                <option value="6-7">6 a 7 anos</option>
                <option value="8-9">8 a 9 anos</option>
                <option value="10-11">10 a 11 anos</option>
              </select>
              <button
                type="submit"
                disabled={isPackageFull || !newGuestName.trim()}
                className="bg-[#bef264] hover:bg-[#a3e635] text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="size-4" /> Adicionar
              </button>
            </form>

            {/* Lista de Convidados */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
              {guests.length === 0 ? (
                <div className="text-center text-white/30 py-8 text-sm">
                  Nenhum convidado cadastrado ainda.<br/>Comece adicionando acima!
                </div>
              ) : (
                guests.map(guest => (
                  <div key={guest.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{guest.name}</span>
                      <span className="text-xs text-white/50">Faixa Etária: {guest.ageGroup} anos</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-black/50 px-3 py-1 rounded-lg border border-white/10">
                        <span className="font-mono text-sm tracking-widest text-white/80">{guest.code}</span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(guest.code)}
                        className="p-2 text-white/50 hover:text-white transition-colors"
                        title="Copiar Código"
                      >
                        {copiedCode === guest.code ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
                      </button>
                      <button 
                        onClick={() => handleRemoveGuest(guest.id)}
                        className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all ml-1"
                        title="Remover Convidado"
                      >
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
