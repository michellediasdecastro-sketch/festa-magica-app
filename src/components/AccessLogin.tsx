import { useState, type FormEvent } from "react";
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
  
  // Dados do Convidado
  const [partyData, setPartyData] = useState<any>(null);
  const [guestName, setGuestName] = useState("");
  const [guestAge, setGuestAge] = useState("");

  // Etapa 1: Validar o Código da Festa
  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setError("");

    // Procura a festa pelo ID ou pelo Nome Exato
    const { data, error: dbError } = await supabase
      .from("parties")
      .select("*")
      .or(`id.eq.${code.trim()},party_name.ilike.${code.trim()}`)
      .limit(1)
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError("Código de aventura não encontrado. Tente novamente!");
    } else {
      setPartyData(data);
      setStep(2); // Avança para perguntar os dados do convidado
    }
  }

  // Etapa 2: Entrar no Jogo com os Dados do Convidado
  function handleEnterGame(e: FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !guestAge) {
      setError("Preencha o seu nome e idade para brincar!");
      return;
    }

    // Junta os dados da festa com os dados do convidado e envia para a App
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
              placeholder="Ex: festadolucas"
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
