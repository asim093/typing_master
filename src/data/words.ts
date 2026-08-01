import type { WorldId } from '../types';

export type WordCategory =
  | 'nature'
  | 'science'
  | 'space'
  | 'history'
  | 'technology'
  | 'programming'
  | 'fantasy'
  | 'mythology';

export const WORD_CATEGORIES: { id: WordCategory; name: string }[] = [
  { id: 'nature', name: 'Nature' },
  { id: 'science', name: 'Science' },
  { id: 'space', name: 'Space' },
  { id: 'history', name: 'History' },
  { id: 'technology', name: 'Technology' },
  { id: 'programming', name: 'Programming' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'mythology', name: 'Mythology' },
];

export interface DifficultyTier {
  tier: number;
  name: string;
  minLevel: number;
  maxLevel: number;
}

export const DIFFICULTY_TIERS: DifficultyTier[] = [
  { tier: 1, name: 'Easy', minLevel: 1, maxLevel: 10 },
  { tier: 2, name: 'Intermediate', minLevel: 11, maxLevel: 20 },
  { tier: 3, name: 'Advanced', minLevel: 21, maxLevel: 30 },
  { tier: 4, name: 'Technical', minLevel: 31, maxLevel: 40 },
  { tier: 5, name: 'Expert', minLevel: 41, maxLevel: 999 },
];

// World -> the categories that flavor its word selection (in priority order).
export const WORLD_CATEGORIES: Record<WorldId, WordCategory[]> = {
  forest: ['fantasy', 'nature', 'mythology'],
  desert: ['history', 'mythology', 'nature'],
  frozen: ['science', 'space', 'nature'],
  cyber: ['technology', 'programming', 'science'],
};

type Pool = Record<WordCategory, string[]>;

// Tier 1 — Easy (levels 1-10)
const TIER1: Pool = {
  nature: ['tree', 'leaf', 'rock', 'wind', 'rain', 'cloud', 'river', 'stone', 'plant', 'grass', 'ocean', 'storm', 'earth', 'field', 'hill', 'bird', 'fish', 'lake', 'sand', 'snow', 'flame', 'wave', 'root', 'moss', 'fern', 'pine', 'cave', 'peak', 'reef', 'dust', 'mist', 'tide', 'bloom', 'creek', 'shore', 'trail', 'frost', 'ember', 'marsh', 'grove'],
  science: ['cell', 'atom', 'heat', 'light', 'sound', 'force', 'magnet', 'liquid', 'solid', 'energy', 'matter', 'weight', 'motion', 'metal', 'gas', 'acid', 'lens', 'pulse', 'spark', 'plasma', 'vapor', 'fossil', 'growth', 'sample'],
  space: ['moon', 'star', 'sun', 'sky', 'comet', 'orbit', 'rocket', 'planet', 'meteor', 'space', 'alien', 'launch', 'crater', 'lunar', 'solar', 'cosmic', 'shuttle', 'probe', 'signal', 'void'],
  history: ['king', 'queen', 'castle', 'knight', 'sword', 'crown', 'throne', 'empire', 'battle', 'army', 'fort', 'ruins', 'coin', 'shield', 'siege', 'banner', 'scroll', 'tomb', 'relic', 'armor', 'archer', 'noble', 'realm', 'tribe'],
  technology: ['phone', 'robot', 'screen', 'wifi', 'app', 'code', 'click', 'power', 'wire', 'button', 'camera', 'mouse', 'laptop', 'signal', 'cable', 'switch', 'device', 'sensor', 'pixel', 'server'],
  programming: ['code', 'bug', 'key', 'tab', 'run', 'save', 'file', 'byte', 'loop', 'data', 'print', 'input', 'array', 'class', 'const', 'debug', 'index', 'merge', 'null', 'parse', 'query', 'stack', 'value', 'string'],
  fantasy: ['hero', 'quest', 'magic', 'brave', 'blade', 'spell', 'elf', 'potion', 'charm', 'fairy', 'giant', 'troll', 'rune', 'wand', 'cloak', 'dwarf', 'ogre', 'scroll', 'tower', 'portal', 'shadow', 'flame', 'guild', 'vault', 'orb', 'gem'],
  mythology: ['god', 'myth', 'titan', 'oracle', 'fate', 'muse', 'beast', 'curse', 'spirit', 'ghost', 'demon', 'omen', 'idol', 'rite', 'shrine', 'hydra', 'sphinx', 'nymph', 'chaos', 'divine', 'mortal', 'vision', 'wraith', 'totem'],
};

