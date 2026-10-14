import React, { useState, useEffect } from "react";
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

  // MEMÓRIA DO CELULAR: Verifica se a criança já fez login neste aparelho
  useEffect(() => {
    const savedSession = localStorage.getItem('@party_guest_session');
    if (savedSession) {
      try {
        const parsedData = JSON.parse(savedSession);
        if (parsedData && parsedData.guestName) {
          // Se já tem sessão salva, entra direto no jogo!
          onLoginSuccess(parsedData);
        }
      } catch (e) {
        console.error("Erro ao ler sessão salva", e);
      }
    }
  }, [onLoginSuccess]);

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode) return;
    
    setLoading(true);
    setError("");

    try {
      let foundParty = null;

      const { data: tokenData } = await supabase
        .from("access_codes")
        .select("party_id")
        .eq("code_token", trimmedCode)
        .maybeSingle();

      if (tokenData && tokenData.party_id) {
        const { data: partyResult } = await supabase
          .from("parties")
          .select("*")
          .eq("id", tokenData.party_id)
          .single();
          
        if (partyResult) {
          foundParty = partyResult;
        }
      }

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

      if (foundParty) {
        setPartyData(foundParty);
        setStep(2);
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

    const finalData = {
      ...partyData,
      partyName: partyData.party_name,
      childName: partyData.birthday_child_name,
      childAge: partyData.child_age,
      characterName: partyData.character_name,
      photoUrl: partyData.photo_url,
      theme: partyData.theme,
      guestName: guestName.trim(),
      guestAge: parseInt(guestAge, 10)
    };

    // GRAVA A SESSÃO NO CELULAR PARA NÃO PEDIR NOVAMENTE
    localStorage.setItem('@party_guest_session', JSON.stringify(finalData));

    onLoginSuccess(finalData);
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
