import { motion } from 'framer-motion';

interface DefeatOverlayProps {
  wordsTyped: number;
  wpm: number;
  accuracy: number;
  onRetry: () => void;
  onExit: () => void;
}

export default function DefeatOverlay({ wordsTyped, wpm, accuracy, onRetry, onExit }: DefeatOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14 }}
        className="text-center panel rounded-2xl px-12 py-10"
      >
        <h1 className="text-4xl font-black text-red-400 mb-2">You Have Fallen</h1>
        <p className="text-white/50 mb-6">Your typing faltered and the enemy overwhelmed you.</p>
        <div className="flex gap-6 justify-center mb-8 text-sm font-mono-game text-white/70">
          <div>
            <div className="text-2xl font-bold text-white">{wordsTyped}</div>
            <div className="text-white/40">words</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{wpm}</div>
            <div className="text-white/40">wpm</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
            <div className="text-white/40">accuracy</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="btn-glow px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 font-bold"
          >
            Retry
          </button>
          <button
            onClick={onExit}
            className="px-6 py-2.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors font-semibold"
          >
            Main Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
