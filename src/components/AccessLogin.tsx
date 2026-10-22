import React, { useState } from "react";
import { Sparkles, ArrowRight, Gamepad2 } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AccessLoginProps {
  onLoginSuccess: (data: any) => void;
}

function parseAgeGroup(ageStr: string | number) {
  if (!ageStr) return 5;
  if (typeof ageStr === 'number') return ageStr;
  if (ageStr.includes("4-5")) return 5;
  if (ageStr.includes("6-7")) return 7;
  if (ageStr.includes("8-9")) return 9;
  if (ageStr.includes("10-11")) return 11;
  return parseInt(ageStr.replace(/\D/g, ''), 10) || 5;
}

export function AccessLogin({ onLoginSuccess }: AccessLoginProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;
    
    setLoading(true);
    setError("");

    try {
      // 1. Tenta validar como código de CONVIDADO
      const { data: guestData } = await supabase
        .from("guests")
        .select("*, parties(*)")
        .eq("code", trimmedCode)
        .neq("status", "revogado")
        .maybeSingle();

      if (guestData && guestData.parties) {
        const ageNum = parseAgeGroup(guestData.age_group);
        const hostAgeNum = parseAgeGroup(guestData.parties.child_age || guestData.parties.host_age);

        const finalData = {
          ...guestData.parties, 
          partyId: guestData.parties.id,
          partyName: guestData.parties.party_name || guestData.parties.theme,
          childName: guestData.parties.birthday_child_name || guestData.parties.host_name,
          childAge: hostAgeNum,
          characterName: guestData.parties.character_name || 'Mascote',
          photoUrl: guestData.parties.photo_url || guestData.parties.host_avatar, // Restaura a foto para o jogo
          theme: guestData.parties.theme,
          guestName: guestData.name, 
          guestAge: ageNum, 
          guestAgeGroup: guestData.age_group
        };
        localStorage.setItem('@party_guest_session', JSON.stringify(finalData));
        onLoginSuccess(finalData);
        return;
      }

      // 2. Tenta validar como código MASTER DO ANIVERSARIANTE ou Nome da Festa
      const { data: hostData } = await supabase
        .from("parties")
        .select("*")
        .or(`host_code.eq.${trimmedCode},party_name.ilike.${trimmedCode}`)
        .maybeSingle();

      if (hostData) {
        const hostAgeNum = parseAgeGroup(hostData.child_age || hostData.host_age);

        const finalData = {
          ...hostData,
          partyId: hostData.id,
          partyName: hostData.party_name || hostData.theme,
          childName: hostData.birthday_child_name || hostData.host_name,
          childAge: hostAgeNum,
          characterName: hostData.character_name || 'Mascote',
          photoUrl: hostData.photo_url || hostData.host_avatar, // Restaura a foto para o jogo
          theme: hostData.theme,
          guestName: hostData.birthday_child_name || hostData.host_name,
          guestAge: hostAgeNum,
          guestAgeGroup: hostData.host_age || hostData.child_age
        };
        localStorage.setItem('@party_guest_session', JSON.stringify(finalData));
        onLoginSuccess(finalData);
        return;
      }

      setError("Código inválido, expirado ou revogado.");
    } catch (err) {
      console.error(err);
      setError("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-black/40 border border-white/20 rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-md text-center flex flex-col items-center animate-fade-in">
      <div className="w-20 h-20 bg-[#bef264]/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Gamepad2 className="size-10 text-[#bef264]" />
      </div>

      <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md">Entrar na Aventura</h2>
      <p className="text-sm text-white/70 mb-6">Insira o código do seu convite</p>

      <form onSubmit={handleVerifyCode} className="w-full flex flex-col gap-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CÓDIGO"
          className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/20 text-white placeholder:text-white/30 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-[#bef264] transition-colors uppercase"
        />
        {error && <span className="text-red-400 text-xs font-bold">{error}</span>}
        
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full py-4 rounded-2xl bg-[#bef264] text-black font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(190,242,100,0.3)]"
        >
          {loading ? "A VERIFICAR..." : "ENTRAR NO JOGO"} <ArrowRight className="size-5" />
        </button>
      </form>
    </div>
  );
}
