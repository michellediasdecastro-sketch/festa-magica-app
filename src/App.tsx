import React, { useState } from "react";
import { AccessLogin } from "./components/AccessLogin";

export function App() {
  const [partyData, setPartyData] = useState<any>(null);

  return (
    <main className="min-h-screen bg-[#0b2b1e] flex items-center justify-center p-4">
      {!partyData ? (
        <AccessLogin onLoginSuccess={(data) => setPartyData(data)} />
      ) : (
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">🎉 Bem-vindo à festa de {partyData.birthdayChildName}! 🎉</h1>
          <p className="text-xl">Tema: {partyData.theme}</p>
        </div>
      )}
    </main>
  );
}

export default App;
