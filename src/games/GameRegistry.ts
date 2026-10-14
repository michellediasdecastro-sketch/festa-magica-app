import { Puzzle, Brain, Search, Sparkles, Calculator } from "lucide-react";
import { MemoryGameModule } from "./modules/MemoryGame";
import { LogicGameModule } from "./modules/LogicGame";
import { MathGameModule } from "./modules/MathGame";

// O catálogo visual que define quais categorias aparecem para cada idade
export const Categories: Record<string, any[]> = {
  "4-5": [
    { id: "memoria", title: "Memória Mágica", icon: Sparkles },
    { id: "logica", title: "O Intruso", icon: Brain },
    { id: "matematica", title: "Contagem Divertida", icon: Calculator },
  ],
  "6-7": [
    { id: "memoria", title: "Foco e Atenção", icon: Sparkles },
    { id: "logica", title: "Raciocínio Rápido", icon: Brain },
    { id: "matematica", title: "Desafio Numérico", icon: Calculator },
  ]
};

// A lista real de todos os minijogos desenvolvidos. 
export const GameRegistry = [
  MemoryGameModule,
  LogicGameModule,
  MathGameModule
];
