import { useState } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { Sparkles, Cake, Users, ShieldAlert } from "lucide-react";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b2b1e] via-[#133e2b] to-[#071c13] flex items-center justify-center p-4 text-cream">
      {!partyData ? (
        <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
      ) : (
        <div className="w-full max-w-2xl bg-forest/90 border border-lime/30 rounded-3xl p-8 shadow-2xl backdrop-blur-md text-center flex flex-col items-center gap-6 animate-fade-in">
          
          {/* Cabeçalho do Tema */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/20 border border-lime/30 text-lime text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="size-4" /> Tema: {partyData.theme}
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-cream">
            Bem-vindo à festa de {partyData.birthdayChildName}! 🎉
          </h1>

          <div className="flex flex-wrap justify-center gap-4 my-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm">
              <Cake className="size-4 text-lime" />
              <span>Idade: <strong>{partyData.childAge} anos</strong></span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm">
              <Users className="size-4 text-lime" />
              <span>Faixa Etária do Convidado: <strong>{partyData.ageGroup}</strong></span>
            </div>
          </div>

          {partyData.characterName && (
            <p className="text-cream/80 text-lg italic">
              Personagem em destaque: <span className="text-lime font-semibold">{partyData.characterName}</span>
            </p>
          )}

          <div className="w-full border-t border-white/10 pt-6 mt-4 flex justify-between items-center text-xs text-cream/50">
            <span>Painel do Convidado Verificado</span>
            <button 
              onClick={() => setPartyData(null)}
              className="hover:text-lime underline cursor-pointer transition-colors"
            >
              Sair / Inserir outro código
            </button>
          </div>

        </div>
      )}
    </main>
  );
}

export default App;
