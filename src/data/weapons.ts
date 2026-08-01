import type { HeroClassId, WeaponDef } from '../types';

// Each class carries one fixed, thematically-matched weapon — there used to
// be a player-facing unlock/equip system across all 8 weapon types, but the
// Knight's GLB model has no attachment point for a separate weapon mesh, so
// switching weapons never actually changed anything for that class (the
// default class most players see first). Rather than ship a picker that
// only worked for 4 of 5 classes, every class now gets the weapon its
// silhouette already implies.
const CLASS_WEAPONS: Record<HeroClassId, WeaponDef> = {
  knight: { id: 'iron_sword', name: 'Iron Sword', type: 'sword', bladeColor: '#e2e8f0', hiltColor: '#78350f', trailColor: '#cbd5e1', particleColor: '#e2e8f0' },
  ranger: { id: 'dual_daggers', name: 'Dual Daggers', type: 'daggers', bladeColor: '#facc15', hiltColor: '#1c1917', trailColor: '#fde047', particleColor: '#fef08a' },
  mage: { id: 'magic_staff', name: 'Magic Staff', type: 'staff', bladeColor: '#a78bfa', hiltColor: '#5b21b6', trailColor: '#c4b5fd', particleColor: '#ddd6fe' },
  samurai: { id: 'katana', name: 'Katana', type: 'katana', bladeColor: '#f1f5f9', hiltColor: '#7f1d1d', trailColor: '#f8fafc', particleColor: '#f1f5f9' },
  cyberninja: { id: 'cyber_blade', name: 'Cyber Blade', type: 'cyberBlade', bladeColor: '#22d3ee', hiltColor: '#0e7490', trailColor: '#67e8f9', particleColor: '#a5f3fc' },
};

export function getWeaponForClass(heroClass: HeroClassId): WeaponDef {
  return CLASS_WEAPONS[heroClass];
}
