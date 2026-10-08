import { useState } from "react";
import { AccessLogin } from "./components/AccessLogin";
import { Sparkles, Cake, Users, Gift, PartyPopper } from "lucide-react";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 text-white">
      {!partyData ? (
        <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
      ) : (
        <div className="w-full max-w-2xl bg-white/10 border-2 border-pink-400/40 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center gap-6 relative overflow-hidden animate-fade-in">
          
          {/* Efeitos de luz festivos de fundo */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Cabeçalho do Tema */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-extrabold tracking-wider uppercase shadow-lg">
            <Sparkles className="size-4 animate-spin" /> Tema: {partyData.theme}
          </div>

          <div className="space-y-2">
            <div className="flex justify-center gap-2 text-3xl md:text-4xl">
              🎈🎂🎁
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-white drop-shadow-sm">
              Bem-vindo à festa de {partyData.birthdayChildName}!
            </h1>
          </div>

          <div className="flex flex-wrap justify-center gap-4 my-2 w-full">
            <div className="flex items-center gap-3 bg-black/30 border border-white/20 px-5 py-3 rounded-2xl text-sm md:text-base backdrop-blur-md shadow-md">
              <Cake className="size-5 text-yellow-300" />
              <span>Idade do Aniversariante: <strong className="text-yellow-300">{partyData.childAge} anos</strong></span>
            </div>

            <div className="flex items-center gap-3 bg-black/30 border border-white/20 px-5 py-3 rounded-2xl text-sm md:text-base backdrop-blur-md shadow-md">
              <Users className="size-5 text-pink-300" />
              <span>Faixa do Convidado: <strong className="text-pink-300">{partyData.ageGroup}</strong></span>
            </div>
          </div>

          {partyData.characterName && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 px-6 py-3 rounded-2xl text-white text-base shadow-inner">
              <PartyPopper className="size-5 text-yellow-300" />
              <span>Destaque Especial: <span className="text-yellow-300 font-bold">{partyData.characterName}</span></span>
            </div>
          )}

          <div className="w-full border-t border-white/20 pt-6 mt-4 flex justify-between items-center text-xs text-white/60">
            <span>🎉 Painel Exclusivo do Convidado</span>
            <button 
              onClick={() => setPartyData(null)}
              className="hover:text-yellow-300 underline cursor-pointer transition-colors font-medium"
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
