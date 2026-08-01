import type { HeroClassDef } from '../types';

export const HERO_CLASSES: HeroClassDef[] = [
  { id: 'knight', name: 'Knight', title: 'The Shield of the Realm', description: 'A heavily armored warrior, steady and relentless in the charge.' },
  { id: 'ranger', name: 'Ranger', title: 'Shadow of the Wood', description: 'A swift and precise fighter who strikes before the enemy can react.' },
  { id: 'mage', name: 'Mage', title: 'Weaver of Arcane Fire', description: 'A spellcaster who channels raw magic through every strike.' },
  { id: 'samurai', name: 'Samurai', title: 'Blade of Discipline', description: 'A disciplined duelist whose every cut is exact and deadly.' },
  { id: 'cyberninja', name: 'Cyber Ninja', title: 'Ghost of the Grid', description: 'An augmented assassin moving faster than the eye can follow.' },
];

export function getHeroClass(id: string) {
  return HERO_CLASSES.find((h) => h.id === id) ?? HERO_CLASSES[0];
}
