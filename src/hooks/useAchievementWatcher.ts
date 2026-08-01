import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { WORLDS } from '../data/worlds';
import type { AchievementDef } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

export function useAchievementWatcher(onUnlock: (a: AchievementDef) => void) {
  const level = usePlayerStore((s) => s.level);
  const bestCombo = usePlayerStore((s) => s.bestCombo);
  const bestWpm = usePlayerStore((s) => s.bestWpm);
  const bestAccuracy = usePlayerStore((s) => s.bestAccuracy);
  const totalWordsTyped = usePlayerStore((s) => s.totalWordsTyped);
  const totalEnemiesDefeated = usePlayerStore((s) => s.totalEnemiesDefeated);
  const bossesDefeated = usePlayerStore((s) => s.bossesDefeated);
  const unlockedWorlds = usePlayerStore((s) => s.unlockedWorlds);
  const unlockAchievement = usePlayerStore((s) => s.unlockAchievement);
  const onUnlockRef = useRef(onUnlock);
  onUnlockRef.current = onUnlock;

  useEffect(() => {
    const tryUnlock = (id: string) => {
      if (unlockAchievement(id)) {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (def) onUnlockRef.current(def);
      }
    };

    if (totalEnemiesDefeated >= 1) tryUnlock('first_victory');
    if (totalEnemiesDefeated >= 100) tryUnlock('enemies_100');
    if (bestCombo >= 50) tryUnlock('combo_50');
    if (bestCombo >= 100) tryUnlock('combo_100');
    if (bestWpm >= 60) tryUnlock('wpm_60');
    if (bestWpm >= 100) tryUnlock('wpm_100');
    if (bestAccuracy >= 100) tryUnlock('accuracy_100');
    if (bossesDefeated.length >= 1) tryUnlock('boss_slayer');
    if (bossesDefeated.length >= 4) tryUnlock('boss_slayer_4');
    if (level >= 10) tryUnlock('level_10');
    if (level >= 25) tryUnlock('level_25');
    if (level >= 40) tryUnlock('level_40');
    if (totalWordsTyped >= 500) tryUnlock('words_500');
    if (totalWordsTyped >= 2000) tryUnlock('words_2000');
    if (unlockedWorlds.length >= WORLDS.length) tryUnlock('all_worlds');
  }, [
    level,
    bestCombo,
    bestWpm,
    bestAccuracy,
    totalWordsTyped,
    totalEnemiesDefeated,
    bossesDefeated,
    unlockedWorlds,
    unlockAchievement,
  ]);
}
