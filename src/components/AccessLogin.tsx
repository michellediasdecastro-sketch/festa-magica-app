import React, { useState } from "react";
import { Sparkles, ArrowRight, Gamepad2, User, Calendar } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AccessLoginProps {
  onLoginSuccess: (data: any) => void;
}

export function AccessLogin({ onLoginSuccess }: AccessLoginProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [partyData, setPartyData] = useState<any>(null);
  const [guestName, setGuestName] = useState("");
  const [guestAge, setGuestAge] = useState("");

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode) return;
    
    setLoading(true);
    setError("");

    try {
      let foundParty = null;

      // 1. Procura primeiro na tabela access_codes pela coluna code_token (baseado na sua imagem)
      const { data: tokenData } = await supabase
        .from("access_codes")
        .select("party_id")
        .eq("code_token", trimmedCode)
        .maybeSingle(); // maybeSingle evita erros fatais caso não encontre nada

      if (tokenData && tokenData.party_id) {
        // Se o token existe, procura a festa correspondente pelo party_id
        const { data: partyResult } = await supabase
          .from("parties")
          .select("*")
          .eq("id", tokenData.party_id)
          .single();
          
        if (partyResult) {
          foundParty = partyResult;
        }
      }

      // 2. Fallback Seguro: Se não achou um token, tenta procurar direto pelo nome da festa
      if (!foundParty) {
        const { data: partyByName } = await supabase
          .from("parties")
          .select("*")
          .ilike("party_name", trimmedCode)
          .limit(1)
          .maybeSingle();
          
        if (partyByName) {
          foundParty = partyByName;
        }
      }

      // 3. Validação final para decidir se avança ou mostra erro
      if (foundParty) {
        setPartyData(foundParty);
        setStep(2); // Vai para a etapa onde pede nome e idade do convidado
      } else {
        setError("Código ou token não encontrado. Tente novamente!");
      }

    } catch (err) {
      console.error(err);
      setError("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handleEnterGame(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !guestAge) {
      setError("Preencha o seu nome e idade para brincar!");
      return;
    }

    onLoginSuccess({
      ...partyData,
      guestName: guestName.trim(),
      guestAge: parseInt(guestAge, 10)
    });
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-black/40 border border-white/20 rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-md text-center flex flex-col items-center animate-fade-in">
      <div className="w-20 h-20 bg-[#bef264]/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Gamepad2 className="size-10 text-[#bef264]" />
      </div>

      {step === 1 ? (
        <>
          <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md">Entrar na Aventura</h2>
          <p className="text-sm text-white/70 mb-6">Insira o código convite da festa</p>

          <form onSubmit={handleVerifyCode} className="w-full flex flex-col gap-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: 123456 ou festadolucas"
              className="w-full px-5 py-4 rounded-2xl bg-black/50 border border-white/20 text-white placeholder:text-white/30 text-center text-lg focus:outline-none focus:border-[#bef264] transition-colors"
            />
            {error && <span className="text-red-400 text-xs font-bold">{error}</span>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#bef264] text-black font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "A PROCURAR..." : "AVANÇAR"} <ArrowRight className="size-5" />
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-xl font-black text-[#bef264] mb-1 drop-shadow-md">Festa Encontrada!</h2>
          <p className="text-sm text-white/80 mb-6">Identifique-se para preparar os seus jogos</p>

          <form onSubmit={handleEnterGame} className="w-full flex flex-col gap-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/40" />
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="O seu nome"
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-left focus:outline-none focus:border-[#bef264] transition-colors"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/40" />
              <input
                type="number"
                value={guestAge}
                onChange={(e) => setGuestAge(e.target.value)}
                placeholder="A sua idade"
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-black/50 border border-white/20 text-white placeholder:text-white/40 text-left focus:outline-none focus:border-[#bef264] transition-colors"
              />
            </div>

            {error && <span className="text-red-400 text-xs font-bold">{error}</span>}
            
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#bef264] text-black font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(190,242,100,0.3)] cursor-pointer"
            >
              <Sparkles className="size-5" /> ENTRAR NO JOGO
            </button>
          </form>
        </>
      )}
    </div>
  );
}
