import { SKILLS } from '../data/skills';
import type { PlayerStats } from '../types';

export const BASE_MAX_HEALTH = 100;
export const HEALTH_PER_LEVEL = 9;
export const BASE_CRIT_CHANCE = 0.05;
export const MAX_CRIT_CHANCE = 0.75;
export const COMBO_GROWTH_BASE = 0.018;
export const COMBO_CAP = 120;

function skillPercent(skills: PlayerStats['skills'], id: keyof PlayerStats['skills']): number {
  const def = SKILLS.find((s) => s.id === id)!;
  const lvl = skills[id] ?? 0;
  return lvl * def.perLevel;
}

export function xpToNextLevel(level: number): number {
  return Math.floor(70 * Math.pow(level, 1.32) + 30);
}

export function maxHealthFor(level: number, skills: PlayerStats['skills']): number {
  const base = BASE_MAX_HEALTH + (level - 1) * HEALTH_PER_LEVEL;
  return Math.round(base * (1 + skillPercent(skills, 'health')));
}

export function attackPowerMultiplier(skills: PlayerStats['skills']): number {
  return 1 + skillPercent(skills, 'attackPower');
}

export function critChanceFor(skills: PlayerStats['skills']): number {
  return Math.min(MAX_CRIT_CHANCE, BASE_CRIT_CHANCE + skillPercent(skills, 'critChance'));
}

export function comboGrowthFor(skills: PlayerStats['skills']): number {
  return COMBO_GROWTH_BASE * (1 + skillPercent(skills, 'comboBonus'));
}

export function xpGainMultiplier(skills: PlayerStats['skills']): number {
  return 1 + skillPercent(skills, 'xpGain');
}

export function comboMultiplierFor(combo: number, skills: PlayerStats['skills']): number {
  const growth = comboGrowthFor(skills);
  return 1 + Math.min(combo, COMBO_CAP) * growth;
}

export function accuracyModifierFor(accuracyRatio: number): number {
  // accuracyRatio 0..1 -> modifier 0.5..1.5
  return 0.5 + Math.max(0, Math.min(1, accuracyRatio)) * 1.0;
}

export interface DamageResult {
  damage: number;
  crit: boolean;
  comboMultiplier: number;
  accuracyModifier: number;
}

export function computeWordDamage(
  wordLength: number,
  combo: number,
  accuracyRatio: number,
  skills: PlayerStats['skills'],
): DamageResult {
  const comboMultiplier = comboMultiplierFor(combo, skills);
  const accuracyModifier = accuracyModifierFor(accuracyRatio);
  const power = attackPowerMultiplier(skills);
  let damage = wordLength * comboMultiplier * accuracyModifier * power;
  const crit = Math.random() < critChanceFor(skills);
  if (crit) damage *= 2;
  return { damage: Math.max(1, Math.round(damage)), crit, comboMultiplier, accuracyModifier };
}

export function wordTimeLimitMs(wordLength: number, level: number): number {
  // Longer words get more time; higher levels tighten the window slightly.
  const base = 1400 + wordLength * 340;
  const levelTightening = Math.min(0.35, level * 0.006);
  return Math.round(base * (1 - levelTightening));
}

/**
 * HP growth is deliberately mild. Raw HP inflation doesn't make a typing
 * game harder — it just makes each enemy take more words, which reads as
 * padding rather than challenge. The real difficulty comes from the word
 * tiers (longer/rarer words at higher levels), the tightening per-word
 * time limit, and enemies attacking faster — see scaledEnemyAttackInterval.
 * Damage scales a little faster than HP so mistakes cost more over time.
 */
export function scaledEnemyHp(baseHp: number, level: number): number {
  return Math.round(baseHp * (1 + (level - 1) * 0.055));
}

export function scaledEnemyDamage(baseDamage: number, level: number): number {
  return Math.round(baseDamage * (1 + (level - 1) * 0.08));
}

/**
 * Enemies swing progressively faster, which squeezes the real resource in
 * this game — the time you have to type the next word — instead of padding
 * the healthbar. Floored so it stays humanly answerable at high level.
 */
export const MIN_ENEMY_ATTACK_INTERVAL_MS = 1500;

export function scaledEnemyAttackInterval(baseIntervalMs: number, level: number): number {
  const speedUp = 1 - Math.min(0.45, (level - 1) * 0.012);
  return Math.max(MIN_ENEMY_ATTACK_INTERVAL_MS, Math.round(baseIntervalMs * speedUp));
}

export function coinsForEnemy(hp: number): number {
  return Math.max(2, Math.round(hp / 6));
}

export function xpForEnemy(hp: number, isBoss: boolean): number {
  return Math.max(5, Math.round(hp / (isBoss ? 2.2 : 3.4)));
}
