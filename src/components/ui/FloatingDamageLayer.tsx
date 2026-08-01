import { AnimatePresence, motion } from 'framer-motion';
import type { FloatingDamage } from '../../types';

interface FloatingDamageLayerProps {
  damages: FloatingDamage[];
}

export default function FloatingDamageLayer({ damages }: FloatingDamageLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {damages.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 0, scale: d.crit ? 0.6 : 0.8 }}
            animate={{ opacity: 1, y: -90, scale: d.crit ? 1.4 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: 'easeOut' }}
            className={`absolute font-mono-game font-extrabold ${
              d.target === 'enemy'
                ? d.crit
                  ? 'text-amber-300 text-4xl'
                  : 'text-fuchsia-300 text-2xl'
                : 'text-red-400 text-2xl'
            }`}
            style={{
              left: d.target === 'enemy' ? `calc(62% + ${d.x}px)` : `calc(32% + ${d.x}px)`,
              top: '38%',
              textShadow: d.crit ? '0 0 16px rgba(252,211,77,0.9)' : '0 0 8px rgba(0,0,0,0.6)',
            }}
          >
            {d.target === 'player' ? '-' : ''}
            {d.value}
            {d.crit && <span className="ml-1 text-sm align-top">CRIT</span>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
