import { AnimatePresence, motion } from 'framer-motion';
import type { AchievementToast } from '../../types';

export default function AchievementToastLayer({ toasts }: { toasts: AchievementToast[] }) {
  return (
    <div className="pointer-events-none fixed top-6 right-6 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="panel rounded-xl px-4 py-3 w-72 border-amber-400/40"
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
