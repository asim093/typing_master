import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HeroClassId, PlayerStats, SkillId, WorldId } from '../types';
import { xpToNextLevel } from '../game/combat';
import { WORLDS } from '../data/worlds';
import { ACHIEVEMENTS } from '../data/achievements';
import { SKILLS } from '../data/skills';
import { SKINS, defaultSkinForHero } from '../data/skins';
import { WEAPONS } from '../data/weapons';
import { HERO_CLASSES } from '../data/heroClasses';

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DEFAULT_SKILLS: Record<SkillId, number> = {
  attackPower: 0,
  critChance: 0,
  comboBonus: 0,
  xpGain: 0,
  health: 0,
};

const DEFAULT_SKIN_BY_HERO = Object.fromEntries(
  HERO_CLASSES.map((h) => [h.id, defaultSkinForHero(h.id)]),
) as Record<HeroClassId, string>;

const DEFAULT_STATE: PlayerStats = {
  level: 1,
  xp: 0,
  totalXpEarned: 0,
  coins: 0,
  skillPoints: 0,
  skills: { ...DEFAULT_SKILLS },
  // All worlds unlocked for testing — flip back to ['forest'] for the real level-gated release.
  unlockedWorlds: WORLDS.map((w) => w.id),
  currentWorld: 'forest',
  unlockedAchievements: [],
  bestWpm: 0,
  bestAccuracy: 0,
  totalWordsTyped: 0,
  totalEnemiesDefeated: 0,
  bossesDefeated: [],
  bestCombo: 0,
  heroClass: 'knight',
  unlockedSkins: SKINS.filter((s) => s.unlockLevel <= 1).map((s) => s.id),
  selectedSkinByHero: { ...DEFAULT_SKIN_BY_HERO },
  unlockedWeapons: WEAPONS.filter((w) => w.unlockLevel <= 1).map((w) => w.id),
  selectedWeapon: 'iron_sword',
  totalTimePlayedMs: 0,
  muted: false,
  streakDays: 0,
  longestStreakDays: 0,
  lastPlayedDate: '',
};

export interface AddXpResult {
  leveledUp: boolean;
  levelsGained: number;
  newLevel: number;
  newlyUnlockedWorld?: WorldId;
  newlyUnlockedSkins: string[];
  newlyUnlockedWeapons: string[];
  coinsAwarded: number;
}

interface PlayerStore extends PlayerStats {
  addXp: (amount: number, coinsAwarded?: number) => AddXpResult;
  addCoins: (amount: number) => void;
  spendSkillPoint: (skillId: SkillId) => boolean;
  setCurrentWorld: (id: WorldId) => void;
  unlockAchievement: (id: string) => boolean;
  updateBestWpm: (wpm: number) => boolean;
  updateBestAccuracy: (acc: number) => boolean;
  recordWordsTyped: (n: number) => void;
  recordEnemyDefeated: () => void;
  recordBossDefeated: (id: string) => void;
  recordCombo: (combo: number) => boolean;
  setHeroClass: (id: HeroClassId) => void;
  setSkinForCurrentHero: (skinId: string) => boolean;
  setWeapon: (weaponId: string) => boolean;
  addPlayTime: (ms: number) => void;
  toggleMuted: () => void;
  recordDailyLogin: () => { streak: number; isNewDay: boolean };
  resetProgress: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      addXp: (amount, coinsAwarded = 0) => {
        const state = get();
        const gainMult = 1 + state.skills.xpGain * SKILLS.find((s) => s.id === 'xpGain')!.perLevel;
        const gained = Math.round(amount * gainMult);
        let xp = state.xp + gained;
        let level = state.level;
        let skillPoints = state.skillPoints;
        let levelsGained = 0;
        let threshold = xpToNextLevel(level);
        while (xp >= threshold) {
          xp -= threshold;
          level += 1;
          skillPoints += 1;
          levelsGained += 1;
          threshold = xpToNextLevel(level);
        }

        let newlyUnlockedWorld: WorldId | undefined;
        let unlockedWorlds = state.unlockedWorlds;
        let unlockedSkins = state.unlockedSkins;
        let unlockedWeapons = state.unlockedWeapons;
        const newlyUnlockedSkins: string[] = [];
        const newlyUnlockedWeapons: string[] = [];

        if (levelsGained > 0) {
          const stillLocked = WORLDS.filter((w) => level >= w.unlockLevel && !unlockedWorlds.includes(w.id));
          if (stillLocked.length > 0) {
            unlockedWorlds = [...unlockedWorlds, ...stillLocked.map((w) => w.id)];
            newlyUnlockedWorld = stillLocked[stillLocked.length - 1].id;
          }

          for (const skin of SKINS) {
            if (level >= skin.unlockLevel && !unlockedSkins.includes(skin.id)) {
              unlockedSkins = [...unlockedSkins, skin.id];
              newlyUnlockedSkins.push(skin.id);
            }
          }
          for (const weapon of WEAPONS) {
            if (level >= weapon.unlockLevel && !unlockedWeapons.includes(weapon.id)) {
              unlockedWeapons = [...unlockedWeapons, weapon.id];
              newlyUnlockedWeapons.push(weapon.id);
            }
          }
        }

        set({
          xp,
          level,
          skillPoints,
          unlockedWorlds,
          unlockedSkins,
          unlockedWeapons,
          totalXpEarned: state.totalXpEarned + gained,
          coins: state.coins + Math.round(coinsAwarded),
        });
        return {
          leveledUp: levelsGained > 0,
          levelsGained,
          newLevel: level,
          newlyUnlockedWorld,
          newlyUnlockedSkins,
          newlyUnlockedWeapons,
          coinsAwarded: Math.round(coinsAwarded),
        };
      },

