import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';

export default function ModelLoadingOverlay() {
  const { active, progress, item } = useProgress();
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
          <div className="mt-1 text-[10px] text-white/25 truncate max-w-xs">{item}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
