import { useEffect, useState } from 'react';
import HealthBar from './HealthBar';
import type { EnemyRuntime } from '../../game/useCombatEngine';
import type { BossStatus } from '../../data/enemies';
import type { World } from '../../types';
import { xpToNextLevel } from '../../game/combat';

interface HUDProps {
  world: World;
  level: number;
  xp: number;
  coins: number;
  playerHp: number;
  playerMaxHp: number;
  enemy: EnemyRuntime | null;
  wpm: number;
  accuracy: number;
  bossStatus?: BossStatus;
  runEnemiesDefeated: number;
  runStartTime: number;
  onExit: () => void;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function HUD({
  world,
  level,
  xp,
  coins,
  playerHp,
  playerMaxHp,
  enemy,
  wpm,
  accuracy,
  bossStatus,
  runEnemiesDefeated,
  runStartTime,
  onExit,
}: HUDProps) {
  const xpNeeded = xpToNextLevel(level);
  const xpPct = Math.min(100, (xp / xpNeeded) * 100);
  const lowHp = playerHp / playerMaxHp < 0.3;

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setElapsed(performance.now() - runStartTime), 1000);
    return () => window.clearInterval(id);
  }, [runStartTime]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-3 md:p-5">
      <div className="flex items-start justify-between gap-3">
        {/* Player panel */}
        <div className="hud-panel rounded-xl px-3.5 py-2.5 w-60 md:w-64 pointer-events-auto" style={{ borderTopColor: 'rgba(167,139,250,0.55)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 border border-white/20">
              {level}
            </div>
            <HealthBar hp={playerHp} maxHp={playerMaxHp} color={lowHp ? '#f87171' : '#4ade80'} />
          </div>
          <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                xpPct >= 90 ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-violet-500 to-fuchsia-400'
              }`}
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono-game text-white/40 tabular-nums">
            <span className="flex items-center gap-2">
              <span className="text-sky-300/90">{wpm} WPM</span>
              <span className="text-emerald-300/90">{accuracy}% ACC</span>
            </span>
            <span className="text-amber-300/80">🪙{coins}</span>
          </div>
        </div>

        {/* Center: exit + boss + run stats */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button
            onClick={onExit}
            className="pointer-events-auto hud-panel rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
          >
            Exit
          </button>
          {bossStatus && bossStatus.state !== 'defeated' && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono-game font-bold border whitespace-nowrap ${
                bossStatus.state === 'available'
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-300 animate-pulse'
                  : 'bg-black/40 border-white/10 text-white/40'
              }`}
            >
              {bossStatus.state === 'available' ? '👑 Boss Available' : `👑 Boss in ${bossStatus.levelsAway} lvl${bossStatus.levelsAway === 1 ? '' : 's'}`}
            </span>
          )}
          <div className="hidden md:flex items-center gap-2 text-[9px] font-mono-game text-white/30 tabular-nums">
            <span>{runEnemiesDefeated} defeated</span>
            <span>·</span>
            <span>{formatElapsed(elapsed)}</span>
          </div>
        </div>

        {/* Enemy panel */}
        <div
          className={`hud-panel rounded-xl px-3.5 py-2.5 w-60 md:w-64 pointer-events-auto ${enemy?.isBoss ? 'border-rose-400/50' : ''}`}
          style={{ borderTopColor: enemy?.isBoss ? 'rgba(248,113,113,0.65)' : 'rgba(244,114,182,0.5)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            {enemy?.isBoss && <span className="text-sm shrink-0">👑</span>}
            <span className="font-bold text-sm text-white/90 truncate flex-1 text-right">{enemy?.name ?? '—'}</span>
          </div>
          <HealthBar
            hp={enemy?.hp ?? 0}
            maxHp={enemy?.maxHp ?? 1}
            color={enemy?.isBoss ? '#f87171' : '#f472b6'}
            reverse
            boss={enemy?.isBoss}
          />
        </div>
      </div>
      <div className="md:hidden mt-1.5 flex justify-center">
        <div className="flex items-center gap-2 text-[9px] font-mono-game text-white/30 tabular-nums">
          <span>{runEnemiesDefeated} defeated</span>
          <span>·</span>
          <span>{formatElapsed(elapsed)}</span>
          <span>·</span>
          <span>{world.name}</span>
        </div>
      </div>
    </div>
  );
}
