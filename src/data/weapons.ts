import type { WeaponDef } from '../types';

export const WEAPONS: WeaponDef[] = [
  { id: 'iron_sword', name: 'Iron Sword', type: 'sword', unlockLevel: 1, bladeColor: '#e2e8f0', hiltColor: '#78350f', trailColor: '#cbd5e1', particleColor: '#e2e8f0' },
  { id: 'katana', name: 'Katana', type: 'katana', unlockLevel: 6, bladeColor: '#f1f5f9', hiltColor: '#7f1d1d', trailColor: '#f8fafc', particleColor: '#f1f5f9' },
  { id: 'flame_sword', name: 'Flame Sword', type: 'flameSword', unlockLevel: 12, bladeColor: '#f97316', hiltColor: '#7c2d12', trailColor: '#fb923c', particleColor: '#fdba74' },
  { id: 'ice_blade', name: 'Ice Blade', type: 'iceBlade', unlockLevel: 18, bladeColor: '#7dd3fc', hiltColor: '#0c4a6e', trailColor: '#bae6fd', particleColor: '#e0f2fe' },
  { id: 'war_hammer', name: 'War Hammer', type: 'hammer', unlockLevel: 16, bladeColor: '#78716c', hiltColor: '#44403c', trailColor: '#a8a29e', particleColor: '#d6d3d1' },
  { id: 'magic_staff', name: 'Magic Staff', type: 'staff', unlockLevel: 8, bladeColor: '#a78bfa', hiltColor: '#5b21b6', trailColor: '#c4b5fd', particleColor: '#ddd6fe' },
  { id: 'dual_daggers', name: 'Dual Daggers', type: 'daggers', unlockLevel: 22, bladeColor: '#facc15', hiltColor: '#1c1917', trailColor: '#fde047', particleColor: '#fef08a' },
  { id: 'cyber_blade', name: 'Cyber Blade', type: 'cyberBlade', unlockLevel: 33, bladeColor: '#22d3ee', hiltColor: '#0e7490', trailColor: '#67e8f9', particleColor: '#a5f3fc' },
];

export function getWeapon(id: string): WeaponDef {
  return WEAPONS.find((w) => w.id === id) ?? WEAPONS[0];
}
