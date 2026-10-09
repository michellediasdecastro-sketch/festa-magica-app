import { useState, useEffect } from "react";
import { Volume2, VolumeX, X, Brain, Calculator, Shapes, Puzzle } from "lucide-react";
import { supabase } from "../lib/supabase";

interface PartyGamesProps {
  partyData: any;
  onBackToMain: () => void;
}

export function PartyGames({ partyData, onBackToMain }: PartyGamesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [themeImages, setThemeImages] = useState<string[]>([]);

  // Estados específicos para o Jogo da Memória (Quebra-Cabeças / Pares)
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchThemeImages() {
      if (!partyData?.theme) return;
      const { data } = await supabase
        .from("themes")
        .select("game_images, background_url")
        .ilike("theme_name", partyData.theme.trim())
        .single();
      
      if (data) {
        if (data.game_images && data.game_images.length > 0) {
          setThemeImages(data.game_images);
        } else if (data.background_url) {
          setThemeImages([data.background_url]);
        }
      }
    }
    fetchThemeImages();
  }, [partyData]);

  // Gerador dinâmico de dezenas de variações por categoria (Estilo LogicLike)
  const generateDynamicChallenge = (catId: string) => {
    if (catId === 'logica') {
      const sets = [
        { instruction: "Toque na fruta verde!", spokenText: "Escolha a fruta verde", correct: "🍏", options: ["🍎", "🍏", "🍊", "🍌"] },
        { instruction: "Encontre o animal diferente na roda!", spokenText: "Encontre o animal diferente", correct: "🦊", options: ["🐼", "🦊", "🐼", "🐼"] },
        { instruction: "Qual elemento brilha no céu à noite?", spokenText: "Qual elemento brilha no céu à noite", correct: "⭐", options: ["☀️", "⭐", "☁️", "🎈"] },
        { instruction: "Qual destes animais voa?", spokenText: "Qual destes animais voa", correct: "🐦", options: ["🐶", "🐱", "🐦", "🦁"] },
        { instruction: "Toque na cor vermelha!", spokenText: "Escolha a cor vermelha", correct: "🍎", options: ["🍌", "🍎", "📘", "🍏"] },
        { instruction: "Qual bicho vive na água?", spokenText: "Qual bicho vive na água", correct: "🐟", options: ["🐱", "🐟", "🐶", "🐰"] }
      ];
      const selected = sets[Math.floor(Math.random() * sets.length)];
      return { ...selected, options: [...selected.options].sort(() => Math.random() - 0.5) };
    } 
    
    if (catId === 'matematica') {
      const randomCount = Math.floor(Math.random() * 4) + 2; // 2 a 5 blocos
      const randomNum1 = Math.floor(Math.random() * 5) + 1;
      const sets = [
        { 
          instruction: `Quantos blocos coloridos estão empilhados?`, 
          spokenText: "Quantos blocos estão empilhados?", 
          type: "stacked-blocks", 
          count: randomCount, 
          correct: String(randomCount), 
          options: [String(randomCount > 1 ? randomCount - 1 : 5), String(randomCount), String(randomCount + 1), String(randomCount + 2)].sort(() => Math.random() - 0.5) 
        },
        { 
          instruction: `Qual número vem logo depois do ${randomNum1}?`, 
          spokenText: `Qual número vem depois do ${randomNum1}?`, 
          correct: String(randomNum1 + 1), 
          options: [String(randomNum1), String(randomNum1 + 1), String(randomNum1 + 2), String(randomNum1 > 1 ? randomNum1 - 1 : 4)].sort(() => Math.random() - 0.5) 
        }
      ];
      return sets[Math.floor(Math.random() * sets.length)];
    } 
    
    if (catId === 'atencao') {
      const symbols = ["⭐", "🔵", "🔺", "⬛", "⭕", "💖"];
      const target = symbols[Math.floor(Math.random() * symbols.length)];
      const shuffledOptions = [...symbols].sort(() => Math.random() - 0.5).slice(0, 4);
      if (!shuffledOptions.includes(target)) shuffledOptions[0] = target;

      return {
        instruction: "Encontre a figura igual ao modelo!",
        spokenText: "Encontre a figura igual ao modelo",
        type: "match-model",
        model: target,
        correct: target,
        options: shuffledOptions.sort(() => Math.random() - 0.5)
      };
    } 
    
    if (catId === 'quebravc') {
      // Jogo da Memória / Achar os Pares (Estilo verdadeiro quebra-cabeças de cartas)
      const icons = ["🍎", "⭐", "🐱", "🚗"];
      const selectedCard = icons[Math.floor(Math.random() * icons.length)];
      const deck = [...icons, ...icons].sort(() => Math.random() - 0.5).map((icon, idx) => ({ id: idx, icon, isFlipped: false }));
      
      return {
        instruction: "Encontre o par da carta escondida!",
        spokenText: "Encontre o par igual",
        type: "memory-game",
        targetIcon: selectedCard,
        cards: deck
      };
    }

    return null;
  };

  const speakInstruction = (text: string) => {
    if (!isAudioEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playSfx = (type: 'success' | 'wrong' | 'click') => {
    if (!isAudioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    } catch (e) {
      console.log("SFX error", e);
    }
  };

  const handleSelectCategory = (catId: string) => {
    playSfx('click');
    setActiveCategory(catId);
    setMatchedPairs([]);
    setFlippedCards([]);
    const challenge = generateDynamicChallenge(catId);
    setCurrentChallenge(challenge);
    if (challenge) {
      setTimeout(() => speakInstruction(challenge.spokenText), 400);
    }
  };

  const handleAnswer = (option: string) => {
    if (!currentChallenge) return;

    if (option === currentChallenge.correct) {
      playSfx('success');
      setFeedback("correct");
      setShowConfetti(true);
      setScore(score + 10);
      setCompletedTasks(completedTasks + 1);

      // Avança automaticamente para um novo desafio gerado na hora
      setTimeout(() => {
        setFeedback(null);
        setShowConfetti(false);
        const nextChallenge = generateDynamicChallenge(activeCategory as string);
        setCurrentChallenge(nextChallenge);
        if (nextChallenge) speakInstruction(nextChallenge.spokenText);
      }, 800);
    } else {
      playSfx('wrong');
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 500);
    }
  };

  // Lógica para o Jogo da Memória (Pares)
  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index)) return;
    playSfx('click');

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      const card1 = currentChallenge.cards[firstIndex];
      const card2 = currentChallenge.cards[secondIndex];

      if (card1.icon === card2.icon) {
        playSfx('success');
        setMatchedPairs([...matchedPairs, card1.icon]);
        setFlippedCards([]);

        // Se encontrou todos os pares, gera novo desafio de memória
        if (matchedPairs.length + 1 >= 2) {
          setShowConfetti(true);
          setScore(score + 15);
          setCompletedTasks(completedTasks + 1);
          setTimeout(() => {
            setShowConfetti(false);
            setMatchedPairs([]);
            const nextChallenge = generateDynamicChallenge('quebravc');
            setCurrentChallenge(nextChallenge);
          }, 1000);
        }
      } else {
        playSfx('wrong');
        setTimeout(() => {
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  const categories = [
    { id: "logica", title: "Lógica", color: "bg-purple-600/80 hover:bg-purple-700", icon: Brain },
    { id: "matematica", title: "Matemática", color: "bg-orange-600/80 hover:bg-orange-700", icon: Calculator },
    { id: "atencao", title: "Atenção", color: "bg-blue-600/80 hover:bg-blue-700", icon: Shapes },
    { id: "quebravc", title: "Quebra-cabeças (Pares)", color: "bg-green-600/80 hover:bg-green-700", icon: Puzzle }
  ];

  const currentMiniImage = themeImages.length > 0 
    ? themeImages[completedTasks % themeImages.length] 
    : "";

  return (
    <div className="w-full max-w-4xl mx-auto bg-transparent text-white animate-fade-in relative px-4">
      
      {/* Topo Global: Som e Sair */}
      <div className="flex justify-between items-center pb-4 mb-4">
        <button 
          onClick={onBackToMain}
          className="px-4 py-2 rounded-2xl bg-black/50 border border-white/30 hover:bg-black/70 text-xs font-bold transition-all cursor-pointer backdrop-blur-md shadow-lg"
        >
          ← Voltar
        </button>

        <button 
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className="p-3 rounded-2xl bg-black/50 border border-white/30 hover:bg-black/70 transition-all cursor-pointer text-white flex items-center gap-2 text-xs font-bold backdrop-blur-md shadow-lg"
        >
          {isAudioEnabled ? <Volume2 className="size-4 text-[#bef264]" /> : <VolumeX className="size-4 text-red-400" />}
          {isAudioEnabled ? "Som Ativado" : "Mudo"}
        </button>
      </div>

      {/* MENU DE CATEGORIAS */}
      {!activeCategory ? (
        <div className="flex flex-col gap-6 animate-fade-in text-center">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
              {partyData.partyName}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 drop-shadow">
              Guia: <strong className="text-[#bef264]">{partyData.characterName || "Mascote"}</strong> | Escolha um mundo para jogar!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {categories.map((cat, index) => {
              const IconComponent = cat.icon;
              const catImage = themeImages.length > 0 ? themeImages[index % themeImages.length] : "";

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`${cat.color} p-6 rounded-[2.5rem] shadow-2xl flex flex-col justify-between items-center gap-4 transition-all transform hover:scale-105 cursor-pointer text-center border border-white/30 backdrop-blur-md relative overflow-hidden`}
                >
                  {catImage && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-[1px]"
                      style={{ backgroundImage: `url('${catImage}')` }}
                    />
                  )}
                  <div className="relative z-10 p-4 rounded-3xl bg-black/40 text-white shadow-inner">
                    <IconComponent className="size-8 text-[#bef264]" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-extrabold text-white drop-shadow">{cat.title}</h3>
                    <span className="text-[11px] text-[#bef264] font-bold mt-1 block">Toque para jogar</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // TELA DO JOGO ATIVO
        <div className="flex flex-col gap-6 animate-fade-in relative min-h-[380px] items-center">
          
          <div className="w-full flex justify-between items-center max-w-xl">
            <button
              onClick={() => speakInstruction(currentChallenge?.spokenText)}
              className="p-3.5 rounded-2xl bg-black/60 border border-white/30 hover:bg-black/80 transition-all cursor-pointer flex items-center gap-2 shadow-xl backdrop-blur-md animate-pulse"
              title="Ouvir instrução"
            >
              <Volume2 className="size-6 text-[#bef264]" />
              <span className="text-xs font-bold text-white">Ouvir Comando</span>
            </button>

            {/* Botão X sai imediatamente do jogo e retorna ao menu */}
            <button
              onClick={() => setActiveCategory(null)}
              className="p-3.5 rounded-2xl bg-red-600/60 border border-red-400/50 hover:bg-red-600/80 transition-all cursor-pointer text-white shadow-xl backdrop-blur-md"
              title="Sair do Jogo"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Área Visual do Desafio */}
          {currentChallenge && (
            <div className={`w-full max-w-xl p-8 rounded-[2.5rem] border text-center flex flex-col items-center justify-center gap-6 transition-all shadow-2xl backdrop-blur-md relative overflow-hidden ${
              feedback === 'correct' ? 'bg-green-600/40 border-green-400 scale-102' :
              feedback === 'wrong' ? 'bg-red-600/40 border-red-400 animate-bounce' :
              'bg-black/40 border-white/25'
            }`}>
              {currentMiniImage && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                  style={{ backgroundImage: `url('${currentMiniImage}')` }}
                />
              )}

              <h3 className="relative z-10 text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {currentChallenge.instruction}
              </h3>

              {/* Renderização para Matemática (Blocos Empilhados Dinâmicos) */}
              {currentChallenge.type === 'stacked-blocks' && (
                <div className="relative z-10 flex flex-col items-center justify-center py-2 gap-1">
                  {Array.from({ length: currentChallenge.count }).map((_, idx) => (
                    <div key={idx} className="w-20 h-8 bg-orange-500 rounded-xl shadow-lg border border-white/30"></div>
                  ))}
                </div>
              )}

              {/* Renderização para Atenção (Modelo Dinâmico) */}
              {currentChallenge.type === 'match-model' && (
                <div className="relative z-10 flex flex-col items-center gap-2 bg-black/50 px-6 py-3 rounded-2xl border border-white/20 shadow-inner">
                  <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Modelo:</span>
                  <span className="text-5xl">{currentChallenge.model}</span>
                </div>
              )}

              {/* Renderização para Quebra-Cabeças (Jogo da Memória / Pares) */}
              {currentChallenge.type === 'memory-game' ? (
                <div className="relative z-10 grid grid-cols-4 gap-3 w-full my-2">
                  {currentChallenge.cards.map((card: any, idx: number) => {
                    const isFlipped = flippedCards.includes(idx) || matchedPairs.includes(card.icon);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleCardClick(idx)}
                        className={`h-20 rounded-2xl border transition-all cursor-pointer text-4xl flex items-center justify-center shadow-xl ${
                          isFlipped ? 'bg-white/20 border-[#bef264]' : 'bg-black/70 border-white/30 hover:bg-black/50'
                        }`}
                      >
                        {isFlipped ? card.icon : "❓"}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-2">
                  {currentChallenge.options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt)}
                      className="py-6 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] hover:bg-white/25 transition-all cursor-pointer text-4xl sm:text-5xl flex items-center justify-center shadow-2xl active:scale-95 backdrop-blur-md"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
              <span className="text-7xl animate-bounce">🎉✨🎊⭐</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
