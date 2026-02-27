import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCw, HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';
import { soundService } from '../services/sound';

const WORD_LIST = [
  'Apple', 'Table', 'Penny', 'Lemon', 'Clock',
  'River', 'House', 'Bread', 'Chair', 'Cloud',
  'Grass', 'Book', 'Phone', 'Lamp', 'Shirt'
];

export default function MemoryTest({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<'study' | 'recall' | 'result'>('study');
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (phase === 'study') {
      const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
      const selectedWords = shuffled.slice(0, 5);
      setTargetWords(selectedWords);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            startRecall(selectedWords);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const startRecall = (targets: string[]) => {
    setPhase('recall');
    const distractors = WORD_LIST.filter(w => !targets.includes(w))
      .sort(() => 0.5 - Math.random())
      .slice(0, 7);
    const allOptions = [...targets, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
  };

  const toggleWord = (word: string) => {
    soundService.playTap();
    if (selected.includes(word)) {
      setSelected(selected.filter(w => w !== word));
    } else if (selected.length < 5) {
      setSelected([...selected, word]);
    }
  };

  const handleSubmit = () => {
    const correctCount = selected.filter(w => targetWords.includes(w)).length;
    if (correctCount === 5) {
      soundService.playCorrect();
    } else {
      soundService.playError();
    }
    setPhase('result');
    onComplete(correctCount === 5 ? 1 : 0);
  };

  const reset = () => {
    soundService.playTap();
    setPhase('study');
    setTargetWords([]);
    setSelected([]);
    setTimeLeft(10);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 relative">
      <button 
        onClick={() => setIsHelpOpen(true)}
        className="absolute top-0 right-0 p-2 text-brand-olive/40 hover:text-brand-olive transition-colors"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Memory Practice"
        instructions={[
          "Read the words on the screen carefully.",
          "Try to memorize them before the timer runs out.",
          "When the list disappears, pick the same words from the new list.",
          "This exercise helps with short-term memory and focus."
        ]}
      />

      <AnimatePresence mode="wait">
        {phase === 'study' && (
          <motion.div
            key="study"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h3 className="text-3xl font-serif font-bold italic uppercase tracking-tighter">Remember these words</h3>
              <p className="text-xl text-brand-ink/70 italic">You have {timeLeft} seconds...</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {targetWords.map((word, i) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-6 py-4 bg-brand-baby-blue border-4 border-brand-ink rounded-2xl text-3xl font-black text-brand-ink shadow-[4px_4px_0_rgba(44,44,36,0.1)] italic uppercase"
                >
                  {word}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'recall' && (
          <motion.div
            key="recall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 w-full max-w-lg"
          >
            <div className="space-y-2">
              <h3 className="text-3xl font-serif font-bold italic uppercase tracking-tighter">Which words did you see?</h3>
              <p className="text-xl text-brand-ink/70 italic">Select 5 words from the list below.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {options.map((word) => (
                <button
                  key={word}
                  onClick={() => toggleWord(word)}
                  className={`px-4 py-3 rounded-xl border-4 transition-all text-xl font-black uppercase italic ${
                    selected.includes(word)
                      ? 'bg-brand-turquoise border-brand-ink text-brand-ink shadow-lg scale-105'
                      : 'bg-white border-brand-ink/10 text-brand-ink hover:bg-brand-mint/20 shadow-sm'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
            <button
              disabled={selected.length < 5}
              onClick={handleSubmit}
              className="btn-primary w-full py-6 text-xl font-black uppercase italic disabled:opacity-50 disabled:scale-100"
            >
              Check My Answers
            </button>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              {selected.filter(w => targetWords.includes(w)).length === 5 ? (
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                  <h3 className="text-4xl font-serif">Perfect Score!</h3>
                  <p className="text-brand-ink/60">Your memory is sharp today.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <XCircle className="w-20 h-20 text-brand-clay" />
                  <h3 className="text-4xl font-serif">Good Effort!</h3>
                  <p className="text-brand-ink/60">
                    You got {selected.filter(w => targetWords.includes(w)).length} out of 5.
                    Practice makes perfect!
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <button onClick={reset} className="btn-secondary">
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
