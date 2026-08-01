import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../utils/motion';

interface Flash {
  id: number;
  color: string;
  edge: boolean;
}

interface HitFlashOverlayProps {
  enemyHitSeed: number;
  enemyHitCrit: boolean;
  playerHitSeed: number;
  playerHitSpecial: boolean;
}

let flashId = 0;

export default function HitFlashOverlay({
  enemyHitSeed,
  enemyHitCrit,
  playerHitSeed,
  playerHitSpecial,
}: HitFlashOverlayProps) {
  const [flash, setFlash] = useState<Flash | null>(null);
  const lastEnemy = useRef(enemyHitSeed);
  const lastPlayer = useRef(playerHitSeed);

  useEffect(() => {
    if (lastEnemy.current === enemyHitSeed) return;
    lastEnemy.current = enemyHitSeed;
    if (prefersReducedMotion()) return;
    const id = ++flashId;
    setFlash({ id, color: enemyHitCrit ? '#fde047' : '#e879f9', edge: false });
    const t = window.setTimeout(() => setFlash((f) => (f?.id === id ? null : f)), enemyHitCrit ? 220 : 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyHitSeed]);

  useEffect(() => {
    if (lastPlayer.current === playerHitSeed) return;
    lastPlayer.current = playerHitSeed;
    if (prefersReducedMotion()) return;
    const id = ++flashId;
    setFlash({ id, color: '#ef4444', edge: true });
    const t = window.setTimeout(() => setFlash((f) => (f?.id === id ? null : f)), playerHitSpecial ? 260 : 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerHitSeed]);

  if (!flash) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={
        flash.edge
          ? {
              boxShadow: `inset 0 0 140px 20px ${flash.color}99`,
              background: `radial-gradient(circle at center, transparent 40%, ${flash.color}22 100%)`,
            }
          : { background: `${flash.color}22` }
      }
    />
  );
}
