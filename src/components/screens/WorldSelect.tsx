import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { WORLDS, getWorldForLevel } from '../../data/worlds';
import { getEnemiesForWorld, getBossStatus } from '../../data/enemies';
import { getTierForLevel } from '../../data/words';
import { usePlayerStore } from '../../store/playerStore';
import { playSfx } from '../../game/audio';
import { preloadWorld } from '../../game/modelPreload';
import ScreenBackground from '../ui/ScreenBackground';
import type { WorldId } from '../../types';

interface WorldSelectProps {
  onEnter: (worldId: WorldId) => void;
  onBack: () => void;
}

export default function WorldSelect({ onEnter, onBack }: WorldSelectProps) {
  const unlockedWorlds = usePlayerStore((s) => s.unlockedWorlds);
  const level = usePlayerStore((s) => s.level);
  const bossesDefeated = usePlayerStore((s) => s.bossesDefeated);
  const tier = getTierForLevel(level);

  // Warm the models for the world the player is most likely to enter next,
  // while they're still reading this screen — a head start before they click.
  useEffect(() => {
    preloadWorld(getWorldForLevel(level));
  }, [level]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8 pt-14 sm:pt-8 overflow-y-auto isolate">
      <ScreenBackground overlayStrength="medium" />
      <button
        onClick={onBack}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 p-2 -m-2 text-white/60 hover:text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 rounded"
      >
        ← Back
      </button>
      <h2 className="text-2xl sm:text-3xl font-black mb-1 text-white/90" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
        Choose Your World
      </h2>
      <p className="text-white/60 text-xs mb-8" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
        Level {level} · Word difficulty: <span className="text-violet-300 font-semibold">{tier.name}</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl w-full">
        {WORLDS.map((world, i) => {
          const unlocked = unlockedWorlds.includes(world.id);
          const enemies = getEnemiesForWorld(world);
          const boss = getBossStatus(world.id, level, bossesDefeated);
          return (
            <motion.button
              key={world.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={unlocked ? { scale: 1.015 } : {}}
              disabled={!unlocked}
              onMouseEnter={() => unlocked && preloadWorld(world)}
              onFocus={() => unlocked && preloadWorld(world)}
              onClick={() => {
                if (!unlocked) return;
                playSfx('uiConfirm');
                onEnter(world.id);
              }}
              className={`text-left rounded-2xl p-5 border overflow-hidden relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
              style={{
                background: `linear-gradient(135deg, ${world.colors.sky[0]}, ${world.colors.sky[1]})`,
                borderColor: unlocked ? `${world.colors.accent}66` : 'rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-2xl opacity-40"
                style={{ background: world.colors.glow }}
              />
              <div className="relative">
                <h3 className="text-xl font-bold mb-1" style={{ color: unlocked ? world.colors.accent : '#fff' }}>
                  {world.name}
                </h3>
                <p className="text-sm text-white/60 mb-3">{world.subtitle}</p>

                {unlocked ? (
                  <>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {enemies.map((e) => (
                        <span
                          key={e.id}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 border border-white/10 text-white/70"
                        >
                          {e.name}
                        </span>
                      ))}
                    </div>
                    {boss && (
                      <div className="text-xs mb-3 flex items-center gap-1.5">
                        <span>👑</span>
                        <span className={boss.state === 'defeated' ? 'text-white/40 line-through' : 'text-white/80'}>
                          {boss.boss.name}
                        </span>
                        {boss.state === 'defeated' && <span className="text-emerald-400 text-[10px]">defeated</span>}
                        {boss.state === 'available' && <span className="text-rose-300 text-[10px] font-bold animate-pulse">available now</span>}
                        {boss.state === 'upcoming' && (
                          <span className="text-white/40 text-[10px]">in {boss.levelsAway} level{boss.levelsAway === 1 ? '' : 's'}</span>
                        )}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Enter →</span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-white/40">🔒 Unlocks at level {world.unlockLevel}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
