import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CheckCircle2, XCircle, RefreshCw, Loader2, HelpCircle } from 'lucide-react';
import { generateNamingQuestion } from '../services/gemini';
import HelpModal from './HelpModal';
import { soundService } from '../services/sound';

export default function NamingTest({ onComplete }: { onComplete: (score: number) => void }) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<{ description: string; options: string[]; correctAnswer: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    soundService.playTap();
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    try {
      const data = await generateNamingQuestion();
      setQuestion(data);
    } catch (e) {
      setQuestion({
        description: "A tool used to drive nails into wood.",
        options: ["Hammer", "Screwdriver", "Wrench", "Pliers"],
        correctAnswer: "Hammer"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === question?.correctAnswer;
    if (correct) {
      soundService.playCorrect();
    } else {
      soundService.playError();
    }
    setIsCorrect(correct);
    onComplete(correct ? 1 : 0);
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
        title="Word Finding"
        instructions={[
          "Read the description of the object carefully.",
          "Look at the four options provided below.",
          "Tap the word that matches the description.",
          "This helps with naming and vocabulary recall."
        ]}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-brand-olive animate-spin" />
            <p className="text-brand-ink/60 italic">Finding a word for you...</p>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl space-y-6"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-brand-baby-blue rounded-full flex items-center justify-center mx-auto retro-border shadow-md">
                <Search className="w-10 h-10 text-brand-ink" />
              </div>
              <h3 className="text-4xl font-serif leading-tight font-bold italic uppercase tracking-tighter">
                "{question?.description}"
              </h3>
              <p className="text-xl text-brand-ink/70 italic">What is this object called?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question?.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={!!selected}
                  className={`p-6 rounded-2xl border-4 text-2xl font-black uppercase italic transition-all ${
                    selected === option
                      ? isCorrect 
                        ? 'bg-emerald-500 border-brand-ink text-white shadow-lg scale-105'
                        : 'bg-brand-clay border-brand-ink text-white shadow-lg scale-105'
                      : selected && option === question.correctAnswer
                        ? 'bg-emerald-50 border-brand-ink text-emerald-700'
                        : 'bg-white border-brand-ink text-brand-ink hover:bg-brand-mint/20 shadow-[4px_4px_0_rgba(44,44,36,0.1)]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-brand-clay" />
                  )}
                  <p className={`text-xl font-bold ${isCorrect ? 'text-emerald-600' : 'text-brand-clay'}`}>
                    {isCorrect ? "That's correct!" : `Not quite. It's a ${question?.correctAnswer}.`}
                  </p>
                </div>
                <button onClick={loadQuestion} className="btn-secondary mx-auto">
                  <RefreshCw className="w-5 h-5" />
                  Next Word
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