      addCoins: (amount) => set((s) => ({ coins: s.coins + Math.round(amount) })),

      spendSkillPoint: (skillId) => {
        const state = get();
        const def = SKILLS.find((s) => s.id === skillId);
        if (!def) return false;
        if (state.skillPoints <= 0) return false;
        if (state.skills[skillId] >= def.maxLevel) return false;
        set({
          skillPoints: state.skillPoints - 1,
          skills: { ...state.skills, [skillId]: state.skills[skillId] + 1 },
        });
        return true;
      },

      setCurrentWorld: (id) => set({ currentWorld: id }),

      unlockAchievement: (id) => {
        const state = get();
        if (state.unlockedAchievements.includes(id)) return false;
        if (!ACHIEVEMENTS.some((a) => a.id === id)) return false;
        set({ unlockedAchievements: [...state.unlockedAchievements, id] });
        return true;
      },

      updateBestWpm: (wpm) => {
        const rounded = Math.round(wpm);
        if (rounded > get().bestWpm) {
          set({ bestWpm: rounded });
          return true;
        }
        return false;
      },

      updateBestAccuracy: (acc) => {
        const rounded = Math.round(acc);
        if (rounded > get().bestAccuracy) {
          set({ bestAccuracy: rounded });
          return true;
        }
        return false;
      },

      recordWordsTyped: (n) => set((s) => ({ totalWordsTyped: s.totalWordsTyped + n })),

      recordEnemyDefeated: () => set((s) => ({ totalEnemiesDefeated: s.totalEnemiesDefeated + 1 })),

      recordBossDefeated: (id) => {
        const state = get();
        if (state.bossesDefeated.includes(id)) return;
        set({ bossesDefeated: [...state.bossesDefeated, id] });
      },

      recordCombo: (combo) => {
        if (combo > get().bestCombo) {
          set({ bestCombo: combo });
          return true;
        }
        return false;
      },

      setHeroClass: (id) => set({ heroClass: id }),

      setSkinForCurrentHero: (skinId) => {
        const state = get();
        const skin = SKINS.find((s) => s.id === skinId);
        if (!skin || !state.unlockedSkins.includes(skinId)) return false;
        set({ selectedSkinByHero: { ...state.selectedSkinByHero, [skin.heroClass]: skinId } });
        return true;
      },

      setWeapon: (weaponId) => {
        const state = get();
        if (!state.unlockedWeapons.includes(weaponId)) return false;
        set({ selectedWeapon: weaponId });
        return true;
      },

      addPlayTime: (ms) => set((s) => ({ totalTimePlayedMs: s.totalTimePlayedMs + ms })),

      toggleMuted: () => set((s) => ({ muted: !s.muted })),

      recordDailyLogin: () => {
        const state = get();
        const today = dateKey(new Date());
        if (state.lastPlayedDate === today) {
          return { streak: Math.max(1, state.streakDays), isNewDay: false };
        }
        const yesterday = dateKey(new Date(Date.now() - 86400000));
        const streak = state.lastPlayedDate === yesterday ? state.streakDays + 1 : 1;
        const longestStreakDays = Math.max(state.longestStreakDays, streak);
        set({ lastPlayedDate: today, streakDays: streak, longestStreakDays });
        return { streak, isNewDay: true };
      },

      resetProgress: () =>
        set({
          ...DEFAULT_STATE,
          skills: { ...DEFAULT_SKILLS },
          selectedSkinByHero: { ...DEFAULT_SKIN_BY_HERO },
        }),
    }),
    {
      name: 'typequest-save',
      version: 3,
      // v3: all worlds unlocked for testing — existing saves (persisted with
      // the old ['forest']-only default) need this forced in too, since
      // persist rehydrates straight from localStorage over the new default.
      migrate: (persisted, version) => {
        const state = persisted as PlayerStats;
        if (version < 3) {
          state.unlockedWorlds = WORLDS.map((w) => w.id);
        }
        return state;
      },
    },
  ),
);