// Tier 2 — Intermediate (levels 11-20)
const TIER2: Pool = {
  nature: ['forest', 'volcano', 'glacier', 'thunder', 'wildlife', 'blossom', 'canyon', 'meadow', 'wetland', 'drought', 'harvest', 'erosion', 'habitat', 'sunrise', 'lagoon', 'plateau', 'estuary', 'tropics', 'foliage', 'cascade', 'sapling', 'thicket', 'monsoon', 'boulder'],
  science: ['molecule', 'element', 'reaction', 'friction', 'pressure', 'velocity', 'chemical', 'organism', 'particle', 'gravity', 'magnetic', 'electron', 'chemistry'],
  space: ['asteroid', 'satellite', 'universe', 'nebula', 'gravity', 'astronaut', 'telescope', 'eclipse', 'galaxy', 'meteorite', 'spaceship', 'starlight'],
  history: ['kingdom', 'warrior', 'village', 'dragon', 'mystery', 'journey', 'weapon', 'monster', 'treasure', 'ancient', 'legend', 'fortress', 'conquest', 'dynasty'],
  technology: ['computer', 'internet', 'keyboard', 'monitor', 'network', 'hardware', 'software', 'battery', 'circuit', 'wireless', 'gadget', 'bluetooth'],
  programming: ['function', 'variable', 'compiler', 'debugger', 'library', 'syntax', 'boolean', 'iterate', 'callback', 'runtime', 'command', 'terminal'],
  fantasy: ['wizard', 'phoenix', 'crystal', 'goblin', 'sorcery', 'enchant', 'amulet', 'unicorn', 'griffin', 'sanctuary', 'wilderness', 'creature', 'paladin', 'summon', 'banshee', 'talisman', 'chalice', 'warlock', 'grimoire', 'citadel', 'serpent', 'valiant'],
  mythology: ['olympus', 'valhalla', 'immortal', 'prophecy', 'guardian', 'legend', 'mythical', 'underworld', 'sacred', 'ritual', 'temple', 'chosen', 'pilgrim', 'destiny', 'eternal', 'ominous', 'seraph', 'obelisk', 'covenant', 'ancestor'],
};

// Tier 3 — Advanced (levels 21-30)
const TIER3: Pool = {
  nature: ['ecosystem', 'biodiversity', 'photosynthesis', 'sustainable', 'atmosphere', 'deforestation', 'conservation', 'wilderness', 'permafrost', 'evaporation'],
  science: ['phenomenon', 'hypothesis', 'equilibrium', 'catalyst', 'quantum', 'thermodynamics', 'biological', 'synthesis', 'radiation', 'spectrum'],
  space: ['astronomical', 'gravitational', 'interstellar', 'observatory', 'exoplanet', 'astrophysics', 'cosmology', 'trajectory', 'constellation', 'lightyear'],
  history: ['civilization', 'renaissance', 'monarchy', 'revolution', 'archaeology', 'medieval', 'diplomacy', 'colonization', 'inscription', 'artifact'],
  technology: ['infrastructure', 'automation', 'innovation', 'digitization', 'connectivity', 'compatibility', 'processor', 'bandwidth', 'encryption', 'simulation'],
  programming: ['algorithm', 'recursion', 'abstraction', 'inheritance', 'polymorphism', 'concurrency', 'repository', 'dependency', 'framework', 'architecture'],
  fantasy: ['extraordinary', 'labyrinth', 'quintessential', 'formidable', 'clandestine', 'paradoxical', 'melancholy', 'ephemeral', 'exuberant', 'serendipity'],
  mythology: ['prophecy', 'incarnation', 'transcendent', 'benevolent', 'malevolent', 'omniscient', 'immortality', 'reincarnation', 'divination', 'apocalypse'],
};

// Tier 4 — Technical (levels 31-40)
const TIER4: Pool = {
  nature: ['bioluminescence', 'thermoregulation', 'phytoplankton', 'stratosphere', 'geothermal', 'hydrological', 'topography', 'biogeography'],
  science: ['electromagnetic', 'nanotechnology', 'crystallography', 'biochemistry', 'thermodynamic', 'radioactivity', 'spectroscopy', 'catalytic'],
  space: ['heliocentric', 'astrobiology', 'magnetosphere', 'geostationary', 'interplanetary', 'astrometry', 'planetesimal', 'cosmological'],
  history: ['industrialization', 'geopolitical', 'sovereignty', 'imperialism', 'stratification', 'jurisprudence', 'antiquarian', 'chronology'],
  technology: ['authentication', 'database', 'frontend', 'backend', 'middleware', 'infrastructure', 'virtualization', 'cybersecurity'],
  programming: ['microservice', 'serverless', 'kubernetes', 'containerization', 'asynchronous', 'encapsulation', 'polymorphic', 'idempotent'],
  fantasy: ['unfathomable', 'incorporeal', 'preternatural', 'otherworldly', 'metamorphosis', 'incantation', 'necromancy', 'thaumaturgy'],
  mythology: ['eschatology', 'cosmogony', 'pantheon', 'theogony', 'polytheistic', 'apotheosis', 'hierophant', 'primordial'],
};

