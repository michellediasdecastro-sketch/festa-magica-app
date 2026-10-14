export type AgeGroup = "4-5" | "6-7" | "8-9" | "10-11";

export interface PartyContext {
  theme: string;
  childName: string;
  childAge: number;
  characterName: string;
  gameImages: string[];
}

export interface Challenge {
  id: string;          // Assinatura única gerada para evitar repetição (ex: "mem-4cards-dinossauro")
  instruction: string; // Texto visível
  spokenText: string;  // Texto para o sintetizador de voz
  data: any;           // Dados específicos do jogo (cartas, padrões, labirintos)
}

export interface GameModule {
  id: string;
  title: string;
  categoryId: string;
  supportedAges: AgeGroup[];
  // O gerador recebe o histórico para nunca gerar uma assinatura repetida
  generateChallenge: (difficulty: number, context: PartyContext, history: string[]) => Challenge;
  component: React.FC<{
    challenge: Challenge;
    onAnswer: (isCorrect: boolean, scoreDelta: number) => void;
  }>;
}
