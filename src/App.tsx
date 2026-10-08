import { useState } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { Sparkles, Cake, Users, Trophy } from "lucide-react";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b2b1e] via-[#133e2b] to-[#071c13] flex items-center justify-center p-4 text-cream">
      {!partyData ? (
        <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
      ) : (
        <div className="w-full max-w-2xl bg-gradient-to-b from-[#143d29]/95 to-[#0b2b1e]/98 border-2 border-lime/40 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-md text-center flex flex-col items-center gap-6 relative overflow-hidden animate-fade-in">
          
          {/* Efeito decorativo de fundo temático */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-lime/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-lime/10 rounded-full blur-2xl pointer-events-none" />

          {/* Cabeçalho do Tema */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-lime/20 border border-lime/40 text-lime text-sm font-bold tracking-wider uppercase shadow-inner">
            <Sparkles className="size-4 animate-pulse" /> Tema: {partyData.theme}
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-cream flex items-center justify-center gap-3 flex-wrap leading-tight">
            <span>🎉 Bem-vindo à festa de {partyData.birthdayChildName}!</span>
          </h1>

          <div className="flex flex-wrap justify-center gap-4 my-2 w-full">
            <div className="flex items-center gap-3 bg-black/20 border border-white/10 px-5 py-3 rounded-2xl text-sm md:text-base backdrop-blur-sm shadow-sm">
              <Cake className="size-5 text-lime" />
              <span>Idade do Aniversariante: <strong className="text-lime">{partyData.childAge} anos</strong></span>
            </div>

            <div className="flex items-center gap-3 bg-black/20 border border-white/10 px-5 py-3 rounded-2xl text-sm md:text-base backdrop-blur-sm shadow-sm">
              <Users className="size-5 text-lime" />
              <span>Faixa do Convidado: <strong className="text-lime">{partyData.ageGroup}</strong></span>
            </div>
          </div>

          {partyData.characterName && (
            <div className="flex items-center gap-2 bg-lime/10 border border-lime/20 px-6 py-3 rounded-2xl text-cream/90 text-base">
              <Trophy className="size-5 text-lime" />
              <span>Destaque: <span className="text-lime font-bold">{partyData.characterName}</span></span>
            </div>
          )}

          <div className="w-full border-t border-white/10 pt-6 mt-4 flex justify-between items-center text-xs text-cream/50">
            <span>Área do Convidado • Acesso Verificado</span>
            <button 
              onClick={() => setPartyData(null)}
              className="hover:text-lime underline cursor-pointer transition-colors font-medium"
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
