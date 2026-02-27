import { useState, useEffect, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Timer, Target, HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';
import { soundService } from '../services/sound';

export default function ReflexTest({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hitsRef = useRef(hits);

  useEffect(() => {
    hitsRef.current = hits;
  }, [hits]);

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('result');
            onComplete(hitsRef.current > 5 ? 1 : 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const moveTarget = () => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    // Keep target away from edges
    const newX = Math.random() * (width - 100) + 50;
    const newY = Math.random() * (height - 100) + 50;
    setTargetPos({ x: newX, y: newY });
  };

  const handleHit = (e: MouseEvent) => {
    e.stopPropagation();
    soundService.playCorrect();
    setHits(h => h + 1);
    moveTarget();
  };

  const startGame = () => {
    soundService.playTap();
    setHits(0);
    setTimeLeft(15);
    setGameState('playing');
    moveTarget();
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <button 
        onClick={() => setIsHelpOpen(true)}
        className="absolute -top-2 -right-2 p-2 text-brand-olive/40 hover:text-brand-olive transition-colors z-10"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Quick Reflexes"
        instructions={[
          "Tap the 'Start Exercise' button to begin.",
          "Green circles will appear randomly on the screen.",
          "Tap each circle as fast as you can before it moves.",
          "This helps with reaction time and hand-eye coordination."
        ]}
      />

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-pink rounded-xl retro-border shadow-[4px_4px_0_rgba(44,44,36,1)]">
          <Timer className="w-6 h-6 text-brand-ink" />
          <span className="text-2xl font-black text-brand-ink">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-baby-blue rounded-xl retro-border shadow-[4px_4px_0_rgba(44,44,36,1)]">
          <Target className="w-6 h-6 text-brand-ink" />
          <span className="text-2xl font-black text-brand-ink">{hits} Hits</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative bg-brand-cream/50 rounded-[32px] border-2 border-dashed border-brand-olive/20 overflow-hidden cursor-crosshair"
      >
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-serif">Quick Reflexes</h3>
                <p className="text-brand-ink/60">Tap the green targets as fast as you can!</p>
              </div>
              <button onClick={startGame} className="btn-primary">
                Start Exercise
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.button
              key="target"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleHit}
              style={{ 
                left: targetPos.x, 
                top: targetPos.y,
                position: 'absolute',
                transform: 'translate(-50%, -50%)'
              }}
              className="w-24 h-24 bg-brand-atomic rounded-full shadow-2xl border-4 border-brand-ink flex items-center justify-center group active:scale-90 transition-transform"
            >
              <div className="w-12 h-12 bg-white/40 rounded-full animate-ping" />
            </motion.button>
          )}

          {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6"
            >
              <h3 className="text-4xl font-serif">Time's Up!</h3>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-5xl font-bold text-brand-olive">{hits}</p>
                  <p className="text-xs uppercase font-bold text-brand-ink/40">Total Hits</p>
                </div>
              </div>
              <p className="text-brand-ink/60 max-w-xs">
                {hits > 10 ? "Excellent speed!" : hits > 5 ? "Good job!" : "Keep practicing to improve your speed."}
              </p>
              <button onClick={startGame} className="btn-secondary">
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
