import { motion } from 'framer-motion';
import type { EnemyRuntime } from '../../game/useCombatEngine';

interface BossIntroOverlayProps {
  boss: EnemyRuntime;
  worldAccent: string;
  onFight: () => void;
}

export default function BossIntroOverlay({ boss, worldAccent, onFight }: BossIntroOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.1 }}
        className="text-center"
      >
        <div className="text-sm tracking-[0.4em] uppercase text-rose-400 font-bold mb-3">Boss Battle</div>
        <h1
          className="text-6xl md:text-7xl font-black mb-2"
          style={{ color: worldAccent, textShadow: `0 0 40px ${worldAccent}88` }}
        >
          {boss.name}
        </h1>
        <p className="text-white/60 text-lg mb-10 italic">{boss.title}</p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onFight}
          className="btn-glow px-10 py-3 rounded-full bg-gradient-to-r from-rose-600 to-fuchsia-600 font-bold text-lg tracking-wide"
        >
          Engage
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
