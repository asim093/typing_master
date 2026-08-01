import { AnimatePresence, motion } from 'framer-motion';
import type { FloatingDamage } from '../../types';

interface FloatingDamageLayerProps {
  damages: FloatingDamage[];
}

// A hard dark outline in every direction, so a number stays legible whether
// it lands over a bright neon sign or a black cave wall. Cheaper and
// sharper than a blur halo, which washed out against light backdrops.
const OUTLINE = '-2px 0 0 rgba(0,0,0,0.85), 2px 0 0 rgba(0,0,0,0.85), 0 -2px 0 rgba(0,0,0,0.85), 0 2px 0 rgba(0,0,0,0.85)';

export default function FloatingDamageLayer({ damages }: FloatingDamageLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {damages.map((d) => {
          const isCrit = d.crit && d.target === 'enemy';
          // Deterministic per-hit variation from the id, so stacked hits
          // fan out instead of printing on top of each other.
          const drift = ((d.id * 37) % 40) - 20;
          const tilt = isCrit ? ((d.id * 13) % 14) - 7 : ((d.id * 7) % 8) - 4;

          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10, scale: 0.4, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                // Overshoot then settle — the snap on the first frames is
                // what makes a hit feel like it landed rather than faded in.
                scale: isCrit ? [0.4, 1.75, 1.3, 1.2] : [0.5, 1.25, 1, 0.95],
                y: [10, -34, -66, -104],
                x: [0, drift * 0.35, drift * 0.75, drift],
                rotate: [0, tilt, tilt * 0.6, tilt * 0.3],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: isCrit ? 1.25 : 1.0,
                ease: 'easeOut',
                times: [0, 0.16, 0.5, 1],
              }}
              className={`absolute font-mono-game font-extrabold whitespace-nowrap ${
                d.target === 'enemy'
                  ? isCrit
                    ? 'text-4xl sm:text-5xl'
                    : 'text-2xl sm:text-3xl text-fuchsia-200'
                  : 'text-2xl sm:text-3xl text-red-400'
              }`}
              style={{
                left: d.target === 'enemy' ? `calc(62% + ${d.x}px)` : `calc(32% + ${d.x}px)`,
                top: '38%',
                // Crits get a hot gold gradient fill plus a bloom, so they
                // read as a different class of event at a glance.
                ...(isCrit
                  ? {
                      backgroundImage: 'linear-gradient(180deg,#fffbeb 0%,#fcd34d 45%,#f59e0b 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      filter: 'drop-shadow(0 0 10px rgba(252,211,77,0.95)) drop-shadow(0 2px 2px rgba(0,0,0,0.8))',
                    }
                  : { textShadow: OUTLINE }),
              }}
            >
              {d.target === 'player' ? '-' : ''}
              {d.value}
              {isCrit && <span className="ml-1 text-base sm:text-lg align-top tracking-wider">CRIT!</span>}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
