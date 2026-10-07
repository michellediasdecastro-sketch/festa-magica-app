import { useState } from "react";
import { Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessLoginProps {
  onLoginSuccess: (partyData: any) => void;
}

export function AccessLogin({ onLoginSuccess }: AccessLoginProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMessage("Por favor, insira o seu código de acesso.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Simulação rápida de validação (na próxima etapa ligamos ao Supabase real)
      // Aqui vamos buscar a festa correspondente ao token introduzido
      setTimeout(() => {
        if (token === "teste123") {
          onLoginSuccess({
            partyName: "O Aniversário do Lucas",
            birthdayChildName: "Lucas",
            childAge: 5,
            theme: "Dinossauros",
            characterName: "T-Rex Amigável",
            ageGroup: "4-5"
          });
        } else {
          setErrorMessage("Código inválido ou expirado. Verifique o seu convite!");
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      setErrorMessage("Ocorreu um erro ao validar o acesso. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-lime/40 bg-forest/95 px-6 py-10 shadow-2xl backdrop-blur-md text-cream text-center">
      <div className="mb-4 inline-flex items-center justify-center size-16 rounded-2xl bg-lime/20 border border-lime/30 text-lime">
        <KeyRound className="size-8" />
      </div>

      <h1 className="font-display text-3xl mb-2 text-cream">Área do Convidado</h1>
      <p className="text-sm text-cream/80 mb-8">
        Insira o código impresso no seu QR Code ou convite para entrar na festa!
      </p>

      <form onSubmit={handleAccess} className="w-full flex flex-col gap-4">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Ex: teste123"
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream placeholder:text-cream/40 focus:outline-none focus:border-lime text-center font-bold tracking-widest text-lg"
        />

        {errorMessage && (
          <p className="text-sm text-red-400 font-medium">{errorMessage}</p>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 text-base font-bold bg-lime text-forest hover:bg-lime/90 transition-all mt-2"
        >
          {loading ? "A verificar convite..." : "Entrar na Festa"} <Sparkles className="size-4 ml-2" />
        </Button>
      </form>
    </div>
  );
}
