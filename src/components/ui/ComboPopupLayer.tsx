import { AnimatePresence, motion } from 'framer-motion';
import type { ComboPopup } from '../../game/useCombatEngine';

const STYLES: Record<ComboPopup['kind'], { color: string; size: string; glow: string }> = {
  critical: { color: '#fde047', size: 'text-5xl', glow: '0 0 30px rgba(253,224,71,0.8)' },
  perfect: { color: '#4ade80', size: 'text-4xl', glow: '0 0 26px rgba(74,222,128,0.8)' },
  combo: { color: '#38bdf8', size: 'text-4xl', glow: '0 0 26px rgba(56,189,248,0.8)' },
  bossDefeat: { color: '#f87171', size: 'text-6xl', glow: '0 0 40px rgba(248,113,113,0.9)' },
  best: { color: '#f0abfc', size: 'text-3xl', glow: '0 0 26px rgba(240,171,252,0.85)' },
};

export default function ComboPopupLayer({ popups }: { popups: ComboPopup[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
      <AnimatePresence>
        {popups.map((p, i) => {
          const style = STYLES[p.kind];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.4, y: 10 + i * 6 }}
              animate={{ opacity: 1, scale: 1.05, y: -20 - i * 6 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ type: 'spring', stiffness: 320, damping: 16 }}
              className={`absolute font-mono-game font-black tracking-widest ${style.size}`}
              style={{ color: style.color, textShadow: style.glow }}
            >
              {p.text}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
