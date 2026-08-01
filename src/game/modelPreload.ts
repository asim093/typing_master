import type { EnemyShape, HeroClassId, World } from '../types';
import { getEnemiesForWorld, getBossForWorld } from '../data/enemies';

// Same dynamic imports EnemyModel.tsx/HeroModel.tsx use internally. Calling
// one here just resolves the module a little early — which also runs that
// module's top-level useGLTF.preload() — so the GLB fetch has a head start
// while the player is still browsing menus, instead of only starting once
// they've clicked into the fight and are staring at a loading screen.
const ENEMY_MODULES: Partial<Record<EnemyShape, () => Promise<unknown>>> = {
  orc: () => import('../components/battle/enemies/OrcGLB'),
  skeleton: () => import('../components/battle/enemies/SkeletonSwordGLB'),
  goblin_king: () => import('../components/battle/enemies/DarkKnightGLB'),
  wolf: () => import('../components/battle/enemies/WolfGLB'),
  goblin: () => import('../components/battle/enemies/GoblinGLB'),
  darkmage: () => import('../components/battle/enemies/DarkMageGLB'),
  sand_titan: () => import('../components/battle/enemies/SandTitanGLB'),
  cyber_overlord: () => import('../components/battle/enemies/CyberOverlordGLB'),
  ice_dragon: () => import('../components/battle/enemies/IceDragonGLB'),
};

// This mapping went stale when the hero roster was reshuffled (Knight
// switched to Hero2GLB, Samurai took over the old Knight model) and nobody
// updated it — so preloading was silently fetching the wrong module (or
// nothing, for Samurai) the whole time. That's why models on the Choose
// Your Hero screen loaded late instead of being ready in advance.
const HERO_MODULES: Partial<Record<HeroClassId, () => Promise<unknown>>> = {
  knight: () => import('../components/battle/heroes/Hero2GLB'),
  samurai: () => import('../components/battle/heroes/WarriorGLB'),
};

const preloadedShapes = new Set<EnemyShape>();
const preloadedHeroes = new Set<HeroClassId>();

export function preloadHeroClass(heroClass: HeroClassId) {
  if (preloadedHeroes.has(heroClass)) return;
  preloadedHeroes.add(heroClass);
  HERO_MODULES[heroClass]?.();
}

/**
 * Both real hero models (Knight, Samurai) are small enough in number that
 * it's worth warming both regardless of which one is currently equipped —
 * the Choose Your Hero screen lets a player switch between them, and only
 * preloading whichever one happens to be active meant the *other* always
 * loaded late the first time it was previewed.
 */
export function preloadAllRealHeroes() {
  (Object.keys(HERO_MODULES) as HeroClassId[]).forEach(preloadHeroClass);
}

export function preloadEnemyShape(shape: EnemyShape) {
  if (preloadedShapes.has(shape)) return;
  preloadedShapes.add(shape);
  ENEMY_MODULES[shape]?.();
}

/** Warm every enemy + boss model a given world can throw at the player. */
export function preloadWorld(world: World) {
  for (const enemy of getEnemiesForWorld(world)) preloadEnemyShape(enemy.shape);
  const boss = getBossForWorld(world.id);
  if (boss) preloadEnemyShape(boss.shape);
}
