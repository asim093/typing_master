import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';

interface ModelLoadingOverlayProps {
  /**
   * 'overlay' blocks the screen (fine on a static preview screen with nothing
   * else to look at). 'badge' is a small non-blocking corner indicator — use
   * this anywhere gameplay is already happening underneath (the Suspense
   * fallback already renders a playable low-poly stand-in instantly, so
   * there's nothing to actually wait for; a full-screen block there just
   * makes an already-running fight look frozen).
   */
  variant?: 'overlay' | 'badge';
}

export default function ModelLoadingOverlay({ variant = 'overlay' }: ModelLoadingOverlayProps) {
  const { active, progress } = useProgress();

  if (variant === 'badge') {
    return (
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-4 right-4 z-40 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm"
          >
            <span className="w-3 h-3 rounded-full border-2 border-violet-300/40 border-t-violet-300 animate-spin shrink-0" />
            <span className="text-[10px] font-mono-game text-white/50 tabular-nums whitespace-nowrap">
              Enhancing visuals {Math.round(progress)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 pointer-events-none"
        >
          <div className="text-shimmer text-2xl font-black mb-4">Loading Warriors...</div>
          <div className="w-72 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
          <div className="mt-2 text-xs text-white/40 font-mono-game">{Math.round(progress)}%</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
