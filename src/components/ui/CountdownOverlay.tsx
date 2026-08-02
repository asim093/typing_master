import { AnimatePresence, motion } from 'framer-motion';

interface CountdownOverlayProps {
  /** 3, 2, 1, then 0 for the "FIGHT!" beat. */
  value: number | null;
}

/**
 * Pre-fight countdown. Intentionally does NOT dim the arena — the point of
 * the beat is to let the player take in the enemy they're about to face, so
 * the numbers sit over a fully visible battlefield rather than a scrim.
 *
 * Pointer-events stay off throughout so the tap that opens the mobile
 * keyboard still reaches the input underneath during the count.
 */
export default function CountdownOverlay({ value }: CountdownOverlayProps) {
  const isFight = value === 0;

  return (
    <AnimatePresence mode="wait">
      {value !== null && (
        <motion.div
          key={value}
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <motion.div
            // Numbers punch in oversized and settle; "FIGHT!" keeps growing
            // as it fades so it reads as a release rather than another tick.
            initial={{ scale: isFight ? 0.6 : 2.2, opacity: 0 }}
            animate={{
              scale: isFight ? [0.6, 1.15, 1.35] : [2.2, 1, 0.94],
              opacity: [0, 1, isFight ? 0 : 0.85],
            }}
            transition={{ duration: isFight ? 0.75 : 0.7, times: [0, 0.35, 1], ease: 'easeOut' }}
            className={`font-black tracking-tight select-none ${
              isFight ? 'text-6xl sm:text-8xl' : 'text-8xl sm:text-9xl'
            }`}
            style={{
              backgroundImage: isFight
                ? 'linear-gradient(180deg,#fff7ed 0%,#fbbf24 45%,#ef4444 100%)'
                : 'linear-gradient(180deg,#ffffff 0%,#e9d5ff 50%,#a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: isFight
                ? 'drop-shadow(0 0 26px rgba(251,146,60,0.9)) drop-shadow(0 3px 4px rgba(0,0,0,0.85))'
                : 'drop-shadow(0 0 20px rgba(167,139,250,0.75)) drop-shadow(0 3px 4px rgba(0,0,0,0.85))',
            }}
          >
            {isFight ? 'FIGHT!' : value}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
