import { motion } from 'framer-motion';

interface SessionSummaryOverlayProps {
  xpEarned: number;
  coinsEarned: number;
  accuracy: number;
  wpm: number;
  crits: number;
  bestCombo: number;
  wordsTyped: number;
  enemiesDefeated: number;
  unlocks: string[];
  elapsedMs: number;
  onContinue: () => void;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

const stats = (p: SessionSummaryOverlayProps) => [
  { label: 'XP Earned', value: `+${p.xpEarned}`, color: '#c084fc' },
  { label: 'Coins Earned', value: `+${p.coinsEarned}`, color: '#fbbf24' },
  { label: 'Accuracy', value: `${p.accuracy}%`, color: '#4ade80' },
  { label: 'WPM', value: `${p.wpm}`, color: '#38bdf8' },
  { label: 'Critical Hits', value: `${p.crits}`, color: '#fde047' },
  { label: 'Best Combo', value: `${p.bestCombo}x`, color: '#fb923c' },
  { label: 'Words Typed', value: `${p.wordsTyped}`, color: '#f472b6' },
  { label: 'Enemies Defeated', value: `${p.enemiesDefeated}`, color: '#a78bfa' },
];

export default function SessionSummaryOverlay(props: SessionSummaryOverlayProps) {
  const { unlocks, elapsedMs, onContinue } = props;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 p-6"
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        className="panel rounded-2xl px-8 py-8 max-w-md w-full text-center"
      >
        <div className="text-xs uppercase tracking-widest text-violet-300/70 font-bold mb-1">Session Summary</div>
        <h1 className="text-3xl font-black text-white mb-1">Well Fought</h1>
        <p className="text-white/40 text-sm mb-6">{formatElapsed(elapsedMs)} of battle</p>

        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {stats(props).map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-left"
            >
              <div className="text-xl font-bold font-mono-game tabular-nums" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-white/40">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {unlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 text-left rounded-lg bg-fuchsia-500/10 border border-fuchsia-400/30 px-4 py-3"
          >
            <div className="text-[10px] uppercase tracking-widest text-fuchsia-300 font-bold mb-1.5">Unlocked this run</div>
            <ul className="text-sm text-white/80 space-y-0.5">
              {unlocks.map((u, i) => (
                <li key={i}>✨ {u}</li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="btn-glow px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
