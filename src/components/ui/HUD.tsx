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

  // Level-flow readout: how far off the next level is, expressed in the
  // units the player actually experiences (enemies left, time left) rather
  // than raw XP. Estimated from this run's own pace once there's real data
  // to average, so it stays honest instead of guessing from a fixed rate.
  const xpRemaining = Math.max(0, xpNeeded - xp);
  const avgXpPerEnemy = runEnemiesDefeated > 0 ? xp / runEnemiesDefeated : 0;
  const enemiesRemaining = avgXpPerEnemy > 0 ? Math.max(1, Math.ceil(xpRemaining / avgXpPerEnemy)) : null;
  const avgMsPerEnemy = runEnemiesDefeated > 0 ? elapsed / runEnemiesDefeated : 0;
  const secondsRemaining =
    enemiesRemaining !== null && avgMsPerEnemy > 0
      ? Math.round((enemiesRemaining * avgMsPerEnemy) / 1000)
      : null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 p-2 sm:p-3 md:p-5"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
      }}
    >
      <div className="flex items-start justify-between gap-1.5 sm:gap-3">
        {/* Player panel — flexes down on phones instead of forcing a fixed
            240px that would collide with the enemy panel on a small screen. */}
        <div
          className="hud-panel rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3.5 sm:py-2.5 flex-1 min-w-0 max-w-[42%] sm:max-w-none sm:w-60 md:w-64 sm:flex-none pointer-events-auto"
          style={{ borderTopColor: 'rgba(167,139,250,0.55)' }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white shrink-0 border border-white/20">
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
          <div className="mt-1 sm:mt-1.5 flex items-center justify-between text-[8px] sm:text-[9px] font-mono-game text-white/40 tabular-nums gap-1">
            <span className="flex items-center gap-1 sm:gap-2 min-w-0">
              <span className="text-sky-300/90">{wpm} WPM</span>
              <span className="text-emerald-300/90">{accuracy}%</span>
            </span>
            <span className="text-amber-300/80 shrink-0">🪙{coins}</span>
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
        </div>

        {/* Enemy panel */}
        <div
          className={`hud-panel rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3.5 sm:py-2.5 flex-1 min-w-0 max-w-[42%] sm:max-w-none sm:w-60 md:w-64 sm:flex-none pointer-events-auto ${enemy?.isBoss ? 'border-rose-400/50' : ''}`}
          style={{ borderTopColor: enemy?.isBoss ? 'rgba(248,113,113,0.65)' : 'rgba(244,114,182,0.5)' }}
        >
          <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
            {enemy?.isBoss && <span className="text-xs sm:text-sm shrink-0">👑</span>}
            <span className="font-bold text-xs sm:text-sm text-white/90 truncate flex-1 text-right">{enemy?.name ?? '—'}</span>
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
      {/* Level-flow strip: at a glance, how far into the level you are, what
          is left to get through it, and roughly how long that will take. */}
      <div className="mt-1.5 sm:mt-2 flex justify-center px-1">
        <div className="hud-panel rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-3 max-w-full overflow-hidden">
          <span className="text-[9px] sm:text-[10px] font-bold text-white/80 whitespace-nowrap shrink-0">Level {level}</span>
          <span className="hidden sm:block h-3 w-px bg-white/15 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-10 sm:w-20 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-[width] duration-300"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono-game text-white/50 tabular-nums">{Math.round(xpPct)}%</span>
          </div>
          {enemiesRemaining !== null && (
            <>
              <span className="hidden sm:block h-3 w-px bg-white/15 shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-mono-game text-white/50 tabular-nums whitespace-nowrap shrink-0">
                ~{enemiesRemaining} left
              </span>
            </>
          )}
          {secondsRemaining !== null && secondsRemaining < 3600 && (
            <span className="hidden sm:inline text-[10px] font-mono-game text-white/40 tabular-nums whitespace-nowrap shrink-0">
              ~{secondsRemaining < 60 ? `${secondsRemaining}s` : `${Math.round(secondsRemaining / 60)}m`}
            </span>
          )}
          <span className="hidden md:block h-3 w-px bg-white/15 shrink-0" />
          <span className="hidden md:inline text-[10px] font-mono-game text-white/35 tabular-nums whitespace-nowrap shrink-0">
            {runEnemiesDefeated} defeated · {formatElapsed(elapsed)} · {world.name}
          </span>
        </div>
      </div>
    </div>
  );
}
