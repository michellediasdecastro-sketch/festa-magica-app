import { Puzzle, Brain, Search, Sparkles, Calculator, Map as MapIcon, Eye, Palette, Trophy } from "lucide-react";
import { MemoryGameModule } from "./modules/MemoryGame";
import { LogicGameModule } from "./modules/LogicGame";
import { MathGameModule } from "./modules/MathGame";

// Catálogo Mestre Organizador
export const Categories: Record<string, any[]> = {
  // FAIXA 4-5 ANOS
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
  
  // FAIXA 6-7 ANOS
  "6-7": [
    { id: "investigacao", title: "Mistérios e Pistas", icon: Search },
    { id: "memoria", title: "Memória e Atenção", icon: Sparkles },
    { id: "matematica", title: "Matemática Interativa", icon: Calculator },
    { id: "letras", title: "Letras e Palavras", icon: Palette },
    { id: "logica", title: "Sequências e Padrões", icon: Brain },
    { id: "labirinto", title: "Labirintos com Regras", icon: MapIcon },
    { id: "quebra-cabeca", title: "Montagem de Cenas", icon: Puzzle },
    { id: "missoes", title: "Missões de Lógica", icon: Trophy }, 
  ],
  
  // FAIXA 8-9 ANOS
  "8-9": [
    { id: "investigacao", title: "Investigação e Dedução", icon: Search },
    { id: "estrategia", title: "Estratégia e Planos", icon: Brain },
    { id: "matematica", title: "Matemática por Desafios", icon: Calculator },
    { id: "codigos", title: "Códigos Secretos", icon: Eye },
    { id: "letras", title: "Palavras e Enigmas", icon: Palette },
    { id: "logica", title: "Lógica Avançada", icon: Puzzle },
    { id: "labirinto", title: "Labirintos Estratégicos", icon: MapIcon },
    { id: "missoes", title: "Pistas Encadeadas", icon: Sparkles },
  ],
  
  // FAIXA 10-11 ANOS
  "10-11": [
    { id: "investigacao", title: "Casos de Investigação", icon: Search },
    { id: "estrategia", title: "Recursos Limitados", icon: Brain },
    { id: "logica", title: "Lógica e Dedução", icon: Puzzle },
    { id: "codigos", title: "Criptogramas", icon: Eye },
    { id: "matematica", title: "Matemática Complexa", icon: Calculator },
    { id: "letras", title: "Interpretação", icon: Palette },
    { id: "labirinto", title: "Planejamento de Rotas", icon: MapIcon },
    { id: "missoes", title: "Decisões e Consequências", icon: Sparkles },
  ]
};

// Aqui nós ligamos os componentes físicos às categorias
export const GameRegistry = [
  MemoryGameModule,
  LogicGameModule,
  MathGameModule
];
