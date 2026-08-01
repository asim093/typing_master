import { motion } from 'framer-motion';

interface HealthBarProps {
  hp: number;
  maxHp: number;
  color: string;
  reverse?: boolean;
  boss?: boolean;
}

export default function HealthBar({ hp, maxHp, color, reverse, boss }: HealthBarProps) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const side = reverse ? 'right' : 'left';

  return (
    <div
      className={`relative w-full ${boss ? 'h-5' : 'h-4'} rounded-full bg-black/60 overflow-hidden`}
      style={{
        border: `1px solid ${color}55`,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* lagging "damage trail" ghost bar */}
      <motion.div
        className="absolute inset-y-0 bg-white/25"
        style={{ [side]: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'tween', duration: 0.6, ease: 'easeOut', delay: 0.12 }}
      />
      {/* main bar */}
      <motion.div
        className="absolute inset-y-0"
        style={{
          background: `linear-gradient(${reverse ? '270deg' : '90deg'}, ${color}, ${color}bb)`,
          [side]: 0,
          boxShadow: `0 0 10px ${color}cc`,
        }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1/2 opacity-40"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)' }}
        />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono-game font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        {Math.ceil(hp)} / {maxHp}
      </div>
    </div>
  );
}
