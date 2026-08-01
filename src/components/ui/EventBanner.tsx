import { AnimatePresence, motion } from 'framer-motion';
import type { CombatEvent } from '../../game/useCombatEngine';

const KIND_STYLES: Record<CombatEvent['kind'], string> = {
  levelup: 'text-amber-300 border-amber-400/40 bg-amber-500/10',
  boss: 'text-rose-300 border-rose-400/40 bg-rose-500/10',
  achievement: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10',
  victory: 'text-purple-200 border-purple-400/30 bg-purple-500/10',
  special: 'text-sky-300 border-sky-400/40 bg-sky-500/10',
};

export default function EventBanner({ events }: { events: CombatEvent[] }) {
  return (
    <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
      <AnimatePresence>
        {events.map((e) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className={`px-4 py-1.5 rounded-full border text-sm font-semibold backdrop-blur-sm ${KIND_STYLES[e.kind]}`}
          >
            {e.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
