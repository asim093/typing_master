import type { HeroClassId, SkinDef } from '../types';

export const SKINS: SkinDef[] = [
  // Knight
  { id: 'knight_default', heroClass: 'knight', name: 'Default', unlockLevel: 1, colors: { primary: '#8b8794', secondary: '#4c1d95', accent: '#c084fc', glow: '#c084fc' } },
  { id: 'dark_knight', heroClass: 'knight', name: 'Dark Knight', unlockLevel: 5, colors: { primary: '#18181b', secondary: '#7f1d1d', accent: '#ef4444', glow: '#f87171' } },
  { id: 'golden_warrior', heroClass: 'knight', name: 'Golden Warrior', unlockLevel: 15, colors: { primary: '#fde68a', secondary: '#78350f', accent: '#fbbf24', glow: '#fef08a' } },

  // Ranger
  { id: 'ranger_default', heroClass: 'ranger', name: 'Default', unlockLevel: 1, colors: { primary: '#3f6212', secondary: '#1a2e05', accent: '#a3e635', glow: '#bef264' } },
  { id: 'nightstalker_ranger', heroClass: 'ranger', name: 'Nightstalker', unlockLevel: 12, colors: { primary: '#1e293b', secondary: '#0f172a', accent: '#38bdf8', glow: '#7dd3fc' } },

  // Mage
  { id: 'mage_default', heroClass: 'mage', name: 'Default', unlockLevel: 1, colors: { primary: '#3730a3', secondary: '#1e1b4b', accent: '#818cf8', glow: '#a5b4fc' } },
  { id: 'arcane_mage', heroClass: 'mage', name: 'Arcane Mage', unlockLevel: 20, colors: { primary: '#581c87', secondary: '#2e1065', accent: '#e9d5ff', glow: '#d8b4fe' } },

  // Samurai
  { id: 'samurai_default', heroClass: 'samurai', name: 'Default', unlockLevel: 1, colors: { primary: '#7f1d1d', secondary: '#1c1917', accent: '#fca5a5', glow: '#fecaca' } },
  { id: 'frost_samurai', heroClass: 'samurai', name: 'Frost Samurai', unlockLevel: 25, colors: { primary: '#e0f2fe', secondary: '#0c4a6e', accent: '#7dd3fc', glow: '#bae6fd' } },

  // Cyber Ninja
  { id: 'cyberninja_default', heroClass: 'cyberninja', name: 'Default', unlockLevel: 1, colors: { primary: '#27272a', secondary: '#09090b', accent: '#22d3ee', glow: '#67e8f9' } },
  { id: 'shadow_ninja', heroClass: 'cyberninja', name: 'Shadow Ninja', unlockLevel: 30, colors: { primary: '#0a0a0a', secondary: '#3b0764', accent: '#e879f9', glow: '#f0abfc' } },
];

export function getSkinsForHero(heroClass: HeroClassId): SkinDef[] {
  return SKINS.filter((s) => s.heroClass === heroClass);
}

export function getSkin(id: string): SkinDef {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

export function defaultSkinForHero(heroClass: HeroClassId): string {
  return `${heroClass}_default`;
}
