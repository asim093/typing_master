import type { BossDef, EnemyDef, World } from '../types';

export const ENEMIES: EnemyDef[] = [
  {
    id: 'goblin', worldId: 'forest', name: 'Goblin', color: '#65a30d', accentColor: '#bef264',
    baseHp: 42, baseDamage: 4, attackIntervalMs: 4000, shape: 'goblin',
  },
  {
    id: 'wolf', worldId: 'forest', name: 'Wolf', color: '#4b5563', accentColor: '#e5e7eb',
    baseHp: 58, baseDamage: 5, attackIntervalMs: 3400, shape: 'wolf',
  },
  {
    id: 'orc', worldId: 'forest', name: 'Orc', color: '#166534', accentColor: '#facc15',
    baseHp: 78, baseDamage: 6, attackIntervalMs: 4200, shape: 'orc',
  },
  {
    id: 'skeleton', worldId: 'desert', name: 'Skeleton', color: '#e5e7eb', accentColor: '#fca5a5',
    baseHp: 95, baseDamage: 8, attackIntervalMs: 3800, shape: 'skeleton',
  },
  {
    id: 'darkmage', worldId: 'cyber', name: 'Dark Mage', color: '#6d28d9', accentColor: '#f0abfc',
    baseHp: 150, baseDamage: 12, attackIntervalMs: 3600, shape: 'darkmage',
  },
];

export const BOSSES: BossDef[] = [
  {
    id: 'goblin_king', worldId: 'forest', level: 10, name: 'Goblin King', title: 'Tyrant of the Deep Wood',
    color: '#84cc16', accentColor: '#fde047', hpMultiplier: 8, damageMultiplier: 2.2,
    specialAttackName: 'War Stomp', shape: 'goblin_king',
  },
  {
    id: 'sand_titan', worldId: 'desert', level: 20, name: 'Sand Titan', title: 'Colossus of the Dunes',
    color: '#d97706', accentColor: '#fef3c7', hpMultiplier: 9, damageMultiplier: 2.4,
    specialAttackName: 'Sandstorm Slam', shape: 'sand_titan',
  },
  {
    id: 'ice_dragon', worldId: 'frozen', level: 30, name: 'Ice Dragon', title: 'Sovereign of the Frozen Sky',
    color: '#0ea5e9', accentColor: '#e0f2fe', hpMultiplier: 10, damageMultiplier: 2.6,
    specialAttackName: 'Glacial Breath', shape: 'ice_dragon',
  },
  {
    id: 'cyber_overlord', worldId: 'cyber', level: 40, name: 'Cyber Overlord', title: 'Architect of the Grid',
    color: '#d946ef', accentColor: '#67e8f9', hpMultiplier: 12, damageMultiplier: 3,
    specialAttackName: 'System Overload', shape: 'cyber_overlord',
  },
];

export function getBossForLevel(level: number): BossDef | undefined {
  return BOSSES.find((b) => b.level === level);
}

export function getNextBossLevel(level: number): number {
  const next = BOSSES.map((b) => b.level).find((l) => l > level);
  if (next) return next;
  return Math.ceil((level + 1) / 10) * 10;
}

export function getRandomEnemyForWorld(world: World): EnemyDef {
  const pool = ENEMIES.filter((e) => world.enemyIds.includes(e.id));
  return pool[Math.floor(Math.random() * pool.length)] ?? ENEMIES[0];
}

export function getBossForWorld(worldId: string): BossDef | undefined {
  return BOSSES.find((b) => b.worldId === worldId);
}

export interface BossStatus {
  boss: BossDef;
  state: 'defeated' | 'available' | 'upcoming';
  levelsAway: number;
}

export function getBossStatus(worldId: string, level: number, defeated: string[]): BossStatus | undefined {
  const boss = getBossForWorld(worldId);
  if (!boss) return undefined;
  if (defeated.includes(boss.id)) return { boss, state: 'defeated', levelsAway: 0 };
  if (level >= boss.level) return { boss, state: 'available', levelsAway: 0 };
  return { boss, state: 'upcoming', levelsAway: boss.level - level };
}

export function getEnemiesForWorld(world: World): EnemyDef[] {
  return ENEMIES.filter((e) => world.enemyIds.includes(e.id));
}
