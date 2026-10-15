import React, { useState, useEffect, useMemo } from "react";
import { Volume2, VolumeX, X, Trophy, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { PartyContext, AgeGroup } from "../lib/gameTypes";
import { GameRegistry, Categories } from "../games/GameRegistry";

let sharedAudioCtx: AudioContext | null = null;

interface PartyGamesProps {
  partyData: any;
  onBackToMain: () => void;
}

export function PartyGames({ partyData, onBackToMain }: PartyGamesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [themeImages, setThemeImages] = useState<string[]>([]);
  
  const [difficulty, setDifficulty] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const age = partyData.guestAge || partyData.child_age || partyData.childAge || 5;
  const ageGroup: AgeGroup = age <= 5 ? "4-5" : age <= 7 ? "6-7" : age <= 9 ? "8-9" : "10-11";

  const fallbackImages = ["🍎", "🚗", "🐶", "⭐", "🎈", "🚀", "🐱", "⚽"];

  const partyContext: PartyContext = useMemo(() => ({
    theme: partyData.theme || "Aventura",
    childName: partyData.guestName || "Aventureiro",
    childAge: age,
    characterName: partyData.character_name || partyData.characterName || "Mascote",
    gameImages: themeImages.length > 0 ? themeImages : fallbackImages
  }), [partyData, themeImages, age]);

  useEffect(() => {
    async function fetchImages() {
      if (!partyData?.theme) return;
      const { data } = await supabase.from("themes").select("game_images, background_url").ilike("theme_name", partyData.theme.trim()).single();
      if (data?.game_images?.length) setThemeImages(data.game_images);
      else if (data?.background_url) setThemeImages([data.background_url]);
    }
    fetchImages();
  }, [partyData]);

  const speak = (text: string) => {
    if (!isAudioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const playSfx = (type: 'success' | 'wrong' | 'click') => {
    if (!isAudioEnabled) return;
    try {
      if (!sharedAudioCtx) {
        sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
      
      const osc = sharedAudioCtx.createOscillator();
      const gain = sharedAudioCtx.createGain();
      osc.connect(gain);
      gain.connect(sharedAudioCtx.destination);
      
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, sharedAudioCtx.currentTime);
        osc.frequency.setValueAtTime(783.99, sharedAudioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, sharedAudioCtx.currentTime);
        osc.start(); osc.stop(sharedAudioCtx.currentTime + 0.3);
      } else if (type === 'wrong') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, sharedAudioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, sharedAudioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, sharedAudioCtx.currentTime);
        osc.start(); osc.stop(sharedAudioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(400, sharedAudioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, sharedAudioCtx.currentTime);
        osc.start(); osc.stop(sharedAudioCtx.currentTime + 0.05);
      }
    } catch (e) {
      console.log("SFX erro mitigado:", e);
    }
  };

  const handleSelectCategory = (catId: string) => {
    playSfx('click');
    const availableGames = GameRegistry.filter(g => g.categoryId === catId && g.supportedAges.includes(ageGroup));
    
    if (availableGames.length === 0) {
      alert("Esta categoria está em construção! Tente outra missão por enquanto.");
      return;
    }

    setActiveCategory(catId);
    const selectedGame = availableGames[Math.floor(Math.random() * availableGames.length)];
    setActiveGameId(selectedGame.id);
    
    try {
      const challenge = selectedGame.generateChallenge(difficulty, partyContext, history);
      setCurrentChallenge(challenge);
      setTimeout(() => speak(challenge.spokenText), 300);
    } catch (error) {
      console.error("Erro na geração do desafio:", error);
      alert("Ops, este desafio está confuso! Vamos tentar outro.");
      setActiveCategory(null);
    }
  };

  const handleAnswer = (isCorrect: boolean, scoreDelta: number) => {
    if (isCorrect) {
      playSfx('success');
      setFeedback("correct");
      setScore(s => s + scoreDelta);
      setDifficulty(d => Math.min(10, d + 0.5));
      setHistory(prev => [currentChallenge.id, ...prev].slice(0, 30));

      setTimeout(() => {
        setFeedback(null);
        const game = GameRegistry.find(g => g.id === activeGameId);
        if (game) {
          try {
            const nextChallenge = game.generateChallenge(Math.floor(difficulty + 0.5), partyContext, history);
            setCurrentChallenge(nextChallenge);
            speak(nextChallenge.spokenText);
          } catch (error) {
            console.error("Erro bloqueado pelo sistema anti-crash:", error);
            alert("Uau, você foi tão rápido que o desafio tropeçou! Vamos escolher outra missão.");
            setActiveCategory(null);
            setCurrentChallenge(null);
          }
        }
      }, 1000);

    } else {
      playSfx('wrong');
      setFeedback("wrong");
      setDifficulty(d => Math.max(1, d - 1));
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const ActiveGameComponent = GameRegistry.find(g => g.id === activeGameId)?.component;
  const filteredCategories = Categories[ageGroup] || Categories["4-5"];

  return (
    <div className="w-full max-w-4xl mx-auto text-white animate-fade-in relative px-4">
      <div className="flex justify-between items-center pb-4 mb-4">
        <button onClick={onBackToMain} className="px-4 py-2 rounded-2xl bg-black/50 border border-white/30 hover:bg-black/70 text-xs font-bold backdrop-blur-md">
          <ArrowLeft className="size-4 inline mr-1" /> Voltar
        </button>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-2xl bg-black/50 border border-[#bef264]/30 text-xs font-bold flex items-center gap-1.5 text-[#bef264]">
            <Trophy className="size-4" /> {score}
          </div>
          <button onClick={() => setIsAudioEnabled(!isAudioEnabled)} className="p-2 rounded-2xl bg-black/50 border border-white/30 text-white backdrop-blur-md">
            {isAudioEnabled ? <Volume2 className="size-5 text-[#bef264]" /> : <VolumeX className="size-5 text-red-400" />}
          </button>
        </div>
      </div>

      {!activeCategory ? (
        <div className="flex flex-col gap-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-black drop-shadow-md">Menu de Missões</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {filteredCategories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className="p-6 rounded-[2rem] bg-black/40 border border-white/20 hover:border-[#bef264] hover:scale-105 transition-all text-center backdrop-blur-md"
              >
                <cat.icon className="size-10 mx-auto text-[#bef264] mb-3" />
                <h3 className="text-sm font-extrabold">{cat.title}</h3>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 relative min-h-[400px]">
           <div className="w-full flex justify-between">
              <button onClick={() => speak(currentChallenge?.spokenText)} className="p-3 bg-black/50 rounded-xl border border-white/20 hover:bg-black/70">
                 <Volume2 className="size-6 text-[#bef264]" />
              </button>
              <button onClick={() => { setActiveCategory(null); setCurrentChallenge(null); }} className="p-3 bg-red-500/20 rounded-xl border border-red-500/50 hover:bg-red-500/40 text-white">
                 <X className="size-6" />
              </button>
           </div>
           
           <div className={`w-full max-w-xl p-6 sm:p-8 rounded-[2.5rem] border backdrop-blur-md shadow-2xl transition-colors duration-300 ${
              feedback === 'correct' ? 'bg-green-600/30 border-green-400' :
              feedback === 'wrong' ? 'bg-red-600/30 border-red-400 animate-shake' : 'bg-black/50 border-white/20'
           }`}>
             <h3 className="text-xl sm:text-2xl font-black text-center mb-6">{currentChallenge?.instruction}</h3>
             
             <div key={currentChallenge?.id}>
               {ActiveGameComponent && currentChallenge && (
                  <ActiveGameComponent challenge={currentChallenge} onAnswer={handleAnswer} />
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
