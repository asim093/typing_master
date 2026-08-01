import type { World } from '../types';

export const WORLDS: World[] = [
  {
    id: 'forest',
    name: 'Stormbound Woods',
    subtitle: 'A midnight tempest over the ruined kingdom',
    unlockLevel: 1,
    colors: {
      sky: ['#1c2c42', '#0a1220'],
      fog: '#16233a',
      ground: '#212f36',
      accent: '#7dd3fc',
      glow: '#60a5fa',
      ambient: '#bfdbfe',
    },
    lighting: {
      ambientIntensity: 0.6,
      directionalIntensity: 0.95,
      directionalColor: '#a8c4e8',
    },
    weather: 'storm',
    enemyIds: ['goblin', 'wolf', 'orc'],
  },
  {
    id: 'desert',
    name: 'Desert Ruins',
    subtitle: 'Ancient secrets buried in sand',
    unlockLevel: 11,
    colors: {
      sky: ['#4a3520', '#1b1206'],
      fog: '#2a1d10',
      ground: '#40311b',
      accent: '#fb923c',
      glow: '#f59e0b',
      ambient: '#fde68a',
    },
    lighting: {
      ambientIntensity: 0.55,
      directionalIntensity: 1.4,
      directionalColor: '#fff2e0',
    },
    enemyIds: ['skeleton', 'orc', 'goblin'],
  },
  {
    id: 'frozen',
    name: 'Frozen Realm',
    subtitle: 'A kingdom locked in eternal ice',
    unlockLevel: 21,
    colors: {
      sky: ['#1a2a3d', '#050d17'],
      fog: '#0d1a2a',
      ground: '#203040',
      accent: '#60a5fa',
      glow: '#38bdf8',
      ambient: '#e0f2fe',
    },
    lighting: {
      ambientIntensity: 0.55,
      directionalIntensity: 1.4,
      directionalColor: '#fff2e0',
    },
    enemyIds: ['wolf', 'skeleton', 'darkmage'],
  },
  {
    id: 'cyber',
    name: 'Cyber City',
    subtitle: 'Neon shadows and rogue machines',
    unlockLevel: 31,
    colors: {
      sky: ['#2a0a3d', '#090110'],
      fog: '#1a0a2a',
      ground: '#180d2b',
      accent: '#e879f9',
      glow: '#c026d3',
      ambient: '#67e8f9',
    },
    lighting: {
      ambientIntensity: 0.55,
      directionalIntensity: 1.4,
      directionalColor: '#fff2e0',
    },
    enemyIds: ['darkmage', 'skeleton', 'orc'],
  },
];

export function getWorld(id: string): World {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}

export function getWorldForLevel(level: number): World {
  let current = WORLDS[0];
  for (const w of WORLDS) {
    if (level >= w.unlockLevel) current = w;
  }
  return current;
}
