export type WorldId = 'forest' | 'desert' | 'frozen' | 'cyber';

export interface World {
  id: WorldId;
  name: string;
  subtitle: string;
  unlockLevel: number;
  colors: {
    sky: [string, string];
    fog: string;
    ground: string;
    accent: string;
    glow: string;
    ambient: string;
  };
  lighting: {
    ambientIntensity: number;
    directionalIntensity: number;
    directionalColor: string;
  };
  weather?: 'storm';
  enemyIds: string[];
}

export type EnemyShape =
  | 'goblin'
  | 'skeleton'
  | 'wolf'
  | 'orc'
  | 'darkmage'
  | 'goblin_king'
  | 'sand_titan'
  | 'ice_dragon'
  | 'cyber_overlord';

export interface EnemyDef {
  id: string;
  worldId: WorldId;
  name: string;
  color: string;
  accentColor: string;
  baseHp: number;
  baseDamage: number;
  attackIntervalMs: number;
  shape: EnemyShape;
}

export interface BossDef {
  id: string;
  worldId: WorldId;
  level: number;
  name: string;
  title: string;
  color: string;
  accentColor: string;
  hpMultiplier: number;
  damageMultiplier: number;
  specialAttackName: string;
  shape: EnemyShape;
}

export type SkillId =
  | 'attackPower'
  | 'critChance'
  | 'comboBonus'
  | 'xpGain'
  | 'health';

export interface SkillDef {
  id: SkillId;
  name: string;
  description: string;
  maxLevel: number;
  perLevel: number;
  icon: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface WordTier {
  minLevel: number;
  maxLevel: number;
  words: string[];
}

export type GameScreen =
  | 'menu'
  | 'worldSelect'
  | 'battle'
  | 'skillTree'
  | 'achievements'
  | 'heroSelect'
  | 'profile'
  | 'howToPlay'
  | 'settings';

export type HeroClassId = 'knight' | 'ranger' | 'mage' | 'samurai' | 'cyberninja';

export interface HeroClassDef {
  id: HeroClassId;
  name: string;
  title: string;
  description: string;
}

export interface SkinDef {
  id: string;
  heroClass: HeroClassId;
  name: string;
  unlockLevel: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

export type WeaponType =
  | 'sword'
  | 'katana'
  | 'flameSword'
  | 'iceBlade'
  | 'hammer'
  | 'staff'
  | 'daggers'
  | 'cyberBlade';

export interface WeaponDef {
  id: string;
  name: string;
  type: WeaponType;
  unlockLevel: number;
  bladeColor: string;
  hiltColor: string;
  trailColor: string;
  particleColor: string;
}

export interface PlayerStats {
  level: number;
  xp: number;
  totalXpEarned: number;
  coins: number;
  skillPoints: number;
  skills: Record<SkillId, number>;
  unlockedWorlds: WorldId[];
  currentWorld: WorldId;
  unlockedAchievements: string[];
  bestWpm: number;
  bestAccuracy: number;
  totalWordsTyped: number;
  totalEnemiesDefeated: number;
  bossesDefeated: string[];
  bestCombo: number;
  heroClass: HeroClassId;
  unlockedSkins: string[];
  selectedSkinByHero: Record<HeroClassId, string>;
  unlockedWeapons: string[];
  selectedWeapon: string;
  totalTimePlayedMs: number;
  muted: boolean;
  streakDays: number;
  longestStreakDays: number;
  lastPlayedDate: string;
}

export interface FloatingDamage {
  id: number;
  value: number;
  crit: boolean;
  x: number;
  y: number;
  target: 'enemy' | 'player';
}

export interface AchievementToast {
  id: number;
  achievement: AchievementDef;
}

export interface RewardLine {
  id: number;
  label: string;
  icon: string;
}

export interface RewardBundle {
  id: number;
  title: string;
  lines: RewardLine[];
}
