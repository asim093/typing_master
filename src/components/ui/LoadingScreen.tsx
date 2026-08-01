import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import ScreenBackground from './ScreenBackground';
import { LOADING_TIPS } from '../../data/loadingTips';

const TIP_INTERVAL_MS = 3400;

export default function LoadingScreen() {
  const { progress } = useProgress();
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * LOADING_TIPS.length));

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, TIP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="absolute inset-0 z-50 isolate overflow-hidden flex flex-col items-center justify-between py-14 md:py-20"
    >
      <ScreenBackground overlayStrength="heavy" />

      <div />

      <div className="flex flex-col items-center gap-4">
        <h1 className="text-gold-shimmer text-4xl md:text-6xl font-black tracking-tight leading-none">TypeQuest</h1>
        <div className="w-8 h-8 rounded-full border-2 border-amber-200/25 border-t-amber-200 animate-spin" />
      </div>

      <div className="w-full max-w-md px-6 flex flex-col items-center gap-3">
        <div className="min-h-[2.75rem] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-center text-sm text-amber-50/85"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
            >
              <span className="text-amber-300/90 font-semibold">Tip · </span>
              {LOADING_TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="relative w-full h-2 rounded-full bg-white/10 overflow-hidden border border-amber-200/20">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
            style={{ boxShadow: '0 0 10px rgba(251,191,36,0.7)' }}
          />
        </div>
        <span className="text-[11px] font-mono-game text-amber-100/50 tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
    </motion.div>
  );
}
