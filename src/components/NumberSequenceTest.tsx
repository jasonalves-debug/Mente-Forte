import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, CheckCircle2, XCircle, RefreshCw, HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';
import { soundService } from '../services/sound';

export default function NumberSequenceTest({ onComplete }: { onComplete: (score: number) => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'input' | 'result'>('memorize');
  const [level, setLevel] = useState(3); // Start with 3 digits
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showDigit, setShowDigit] = useState<number | null>(null);
  const [digitIndex, setDigitIndex] = useState(0);

  useEffect(() => {
    startLevel(3);
  }, []);

  const startLevel = (l: number) => {
    const newSequence = Array.from({ length: l }, () => Math.floor(Math.random() * 10));
    setSequence(newSequence);
    setUserInput([]);
    setDigitIndex(0);
    setPhase('memorize');
    playSequence(newSequence);
  };

  const playSequence = async (seq: number[]) => {
    for (let i = 0; i < seq.length; i++) {
      setShowDigit(seq[i]);
      soundService.playTap();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowDigit(null);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    setPhase('input');
  };

  const handleNumberClick = (num: number) => {
    if (phase !== 'input') return;
    soundService.playTap();
    const newInput = [...userInput, num];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      const isCorrect = newInput.every((val, index) => val === sequence[index]);
      if (isCorrect) {
        soundService.playCorrect();
        if (level < 6) {
          setTimeout(() => {
            setLevel(level + 1);
            startLevel(level + 1);
          }, 1000);
        } else {
          setPhase('result');
          onComplete(1);
        }
      } else {
        soundService.playError();
        setPhase('result');
        onComplete(0);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 relative">
      <button 
        onClick={() => setIsHelpOpen(true)}
        className="absolute top-0 right-0 p-2 text-brand-ink/40 hover:text-brand-ink transition-colors"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Number Sequence"
        instructions={[
          "Watch the numbers as they appear one by one.",
          "Try to remember the order of the numbers.",
          "Once they disappear, tap the numbers in the same order.",
          "This helps with short-term memory and concentration."
        ]}
      />

      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-brand-baby-blue rounded-full flex items-center justify-center mx-auto retro-border shadow-md">
            <Hash className="w-10 h-10 text-brand-ink" />
          </div>
          <h3 className="text-4xl font-serif font-bold italic uppercase tracking-tighter">
            {phase === 'memorize' ? "Watch Carefully" : phase === 'input' ? "Repeat the Sequence" : "Level Complete"}
          </h3>
          <p className="text-xl text-brand-ink/70 italic">
            {phase === 'memorize' ? "Remember the numbers shown below." : phase === 'input' ? `Enter the ${sequence.length} numbers you saw.` : ""}
          </p>
        </div>

        <div className="min-h-[160px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'memorize' && (
              <motion.div
                key={showDigit ?? 'empty'}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-9xl font-black text-brand-atomic italic drop-shadow-lg"
              >
                {showDigit !== null ? showDigit : ""}
              </motion.div>
            )}

            {phase === 'input' && (
              <div className="flex gap-3">
                {sequence.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-12 h-16 rounded-xl border-4 flex items-center justify-center text-3xl font-black ${
                      i < userInput.length ? 'bg-brand-mint border-brand-ink' : 'bg-white border-brand-ink/10'
                    }`}
                  >
                    {i < userInput.length ? userInput[i] : ""}
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {phase === 'input' && (
          <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="w-full aspect-square bg-white border-4 border-brand-ink rounded-2xl text-3xl font-black italic hover:bg-brand-mint/20 active:scale-95 transition-all shadow-[4px_4px_0_rgba(44,44,36,0.1)]"
              >
                {num}
              </button>
            ))}
          </div>
        )}

        {phase === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {level >= 6 ? (
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
            ) : (
              <XCircle className="w-20 h-20 text-brand-clay mx-auto" />
            )}
            <div className="space-y-2">
              <h3 className="text-4xl font-serif">{level >= 6 ? "Fantastic!" : "Good Try!"}</h3>
              <p className="text-brand-ink/60">You reached Level {level}</p>
            </div>
            <button onClick={() => startLevel(3)} className="btn-secondary mx-auto">
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
