import { motion, AnimatePresence } from 'framer-motion';

const FLAME_TIERS = ['', '🔥', '🔥', '⚡', '⚡', '💥'];

function tierFor(combo: number) {
  if (combo >= 50) return 5;
  if (combo >= 30) return 4;
  if (combo >= 20) return 3;
  if (combo >= 10) return 2;
  if (combo >= 5) return 1;
  return 0;
}

export default function ComboMeter({ combo }: { combo: number }) {
  if (combo < 2) return null;
  const heat = Math.min(1, combo / 50);
  const tier = tierFor(combo);
  const progressInTier = combo % 10;
  const color = heat > 0.7 ? '#f87171' : heat > 0.35 ? '#fb923c' : '#fdba74';

  return (
    <div className="pointer-events-none flex flex-col items-center gap-1">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={combo}
          initial={{ scale: 1.5, opacity: 0, y: -8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full border-2 font-mono-game font-black"
          style={{
            borderColor: color,
            background: `linear-gradient(180deg, ${color}33, ${color}11)`,
            boxShadow: `0 0 ${14 + heat * 26}px ${color}aa, inset 0 0 12px ${color}22`,
          }}
        >
          {tier > 0 && (
            <motion.span
              key={`icon-${tier}`}
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-xl leading-none"
            >
              {FLAME_TIERS[tier]}
            </motion.span>
          )}
          <span className="text-2xl leading-none" style={{ color }}>
            {combo}
            <span className="text-base align-top ml-0.5">x</span>
          </span>
        </motion.div>
      </AnimatePresence>
      <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${(progressInTier || 10) * 10}%` }}
          transition={{ ease: 'easeOut', duration: 0.25 }}
        />
      </div>
    </div>
  );
}
