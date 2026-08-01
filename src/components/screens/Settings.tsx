import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { playSfx } from '../../game/audio';
import type { GameScreen } from '../../types';

interface SettingsProps {
  onBack: () => void;
  onNavigate: (screen: GameScreen) => void;
}

const APP_VERSION = '1.0.0';

export default function Settings({ onBack, onNavigate }: SettingsProps) {
  const muted = usePlayerStore((s) => s.muted);
  const toggleMuted = usePlayerStore((s) => s.toggleMuted);
  const resetProgress = usePlayerStore((s) => s.resetProgress);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-white/50 hover:text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 rounded"
      >
        ← Back
      </button>
      <h2 className="text-3xl font-black mb-8 text-white/90">Settings</h2>

      <div className="max-w-md w-full flex flex-col gap-3">
        <section className="panel rounded-xl p-4">
          <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Audio</h3>
          <button
            onClick={() => {
              toggleMuted();
              playSfx('uiClick');
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
          >
            <span className="text-sm font-semibold text-white/90">Sound Effects &amp; Music</span>
            <span className="text-lg">{muted ? '🔇' : '🔊'}</span>
          </button>
        </section>

        <section className="panel rounded-xl p-4">
          <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Help</h3>
          <button
            onClick={() => onNavigate('howToPlay')}
            className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
          >
            How to Play →
          </button>
        </section>

        <section className="panel rounded-xl p-4 border-red-500/20">
          <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">Danger Zone</h3>
          <button
            onClick={() => setConfirming(true)}
            className="w-full px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors text-sm font-semibold text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
          >
            Reset All Progress
          </button>
        </section>

        <p className="text-center text-white/25 text-xs mt-2 font-mono-game">TypeQuest v{APP_VERSION}</p>
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="panel rounded-2xl p-6 max-w-sm w-full text-center border-red-500/30"
            >
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">Reset everything?</h3>
              <p className="text-sm text-white/50 mb-6">
                This permanently deletes your level, XP, coins, unlocks, and records. This cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    resetProgress();
                    setConfirming(false);
                  }}
                  className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 transition-colors font-bold text-white text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-5 py-2.5 rounded-full border border-white/15 text-white/70 hover:text-white transition-colors font-semibold text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
