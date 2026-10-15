import { Puzzle, Brain, Search, Sparkles, Calculator, Map as MapIcon, Eye, Palette, Trophy } from "lucide-react";
import { MemoryGameModule } from "./modules/MemoryGame";
import { LogicGameModule } from "./modules/LogicGame";
import { MathGameModule } from "./modules/MathGame";
import { TreasureHuntGameModule } from "./modules/TreasureHuntGame";
import { ShadowGameModule } from "./modules/ShadowGame";
import { PuzzleGameModule } from "./modules/PuzzleGame";
import { MazeGameModule } from "./modules/MazeGame";
import { AttentionGameModule } from "./modules/AttentionGame";

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
    { id: "atencao", title: "Missões de Atenção", icon: Trophy }, 
  ],
  "8-9": [
    { id: "busca", title: "Investigação e Dedução", icon: Search },
    { id: "atencao", title: "Atenção Rápida", icon: Brain },
    { id: "matematica", title: "Matemática por Desafios", icon: Calculator },
    { id: "memoria", title: "Memória Complexa", icon: Eye },
    { id: "cores-formas", title: "Sombras e Formas", icon: Palette },
    { id: "logica", title: "Lógica Avançada", icon: Puzzle },
    { id: "labirinto", title: "Labirintos Estratégicos", icon: MapIcon },
    { id: "quebra-cabeca", title: "Padrões Ocultos", icon: Sparkles },
  ],
  "10-11": [
    { id: "busca", title: "Busca Impossível", icon: Search },
    { id: "atencao", title: "Atenção Máxima", icon: Brain },
    { id: "logica", title: "Lógica e Dedução", icon: Puzzle },
    { id: "memoria", title: "Super Memória", icon: Eye },
    { id: "matematica", title: "Matemática Complexa", icon: Calculator },
    { id: "cores-formas", title: "Interpretação Visual", icon: Palette },
    { id: "labirinto", title: "Planejamento de Rotas", icon: MapIcon },
    { id: "quebra-cabeca", title: "Decisões Críticas", icon: Sparkles },
  ]
};

// O seu projeto tem agora 8 JOGOS diferentes e completos a funcionar!
export const GameRegistry = [
  MemoryGameModule,
  LogicGameModule,
  MathGameModule,
  TreasureHuntGameModule,
  ShadowGameModule,
  PuzzleGameModule,
  MazeGameModule,
  AttentionGameModule
];
