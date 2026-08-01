import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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

// useProgress() reads THREE's DefaultLoadingManager, but a React.lazy()
// component's dynamic import() resolves *before* useGLTF ever registers
// with that manager — so `active` can read false for a brief moment right
// at mount even though the real model hasn't loaded yet. On a first visit
// (nothing cached) that gap let the low-poly Suspense fallback show
// uncovered, then the real model would swap in abruptly — this holds the
// overlay up through that gap regardless of what `active` says yet.
const MOUNT_GRACE_MS = 500;

export default function ModelLoadingOverlay({ variant = 'overlay' }: ModelLoadingOverlayProps) {
  const { active, progress } = useProgress();
  const [inGracePeriod, setInGracePeriod] = useState(true);
  const mountedAtRef = useRef(performance.now());

  useEffect(() => {
    const elapsed = performance.now() - mountedAtRef.current;
    const t = window.setTimeout(() => setInGracePeriod(false), Math.max(0, MOUNT_GRACE_MS - elapsed));
    return () => window.clearTimeout(t);
  }, []);

  const show = active || inGracePeriod;

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
      {show && (
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
