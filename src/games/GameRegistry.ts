import { Puzzle, Brain, Search, Sparkles, Calculator, Map as MapIcon, Eye, Palette, Trophy } from "lucide-react";
import { MemoryGameModule } from "./modules/MemoryGame";
import { LogicGameModule } from "./modules/LogicGame";
import { MathGameModule } from "./modules/MathGame";
import { TreasureHuntGameModule } from "./modules/TreasureHuntGame";
import { ShadowGameModule } from "./modules/ShadowGame";

// Catálogo Mestre Organizador
export const Categories: Record<string, any[]> = {
  "4-5": [
    { id: "busca", title: "Caça ao Tesouro", icon: Search },
    { id: "memoria", title: "Memória Mágica", icon: Sparkles },
    { id: "quebra-cabeca", title: "Quebra-Cabeças", icon: Puzzle },
    { id: "cores-formas", title: "Cores e Tamanhos", icon: Palette },
    { id: "matematica", title: "Contagem Divertida", icon: Calculator },
    { id: "logica", title: "Lógica dos Personagens", icon: Brain },
    { id: "labirinto", title: "Labirintos Encantados", icon: MapIcon },
    { id: "atencao", title: "Atenção e Observação", icon: Eye },
  ],
  "6-7": [
    { id: "busca", title: "Mistérios e Pistas", icon: Search },
    { id: "memoria", title: "Memória e Atenção", icon: Sparkles },
    { id: "matematica", title: "Matemática Interativa", icon: Calculator },
    { id: "cores-formas", title: "Silhuetas e Cores", icon: Palette },
    { id: "logica", title: "Sequências e Padrões", icon: Brain },
    { id: "labirinto", title: "Labirintos com Regras", icon: MapIcon },
    { id: "quebra-cabeca", title: "Montagem de Cenas", icon: Puzzle },
    { id: "atencao", title: "Missões de Lógica", icon: Trophy }, 
  ],
  "8-9": [
    { id: "busca", title: "Investigação e Dedução", icon: Search },
    { id: "atencao", title: "Estratégia e Planos", icon: Brain },
    { id: "matematica", title: "Matemática por Desafios", icon: Calculator },
    { id: "memoria", title: "Códigos Secretos", icon: Eye },
    { id: "cores-formas", title: "Palavras e Enigmas", icon: Palette },
    { id: "logica", title: "Lógica Avançada", icon: Puzzle },
    { id: "labirinto", title: "Labirintos Estratégicos", icon: MapIcon },
    { id: "quebra-cabeca", title: "Pistas Encadeadas", icon: Sparkles },
  ],
  "10-11": [
    { id: "busca", title: "Casos de Investigação", icon: Search },
    { id: "atencao", title: "Recursos Limitados", icon: Brain },
    { id: "logica", title: "Lógica e Dedução", icon: Puzzle },
    { id: "memoria", title: "Criptogramas", icon: Eye },
    { id: "matematica", title: "Matemática Complexa", icon: Calculator },
    { id: "cores-formas", title: "Interpretação Visual", icon: Palette },
    { id: "labirinto", title: "Planejamento de Rotas", icon: MapIcon },
    { id: "quebra-cabeca", title: "Decisões Críticas", icon: Sparkles },
  ]
};

// LIGAÇÃO DOS MÓDULOS (Agora com 5 Jogos!)
export const GameRegistry = [
  MemoryGameModule,
  LogicGameModule,
  MathGameModule,
  TreasureHuntGameModule,
  ShadowGameModule
];
