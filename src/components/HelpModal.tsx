import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  instructions: string[];
}

export default function HelpModal({ isOpen, onClose, title, instructions }: HelpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-brand-olive/5 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-brand-ink/40" />
            </button>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-olive/10 rounded-2xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-brand-olive" />
                </div>
                <h3 className="text-2xl font-serif font-bold">{title} Instructions</h3>
              </div>
              
              <ul className="space-y-4">
                {instructions.map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-brand-olive text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-brand-ink/70 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ul>
              
              <button onClick={onClose} className="btn-primary w-full mt-4">
                Got it, let's start!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
