import { AnimatePresence, motion } from 'framer-motion';
import type { RewardBundle } from '../../types';

const ICONS: Record<string, string> = {
  coin: '🪙',
  crown: '👑',
  skin: '🎨',
  weapon: '⚔️',
  star: '⭐',
};

export default function RewardToast({ rewards }: { rewards: RewardBundle[] }) {
  return (
    <div className="pointer-events-none absolute top-1/3 right-4 md:right-6 z-20 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {rewards.map((bundle) => (
          <motion.div
            key={bundle.id}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="panel rounded-xl px-4 py-3 w-64 border-fuchsia-400/30"
          >
            <div className="text-[10px] uppercase tracking-widest text-fuchsia-300 font-bold mb-1">{bundle.title}</div>
            <div className="flex flex-col gap-1">
              {bundle.lines.map((line) => (
                <div key={line.id} className="flex items-center gap-2 text-sm text-white/85">
                  <span>{ICONS[line.icon] ?? '✨'}</span>
                  <span>{line.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
