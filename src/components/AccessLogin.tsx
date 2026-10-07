import React, { useState } from "react";
import { Sparkles, KeyRound } from "lucide-react";
import { supabase } from "../lib/supabase";

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
      const { data: accessData, error: accessError } = await supabase
        .from("access_codes")
        .select(`
          *,
          parties (
            party_name,
            birthday_child_name,
            child_age,
            theme,
            character_name,
            photo_url
          )
        `)
        .eq("code_token", token.trim())
        .single();

      if (accessError || !accessData) {
        setErrorMessage("Código inválido. Verifique o seu convite!");
        setLoading(false);
        return;
      }

      const now = new Date();
      const expiryDate = new Date(accessData.expires_at);
      if (now > expiryDate) {
        setErrorMessage("Este código de acesso expirou após 1 ano.");
        setLoading(false);
        return;
      }

      onLoginSuccess({
        partyName: accessData.parties.party_name,
        birthdayChildName: accessData.parties.birthday_child_name,
        childAge: accessData.parties.child_age,
        theme: accessData.parties.theme,
        characterName: accessData.parties.character_name,
        ageGroup: accessData.age_group,
        photoUrl: accessData.parties.photo_url
      });

    } catch (err) {
      console.error(err);
      setErrorMessage("Ocorreu um erro ao validar o acesso. Tente novamente.");
    } finally {
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
          placeholder="Insira o seu código"
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream placeholder:text-cream/40 focus:outline-none focus:border-lime text-center font-bold tracking-widest text-lg"
        />

        {errorMessage && (
          <p className="text-sm text-red-400 font-medium">{errorMessage}</p>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 text-base font-bold bg-lime text-forest hover:bg-lime/90 transition-all mt-2 flex items-center justify-center rounded-xl cursor-pointer disabled:opacity-50"
        >
          {loading ? "A verificar no Supabase..." : "Entrar na Festa"} <Sparkles className="size-4 ml-2" />
        </button>
      </form>
    </div>
  );
}
