import type { HeroClassDef } from '../types';

// Unlock ladder: Knight from the start, then one new hero every 10 levels.
//
// `comingSoon` is a separate axis from `unlockLevel` on purpose. Ranger,
// Mage and Cyber Ninja still only have placeholder box geometry, and
// shipping shape-built heroes was explicitly ruled out — so they carry
// their real unlock level (shown to the player as something to work
// toward) but stay flagged until a proper model exists for them. Dropping
// that flag is then the only change needed to bring one online.
export const HERO_CLASSES: HeroClassDef[] = [
  { id: 'knight', name: 'Knight', title: 'The Shield of the Realm', description: 'A heavily armored warrior, steady and relentless in the charge.', unlockLevel: 1 },
  { id: 'ranger', name: 'Ranger', title: 'Shadow of the Wood', description: 'A swift and precise fighter who strikes before the enemy can react.', comingSoon: true, unlockLevel: 10 },
  { id: 'mage', name: 'Mage', title: 'Weaver of Arcane Fire', description: 'A spellcaster who channels raw magic through every strike.', comingSoon: true, unlockLevel: 20 },
  { id: 'samurai', name: 'Samurai', title: 'Blade of Discipline', description: 'A disciplined duelist whose every cut is exact and deadly.', unlockLevel: 30 },
  { id: 'cyberninja', name: 'Cyber Ninja', title: 'Ghost of the Grid', description: 'An augmented assassin moving faster than the eye can follow.', comingSoon: true, unlockLevel: 40 },
];

export function getHeroClass(id: string) {
  return HERO_CLASSES.find((h) => h.id === id) ?? HERO_CLASSES[0];
}
