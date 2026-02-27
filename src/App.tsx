import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Zap, 
  Lightbulb, 
  ChevronLeft, 
  Trophy,
  RefreshCw,
  Home,
  Hash,
  Search,
  Volume2,
  VolumeX,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { generateEncouragement } from './services/gemini';
import { soundService } from './services/sound';

// Components
import MemoryTest from './components/MemoryTest';
import ReflexTest from './components/ReflexTest';
import NumberSequenceTest from './components/NumberSequenceTest';
import NamingTest from './components/NamingTest';
import HelpModal from './components/HelpModal';

type ExerciseType = 'memory' | 'reflex' | 'numbers' | 'naming' | null;

export default function App() {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>(null);
  const [encouragement, setEncouragement] = useState<string>("");
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [stats, setStats] = useState<{
    highScores: Record<string, number>;
    dailyCompletions: number;
    lastResetDate: string;
  }>({
    highScores: {
      memory: 0,
      reflex: 0,
      numbers: 0,
      naming: 0
    },
    dailyCompletions: 0,
    lastResetDate: new Date().toDateString()
  });

  useEffect(() => {
    loadEncouragement();
    const savedStats = localStorage.getItem('mindstrong_stats');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        const today = new Date().toDateString();
        
        // Handle migration from old format or reset daily if new day
        if ('completed' in parsed || !parsed.highScores) {
          // Migration or old format
          const migration: any = {
            highScores: parsed.highScores || {
              memory: 0, reflex: 0, numbers: 0, naming: 0
            },
            dailyCompletions: parsed.lastResetDate === today ? (parsed.dailyCompletions || 0) : 0,
            lastResetDate: today
          };
          setStats(migration);
          localStorage.setItem('mindstrong_stats', JSON.stringify(migration));
        } else {
          // Check for daily reset
          if (parsed.lastResetDate !== today) {
            parsed.dailyCompletions = 0;
            parsed.lastResetDate = today;
          }
          setStats(parsed);
        }
      } catch (e) {
        console.error("Failed to parse stats", e);
      }
    }
    
    const savedSound = localStorage.getItem('mindstrong_sound');
    if (savedSound !== null) {
      const enabled = savedSound === 'true';
      setIsSoundEnabled(enabled);
      soundService.setEnabled(enabled);
    }
  }, []);

  // Scroll to top whenever the active exercise changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeExercise]);

  const toggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    soundService.setEnabled(newState);
    localStorage.setItem('mindstrong_sound', String(newState));
    if (newState) soundService.playTap();
  };

  const loadEncouragement = async () => {
    try {
      const msg = await generateEncouragement();
      setEncouragement(msg || "You're doing great! Every step counts.");
    } catch (e) {
      setEncouragement("You're doing great! Every step counts.");
    }
  };

  const handleComplete = (score: number) => {
    if (!activeExercise) return;
    
    const currentHighScore = stats.highScores[activeExercise] || 0;
    const newHighScores = { ...stats.highScores };
    if (score > currentHighScore) {
      newHighScores[activeExercise] = score;
    }

    const newStats = {
      ...stats,
      highScores: newHighScores,
      dailyCompletions: stats.dailyCompletions + 1
    };
    
    setStats(newStats);
    localStorage.setItem('mindstrong_stats', JSON.stringify(newStats));
    
    if (score > 0) {
      soundService.playComplete();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#40e0d0', '#f8c8dc', '#ff8c00']
      });
    } else {
      soundService.playTap();
    }
  };

  const exercises = [
    {
      id: 'memory' as const,
      title: 'Memory Practice',
      description: 'Remember and recall simple words.',
      icon: Brain,
      color: 'bg-brand-baby-blue'
    },
    {
      id: 'reflex' as const,
      title: 'Quick Reflexes',
      description: 'Tap the targets as they appear.',
      icon: Zap,
      color: 'bg-brand-turquoise'
    },
    {
      id: 'numbers' as const,
      title: 'Number Sequence',
      description: 'Repeat the sequence of numbers.',
      icon: Hash,
      color: 'bg-brand-turquoise'
    },
    {
      id: 'naming' as const,
      title: 'Word Finding',
      description: 'Identify objects from descriptions.',
      icon: Search,
      color: 'bg-brand-pink'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-brand-baby-blue border-b-4 border-brand-ink shadow-[0_4px_0_rgba(44,44,36,1)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 diner-chrome rounded-full flex items-center justify-center border-2 border-white">
            <Brain className="text-brand-ink w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tighter text-brand-ink uppercase italic leading-none">MindStrong</h1>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-azulejo">Mente Forte</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsInfoOpen(true)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-brand-ink"
            title="How to use"
          >
            <Info className="w-8 h-8" />
          </button>
          <button 
            onClick={toggleSound}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-brand-ink"
            title={isSoundEnabled ? "Disable Sound" : "Enable Sound"}
          >
            {isSoundEnabled ? <Volume2 className="w-8 h-8" /> : <VolumeX className="w-8 h-8" />}
          </button>
          <button 
            onClick={() => setActiveExercise(null)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Home className="w-8 h-8 text-brand-ink" />
          </button>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-6">
        <HelpModal 
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          title="How to Use MindStrong"
          instructions={[
            "Practice daily: Try to complete at least 3 exercises every day.",
            "Save to Home Screen: On your tablet or phone, tap 'Share' and select 'Add to Home Screen' to use this like a real app.",
            "Gentle pace: There is no rush. If an exercise feels difficult, take a break and try again later.",
            "Sound: Use the volume icon at the top to turn the encouraging sounds on or off."
          ]}
        />
        <AnimatePresence mode="wait">
          {!activeExercise ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Daily Goal - Small and Tight */}
              <div className="bg-brand-baby-blue/30 p-3 rounded-2xl retro-border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-brand-azulejo" />
                  <span className="text-sm font-black uppercase italic">Daily Goal: 5 Exercises</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-brand-ink/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-atomic" 
                      style={{ width: `${Math.min((stats.dailyCompletions / 5) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold">{stats.dailyCompletions}/5</span>
                </div>
              </div>

              {/* Welcome Section */}
              <section className="text-center space-y-1 py-2">
                <h2 className="text-3xl md:text-4xl font-serif text-brand-ink leading-tight font-bold">
                  Olá John! <br />
                  <span className="italic text-brand-azulejo text-2xl">Vamos exercitar o cérebro</span>
                </h2>
              </section>

              {/* Exercise Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setActiveExercise(ex.id)}
                    className="group text-left p-6 bg-white rounded-[24px] card-shadow border border-transparent hover:border-brand-ink/20 transition-all hover:-translate-y-1"
                  >
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 border-4 border-brand-ink shadow-md", ex.color)}>
                      <ex.icon className="w-8 h-8 text-brand-ink" />
                    </div>
                    <h3 className="text-xl font-bold mb-1 uppercase tracking-tighter italic">{ex.title}</h3>
                    <p className="text-base text-brand-ink/70 leading-snug">{ex.description}</p>
                  </button>
                ))}
              </div>

              {/* High Scores Progress - Moved to Bottom */}
              <div className="bg-white p-6 rounded-[32px] retro-border shadow-[8px_8px_0_rgba(44,44,36,0.1)]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-black text-brand-ink/40">Your Records</p>
                    <h4 className="text-2xl font-serif italic">Top Scores</h4>
                  </div>
                  {/* '57 Chevy Illustration (Simplified SVG) */}
                  <div className="w-32 h-16 relative">
                    <svg viewBox="0 0 120 60" className="w-full h-full drop-shadow-md">
                      {/* Car Body - Baby Blue */}
                      <path d="M10,40 L110,40 L115,30 L105,25 L80,25 L70,15 L30,15 L20,25 L5,30 Z" fill="#ADD8E6" stroke="#2c2c24" strokeWidth="2" />
                      {/* Tail Fin */}
                      <path d="M105,25 L118,15 L110,40 Z" fill="#ADD8E6" stroke="#2c2c24" strokeWidth="1.5" />
                      {/* Windows */}
                      <path d="M35,18 L65,18 L72,25 L30,25 Z" fill="#ffffff" stroke="#2c2c24" strokeWidth="1" />
                      {/* Wheels */}
                      <circle cx="30" cy="42" r="8" fill="#2c2c24" />
                      <circle cx="30" cy="42" r="4" fill="#ffffff" />
                      <circle cx="90" cy="42" r="8" fill="#2c2c24" />
                      <circle cx="90" cy="42" r="4" fill="#ffffff" />
                      {/* Chrome Trim */}
                      <line x1="10" y1="35" x2="105" y2="35" stroke="#ffffff" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {exercises.map(ex => (
                    <div key={ex.id} className="p-4 bg-brand-cream rounded-2xl border-2 border-brand-ink/10 flex flex-col items-center">
                      <p className="text-[10px] uppercase font-bold text-brand-ink/40 mb-1">{ex.title}</p>
                      <p className="text-2xl font-black text-brand-ink">{stats.highScores[ex.id] || 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full space-y-6"
            >
              <button 
                onClick={() => setActiveExercise(null)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-brand-atomic text-brand-ink rounded-full font-black text-xl retro-border shadow-[4px_4px_0_rgba(44,44,36,1)] hover:scale-[1.02] transition-all active:scale-95"
              >
                <ChevronLeft className="w-8 h-8" />
                RETURN TO MENU
              </button>

              <div className="bg-white rounded-[32px] p-6 md:p-8 retro-border azulejo-border shadow-[12px_12px_0_rgba(44,44,36,0.1)] min-h-[500px] flex flex-col">
                {activeExercise === 'memory' && <MemoryTest onComplete={handleComplete} />}
                {activeExercise === 'reflex' && <ReflexTest onComplete={handleComplete} />}
                {activeExercise === 'numbers' && <NumberSequenceTest onComplete={handleComplete} />}
                {activeExercise === 'naming' && <NamingTest onComplete={handleComplete} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-8 text-center text-brand-ink/40 text-sm">
        <p>© {new Date().getFullYear()} MindStrong • Designed for Stroke Recovery</p>
      </footer>
    </div>
  );
}