// Tier 5 — Expert (level 41+)
const TIER5: Pool = {
  nature: ['biogeochemical', 'chemosynthesis', 'anthropogenic', 'paleoclimatology', 'ecohydrology', 'phylogenetics'],
  science: ['thermonuclear', 'photobiology', 'stoichiometry', 'electrochemistry', 'macromolecular', 'supersymmetry'],
  space: ['circumstellar', 'astrogeology', 'protoplanetary', 'nucleosynthesis', 'relativistic', 'heliospheric'],
  history: ['proto-industrial', 'ethnolinguistic', 'historiography', 'anthropological', 'sociopolitical', 'archaeogenetics'],
  technology: ['synchronization', 'orchestration', 'observability', 'interoperability', 'virtualization', 'decentralization'],
  programming: ['optimization', 'microservices', 'polymorphism', 'metaprogramming', 'multithreading', 'garbage-collection'],
  fantasy: ['transmogrification', 'preternatural', 'otherworldliness', 'necromantic', 'transubstantiation', 'incorporeality'],
  mythology: ['euhemerization', 'cosmogonical', 'hierophantic', 'psychopompery', 'theriomorphic', 'apocatastasis'],
};

const TIERS: Pool[] = [TIER1, TIER2, TIER3, TIER4, TIER5];

function tierIndexForLevel(level: number): number {
  const t = DIFFICULTY_TIERS.find((d) => level >= d.minLevel && level <= d.maxLevel);
  return (t ? t.tier : DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1].tier) - 1;
}

function fullTierPool(tierIndex: number): string[] {
  const pool = TIERS[Math.max(0, Math.min(TIERS.length - 1, tierIndex))];
  return WORD_CATEGORIES.flatMap((c) => pool[c.id]);
}

function preferredPool(tierIndex: number, categories: WordCategory[]): string[] {
  const pool = TIERS[Math.max(0, Math.min(TIERS.length - 1, tierIndex))];
  return categories.flatMap((c) => pool[c] ?? []);
}

export function getTierForLevel(level: number): DifficultyTier {
  return DIFFICULTY_TIERS[tierIndexForLevel(level)];
}

export function getWorldCategories(worldId: WorldId): WordCategory[] {
  return WORLD_CATEGORIES[worldId] ?? [];
}

/**
 * How much of a pool the anti-repeat window is allowed to block. Pool sizes
 * vary a lot by tier (a world draws ~89 words at tier 1 but only ~18 at
 * tier 5), so a fixed window would be harmless early and then swallow the
 * entire expert pool — at which point the filter finds no candidates, falls
 * through to the unfiltered pool, and repetition quietly comes back. Scaling
 * the window to the pool keeps a real gap between repeats at every tier
 * while always leaving something to choose from.
 */
const RECENT_WINDOW_RATIO = 0.6;

/**
 * Picks a word for the given level/world, biased toward that world's themed
 * categories, while avoiding recently-used words so repetition stays low.
 * `recentWords` is the caller's full history (most recent last); only as
 * much of its tail as the pool can afford is actually applied.
 */
export function pickRandomWord(level: number, worldId: WorldId, recentWords: string[] = []): string {
  const tierIndex = tierIndexForLevel(level);
  // Deduped: a few words legitimately belong to two categories (e.g. "code"
  // is both technology and programming), which would otherwise weight them
  // double whenever a world draws on both.
  const preferred = [...new Set(preferredPool(tierIndex, getWorldCategories(worldId)))];
  const full = [...new Set(fullTierPool(tierIndex))];

  const useThemed = preferred.length > 0 && Math.random() < 0.75;
  const basePool = useThemed ? preferred : full;

  const window = Math.max(1, Math.floor(basePool.length * RECENT_WINDOW_RATIO));
  const recentSet = new Set(recentWords.slice(-window));

  let candidates = basePool.filter((w) => !recentSet.has(w));
  if (candidates.length === 0) candidates = full.filter((w) => !recentSet.has(w));
  if (candidates.length === 0) candidates = full;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getWordPoolForLevel(level: number): string[] {
  return fullTierPool(tierIndexForLevel(level));
}
