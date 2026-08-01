import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WordDisplayProps {
  word: string;
  typed: string;
  wordStart: React.MutableRefObject<number>;
  wordDeadline: React.MutableRefObject<number>;
  active: boolean;
}

export default function WordDisplay({ word, typed, wordStart, wordDeadline, active }: WordDisplayProps) {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!active) return;
    let raf: number;
    const loop = () => {
      const total = wordDeadline.current - wordStart.current;
      const remaining = wordDeadline.current - performance.now();
      setProgress(total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, word, wordStart, wordDeadline]);

  const mistake = !word.startsWith(typed.slice(0, word.length)) || typed.length > word.length;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xl">
      <div className="relative w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: progress < 0.3 ? '#f87171' : '#c084fc',
            boxShadow: '0 0 8px rgba(192,132,252,0.8)',
          }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: 'linear', duration: 0.1 }}
        />
      </div>

      <motion.div
        key={word}
        initial={{ scale: 0.85, opacity: 0, y: -6 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`font-mono-game text-4xl md:text-5xl font-bold tracking-wide select-none px-8 py-3 rounded-2xl panel ${mistake ? 'animate-pulse' : ''}`}
      >
        {word.split('').map((ch, i) => {
          const typedCh = typed[i];
          let className = 'text-white/75';
          if (typedCh !== undefined) {
            className =
              typedCh === ch
                ? 'text-emerald-400'
                : 'text-rose-500 underline decoration-2 underline-offset-4';
          }
          return (
            <span key={i} className={className}>
              {ch}
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}
