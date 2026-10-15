import { Puzzle, Brain, Search, Sparkles, Calculator, Map as MapIcon, Eye, Palette, Trophy, Fingerprint, Lock, Route, Compass } from "lucide-react";

// Módulos 4-5 Anos
import { MemoryGameModule } from "./modules/MemoryGame";
import { LogicGameModule } from "./modules/LogicGame";
import { MathGameModule } from "./modules/MathGame";
import { TreasureHuntGameModule } from "./modules/TreasureHuntGame";
import { ShadowGameModule } from "./modules/ShadowGame";
import { PuzzleGameModule } from "./modules/PuzzleGame";
import { MazeGameModule } from "./modules/MazeGame";
import { AttentionGameModule } from "./modules/AttentionGame";

// Módulos 6-7 Anos
import { MathAdvancedGameModule } from "./modules/MathAdvancedGame";
import { WordsGameModule } from "./modules/WordsGame";
import { Puzzle6GameModule } from "./modules/Puzzle6Game";
import { Memory6GameModule } from "./modules/Memory6Game";
import { Search6GameModule } from "./modules/Search6Game";
import { Maze6GameModule } from "./modules/Maze6Game";
import { Scene6GameModule } from "./modules/Scene6Game";
import { Logic6GameModule } from "./modules/Logic6Game";

export const Categories: Record<string, any[]> = {
  "4-5": [
    { id: "busca-4", title: "Caça ao Tesouro", icon: Search },
    { id: "memoria-4", title: "Memória Mágica", icon: Sparkles },
    { id: "quebra-cabeca-4", title: "Quebra-Cabeças", icon: Puzzle },
    { id: "cores-formas-4", title: "Cores e Tamanhos", icon: Palette },
    { id: "matematica-4", title: "Contagem Divertida", icon: Calculator },
    { id: "logica-4", title: "Lógica dos Personagens", icon: Brain },
    { id: "labirinto-4", title: "Labirintos Encantados", icon: MapIcon },
    { id: "atencao-4", title: "Atenção e Observação", icon: Eye },
  ],
  "6-7": [
    { id: "misterios-6", title: "Mistérios e Pistas", icon: Search },
    { id: "memoria-6", title: "Memória e Atenção", icon: Sparkles },
    { id: "matematica-6", title: "Matemática Interativa", icon: Calculator },
    { id: "letras-6", title: "Letras, Sílabas e Palavras", icon: Palette },
    { id: "sequencias-6", title: "Sequências e Padrões", icon: Brain },
    { id: "labirinto-6", title: "Labirintos com Regras", icon: MapIcon },
    { id: "montagem-6", title: "Montagem de Cenas", icon: Puzzle },
    { id: "missoes-6", title: "Missões de Lógica", icon: Trophy }, 
  ],
  "8-9": [
    { id: "investigacao-8", title: "Investigação e Dedução", icon: Search },
    { id: "estrategia-8", title: "Estratégia e Planejamento", icon: Brain },
    { id: "matematica-8", title: "Matemática por Desafios", icon: Calculator },
    { id: "codigos-8", title: "Códigos e Mensagens", icon: Eye },
    { id: "palavras-8", title: "Palavras e Enigmas", icon: Palette },
    { id: "logica-8", title: "Sequências e Lógica Avançada", icon: Puzzle },
    { id: "labirinto-8", title: "Labirintos Estratégicos", icon: MapIcon },
    { id: "pistas-8", title: "Missões com Pistas", icon: Compass },
  ],
  "10-11": [
    { id: "casos-10", title: "Casos de Investigação", icon: Fingerprint },
    { id: "recursos-10", title: "Estratégia e Recursos", icon: Brain },
    { id: "deducao-10", title: "Lógica e Dedução", icon: Puzzle },
    { id: "criptogramas-10", title: "Códigos e Criptogramas", icon: Lock },
    { id: "matematica-10", title: "Matemática em Múltiplas Etapas", icon: Calculator },
    { id: "interpretacao-10", title: "Interpretação e Enigmas", icon: Eye },
    { id: "rotas-10", title: "Planejamento de Rotas", icon: Route },
    { id: "decisoes-10", title: "Decisões e Consequências", icon: Trophy },
  ]
};

export const GameRegistry = [
  // 4-5 ANOS
  { ...MemoryGameModule, categoryId: "memoria-4", supportedAges: ["4-5"] },
  { ...LogicGameModule, categoryId: "logica-4", supportedAges: ["4-5"] },
  { ...MathGameModule, categoryId: "matematica-4", supportedAges: ["4-5"] },
  { ...TreasureHuntGameModule, categoryId: "busca-4", supportedAges: ["4-5"] },
  { ...ShadowGameModule, categoryId: "cores-formas-4", supportedAges: ["4-5"] },
  { ...PuzzleGameModule, categoryId: "quebra-cabeca-4", supportedAges: ["4-5"] },
  { ...MazeGameModule, categoryId: "labirinto-4", supportedAges: ["4-5"] },
  { ...AttentionGameModule, categoryId: "atencao-4", supportedAges: ["4-5"] },
  
  // 6-7 ANOS
  { ...MathAdvancedGameModule, categoryId: "matematica-6", supportedAges: ["6-7"] },
  { ...WordsGameModule, categoryId: "letras-6", supportedAges: ["6-7"] },
  { ...Puzzle6GameModule, categoryId: "sequencias-6", supportedAges: ["6-7"] },
  { ...Memory6GameModule, categoryId: "memoria-6", supportedAges: ["6-7"] },
  { ...Search6GameModule, categoryId: "misterios-6", supportedAges: ["6-7"] },
  { ...Maze6GameModule, categoryId: "labirinto-6", supportedAges: ["6-7"] },
  { ...Scene6GameModule, categoryId: "montagem-6", supportedAges: ["6-7"] },
  { ...Logic6GameModule, categoryId: "missoes-6", supportedAges: ["6-7"] }
];
