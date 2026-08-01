import { AnimatePresence, motion } from 'framer-motion';
import type { AchievementToast } from '../../types';

export default function AchievementToastLayer({ toasts }: { toasts: AchievementToast[] }) {
  return (
    // Bottom-anchored on phones: at top-right it sat directly over the title
    // and HUD on a narrow screen, since a toast is near full-width there.
    <div
      className="pointer-events-none fixed bottom-4 left-3 right-3 sm:bottom-auto sm:left-auto sm:top-6 sm:right-6 z-50 flex flex-col gap-2 items-stretch sm:items-end"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="panel rounded-xl px-4 py-3 w-full sm:w-72 border-amber-400/40"
          >
            <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-0.5">
              Achievement Unlocked
            </div>
            <div className="font-bold text-white">{t.achievement.name}</div>
            <div className="text-xs text-white/50">{t.achievement.description}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
