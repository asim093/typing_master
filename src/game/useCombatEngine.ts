import { useCallback, useEffect, useRef, useState } from 'react';
import type { BossDef, EnemyShape, FloatingDamage, RewardBundle, World } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { ENEMIES, BOSSES, getRandomEnemyForWorld } from '../data/enemies';
import { getSkin } from '../data/skins';
import { getWeapon } from '../data/weapons';
import { pickRandomWord } from '../data/words';
import { triggerFreeze, triggerSlowMo } from './timeScale';
import { playSfx, playHeroSword, playEnemySword } from './audio';
import {
  computeWordDamage,
  coinsForEnemy,
  maxHealthFor,
  scaledEnemyDamage,
  scaledEnemyHp,
  wordTimeLimitMs,
  xpForEnemy,
} from './combat';

export type BattlePhase = 'bossIntro' | 'fighting' | 'victoryPause' | 'defeat';

export interface EnemyRuntime {
  defId: string;
  name: string;
  title?: string;
  color: string;
  accentColor: string;
  shape: EnemyShape;
  isBoss: boolean;
  maxHp: number;
  hp: number;
  damage: number;
  attackIntervalMs: number;
  specialAttackName?: string;
}

export interface CombatEvent {
  id: number;
  text: string;
  kind: 'levelup' | 'boss' | 'achievement' | 'victory' | 'special';
}

export interface ComboPopup {
  id: number;
  text: string;
  kind: 'critical' | 'perfect' | 'combo' | 'bossDefeat' | 'best';
}

export interface RunStats {
  startedAt: number;
  wordsTyped: number;
  enemiesDefeated: number;
  xpEarned: number;
  coinsEarned: number;
  crits: number;
  bestCombo: number;
  unlocks: string[];
}

let floatingId = 0;
let eventId = 0;
let popupId = 0;
let rewardId = 0;

function findBoss(worldId: string, level: number, defeated: string[]): BossDef | undefined {
  return BOSSES.find((b) => b.worldId === worldId && level >= b.level && !defeated.includes(b.id));
}

export function useCombatEngine(world: World) {
  const player = usePlayerStore();
  const [phase, setPhase] = useState<BattlePhase>('fighting');
  const [enemy, setEnemy] = useState<EnemyRuntime | null>(null);
  const [playerHp, setPlayerHp] = useState(() => maxHealthFor(player.level, player.skills));
  const [playerMaxHp, setPlayerMaxHp] = useState(() => maxHealthFor(player.level, player.skills));
  const [currentWord, setCurrentWord] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [combo, setCombo] = useState(0);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [events, setEvents] = useState<CombatEvent[]>([]);
  const [popups, setPopups] = useState<ComboPopup[]>([]);
  const [rewards, setRewards] = useState<RewardBundle[]>([]);
  const [shakeSeed, setShakeSeed] = useState(0);
  const [enemyHitSeed, setEnemyHitSeed] = useState(0);
  const [enemyHitCrit, setEnemyHitCrit] = useState(false);
  const [playerHitSeed, setPlayerHitSeed] = useState(0);
  const [playerHitSpecial, setPlayerHitSpecial] = useState(false);
  const [enemyCritSeed, setEnemyCritSeed] = useState(false);
  const [heroAttackSeed, setHeroAttackSeed] = useState(0);
  const [heroVictorySeed, setHeroVictorySeed] = useState(0);
  const [runWordsTyped, setRunWordsTyped] = useState(0);
  const [sessionAccuracy, setSessionAccuracy] = useState(100);
  const [runEnemiesDefeated, setRunEnemiesDefeated] = useState(0);
  const [runXpEarned, setRunXpEarned] = useState(0);
  const [runCoinsEarned, setRunCoinsEarned] = useState(0);
  const [runCrits, setRunCrits] = useState(0);
  const [runBestCombo, setRunBestCombo] = useState(0);
  const [runUnlocks, setRunUnlocks] = useState<string[]>([]);
  const [sessionWpm, setSessionWpm] = useState(0);
  const [runStartTime] = useState(() => performance.now());

  const wordDeadlineRef = useRef<number>(0);
  const wordStartRef = useRef<number>(0);
  const recentWordsRef = useRef<string[]>([]);
  const mistakesRef = useRef(0);
  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);
  const enemyAttackCountRef = useRef(0);
  const runStartRef = useRef(performance.now());
  const runCorrectCharsRef = useRef(0);
  const pausedRef = useRef(false);

  const pushEvent = useCallback((text: string, kind: CombatEvent['kind']) => {
    const id = ++eventId;
    setEvents((prev) => [...prev.slice(-4), { id, text, kind }]);
    window.setTimeout(() => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }, 2600);
  }, []);

  const pushPopup = useCallback((text: string, kind: ComboPopup['kind']) => {
    const id = ++popupId;
    setPopups((prev) => [...prev.slice(-2), { id, text, kind }]);
    window.setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 950);
  }, []);

  const pushReward = useCallback((title: string, lines: RewardBundle['lines']) => {
    const id = ++rewardId;
    setRewards((prev) => [...prev, { id, title, lines }]);
    window.setTimeout(() => {
      setRewards((prev) => prev.filter((r) => r.id !== id));
    }, 4200);
  }, []);

  const pushFloating = useCallback((value: number, crit: boolean, target: 'enemy' | 'player') => {
    const id = ++floatingId;
    setFloatingDamages((prev) => [
      ...prev,
      { id, value, crit, target, x: (Math.random() - 0.5) * 60, y: 0 },
    ]);
    window.setTimeout(() => {
      setFloatingDamages((prev) => prev.filter((d) => d.id !== id));
    }, 1100);
  }, []);

  const spawnWord = useCallback((level: number) => {
    const word = pickRandomWord(level, world.id, recentWordsRef.current);
    recentWordsRef.current = [...recentWordsRef.current, word].slice(-18);
    setCurrentWord(word);
    setTypedInput('');
    mistakesRef.current = 0;
    wordStartRef.current = performance.now();
    wordDeadlineRef.current = performance.now() + wordTimeLimitMs(word.length, level);
  }, [world.id]);

  const spawnEncounter = useCallback(() => {
    const level = usePlayerStore.getState().level;
    const defeated = usePlayerStore.getState().bossesDefeated;
    const boss = findBoss(world.id, level, defeated);

    if (boss) {
      const hp = Math.round(scaledEnemyHp(40, boss.level) * boss.hpMultiplier);
      const dmg = Math.round(scaledEnemyDamage(6, boss.level) * boss.damageMultiplier);
      setEnemy({
        defId: boss.id,
        name: boss.name,
        title: boss.title,
        color: boss.color,
        accentColor: boss.accentColor,
        shape: boss.shape,
        isBoss: true,
        maxHp: hp,
        hp,
        damage: dmg,
        attackIntervalMs: 3400,
        specialAttackName: boss.specialAttackName,
      });
      enemyAttackCountRef.current = 0;
      setPhase('bossIntro');
      playSfx('bossRoar');
      return;
    }

    const def = getRandomEnemyForWorld(world) ?? ENEMIES[0];
    const hp = scaledEnemyHp(def.baseHp, level);
    const dmg = scaledEnemyDamage(def.baseDamage, level);
    setEnemy({
      defId: def.id,
      name: def.name,
      color: def.color,
      accentColor: def.accentColor,
      shape: def.shape,
      isBoss: false,
      maxHp: hp,
      hp,
      damage: dmg,
      attackIntervalMs: def.attackIntervalMs,
    });
    setPhase('fighting');
    spawnWord(level);
  }, [world, spawnWord]);

  // Initial spawn + respawn when world changes
  useEffect(() => {
    const level = usePlayerStore.getState().level;
    const mh = maxHealthFor(level, usePlayerStore.getState().skills);
    setPlayerMaxHp(mh);
    setPlayerHp(mh);
    spawnEncounter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world.id]);

  const beginFightingAfterIntro = useCallback(() => {
    const level = usePlayerStore.getState().level;
    setPhase('fighting');
    spawnWord(level);
  }, [spawnWord]);

  const applyPlayerDamage = useCallback((amount: number, isSpecial: boolean) => {
    setPlayerHp((hp) => {
      const next = Math.max(0, hp - amount);
      if (next <= 0) {
        window.setTimeout(() => setPhase('defeat'), 50);
      }
      return next;
    });
    setPlayerHitSeed((s) => s + 1);
    setPlayerHitSpecial(isSpecial);
    setShakeSeed((s) => s + (isSpecial ? 2 : 1));
    pushFloating(amount, isSpecial, 'player');
    playSfx(isSpecial ? 'bossSpecial' : 'hitPlayer');
    playEnemySword();
  }, [pushFloating]);

  // Enemy periodic attack timer
  useEffect(() => {
    if (!enemy || phase !== 'fighting') return;
    const id = window.setInterval(() => {
      enemyAttackCountRef.current += 1;
      const isSpecial = enemy.isBoss && enemyAttackCountRef.current % 3 === 0;
      const dmg = isSpecial ? Math.round(enemy.damage * 1.8) : enemy.damage;
      if (isSpecial && enemy.specialAttackName) {
        pushEvent(`${enemy.name} uses ${enemy.specialAttackName}!`, 'special');
        setEnemyCritSeed((s) => !s);
      }
      applyPlayerDamage(dmg, isSpecial);
    }, enemy.attackIntervalMs);
    return () => window.clearInterval(id);
  }, [enemy, phase, applyPlayerDamage, pushEvent]);

  // Word timeout watcher
  useEffect(() => {
    if (phase !== 'fighting') return;
    let raf: number;
    const loop = () => {
      if (!pausedRef.current && performance.now() > wordDeadlineRef.current && wordDeadlineRef.current > 0) {
        handleTimeout();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentWord]);

  const handleTimeout = useCallback(() => {
    if (!enemy) return;
    wordDeadlineRef.current = Number.POSITIVE_INFINITY;
    setCombo(0);
    const dmg = Math.max(3, Math.round(enemy.damage * 0.6));
    applyPlayerDamage(dmg, false);
    pushEvent('Too slow!', 'special');
    const level = usePlayerStore.getState().level;
    spawnWord(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemy, currentWord, applyPlayerDamage, pushEvent, spawnWord]);

  const finishEnemy = useCallback((defeatedEnemy: EnemyRuntime) => {
    const store = usePlayerStore.getState();
    const coins = coinsForEnemy(defeatedEnemy.maxHp) * (defeatedEnemy.isBoss ? 4 : 1);
    const xp = xpForEnemy(defeatedEnemy.maxHp, defeatedEnemy.isBoss);
    store.recordEnemyDefeated();
    if (defeatedEnemy.isBoss) store.recordBossDefeated(defeatedEnemy.defId);

    const result = store.addXp(xp, coins);
    setRunEnemiesDefeated((n) => n + 1);
    setRunXpEarned((n) => n + xp);
    setRunCoinsEarned((n) => n + coins);
    if (result.newlyUnlockedSkins.length || result.newlyUnlockedWeapons.length || result.newlyUnlockedWorld) {
      setRunUnlocks((prev) => [
        ...prev,
        ...result.newlyUnlockedSkins.map((id) => `Skin: ${getSkin(id).name}`),
        ...result.newlyUnlockedWeapons.map((id) => `Weapon: ${getWeapon(id).name}`),
        ...(result.newlyUnlockedWorld ? [`World Unlocked`] : []),
      ]);
    }

    const rewardLines: RewardBundle['lines'] = [{ id: 1, label: `+${coins} Coins`, icon: 'coin' }];
    if (defeatedEnemy.isBoss) rewardLines.unshift({ id: 0, label: `${defeatedEnemy.name} Defeated!`, icon: 'crown' });
    for (const skinId of result.newlyUnlockedSkins) {
      const skin = getSkin(skinId);
      rewardLines.push({ id: rewardLines.length + 1, label: `Skin Unlocked: ${skin.name}`, icon: 'skin' });
    }
    for (const weaponId of result.newlyUnlockedWeapons) {
      const weapon = getWeapon(weaponId);
      rewardLines.push({ id: rewardLines.length + 1, label: `New Weapon: ${weapon.name}`, icon: 'weapon' });
    }
    if (result.leveledUp) {
      rewardLines.push({ id: rewardLines.length + 1, label: `Level Up! Level ${result.newLevel}`, icon: 'star' });
    }
    if (defeatedEnemy.isBoss || result.leveledUp || result.newlyUnlockedSkins.length || result.newlyUnlockedWeapons.length) {
      pushReward(defeatedEnemy.isBoss ? 'Boss Defeated!' : 'Rewards', rewardLines);
    }

    pushEvent(
      defeatedEnemy.isBoss ? `${defeatedEnemy.name} defeated! +${xp} XP +${coins} coins` : `+${xp} XP  +${coins} coins`,
      'victory',
    );
    if (result.leveledUp) {
      pushEvent(`Level up! Level ${result.newLevel}`, 'levelup');
      const mh = maxHealthFor(result.newLevel, store.skills);
      setPlayerMaxHp(mh);
      setPlayerHp(mh);
    }
    if (defeatedEnemy.isBoss) {
      pushEvent(`Boss defeated: ${defeatedEnemy.name}!`, 'boss');
      pushPopup('BOSS DEFEATED', 'bossDefeat');
      playSfx('victoryFanfare');
      triggerFreeze(160);
      triggerSlowMo(0.2, 900);
    } else {
      playSfx('enemyDefeat');
      triggerFreeze(70);
      triggerSlowMo(0.35, 400);
    }

    setHeroVictorySeed((s) => s + 1);
    setPhase('victoryPause');
    window.setTimeout(() => {
      spawnEncounter();
    }, 900);
  }, [pushEvent, pushPopup, pushReward, spawnEncounter]);

  const handleWordComplete = useCallback(() => {
    if (!enemy) return;
    const level = usePlayerStore.getState().level;
    const skills = usePlayerStore.getState().skills;
    const wordLen = currentWord.length;
    const accuracyRatio = Math.max(0, Math.min(1, (wordLen - mistakesRef.current) / wordLen));
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    setRunBestCombo((b) => Math.max(b, nextCombo));
    const prevBestCombo = usePlayerStore.getState().bestCombo;
    const comboIsBest = usePlayerStore.getState().recordCombo(nextCombo);
    if (comboIsBest && prevBestCombo > 0) {
      pushPopup(`NEW BEST COMBO: ${nextCombo}`, 'best');
    }

    const { damage, crit } = computeWordDamage(wordLen, nextCombo, accuracyRatio, skills);
    setHeroAttackSeed((s) => s + 1);
    setEnemyHitSeed((s) => s + 1);
    setEnemyHitCrit(crit);
    setShakeSeed((s) => s + (crit ? 2 : 1));
    pushFloating(damage, crit, 'enemy');
    playSfx(crit ? 'critHit' : 'swordHit');
    playHeroSword();

    if (crit) {
      setRunCrits((n) => n + 1);
      pushPopup('CRITICAL HIT', 'critical');
      triggerFreeze(45);
    } else {
      const elapsed = performance.now() - wordStartRef.current;
      const limit = wordDeadlineRef.current - wordStartRef.current;
      if (mistakesRef.current === 0 && limit > 0 && elapsed < limit * 0.45) {
        pushPopup('PERFECT', 'perfect');
      }
    }
    if (nextCombo > 0 && nextCombo % 10 === 0) {
      pushPopup(`${nextCombo} HIT COMBO`, 'combo');
    }

    // small per-word XP trickle
    const wordXp = Math.max(1, Math.round(wordLen * 0.5));
    usePlayerStore.getState().addXp(wordXp);
    setRunXpEarned((n) => n + wordXp);

    setRunWordsTyped((n) => n + 1);
    usePlayerStore.getState().recordWordsTyped(1);
    runCorrectCharsRef.current += wordLen;
    const elapsedMin = Math.max(0.001, (performance.now() - runStartRef.current) / 60000);
    const wpm = Math.round((runCorrectCharsRef.current / 5) / elapsedMin);
    setSessionWpm(wpm);
    const prevBestWpm = usePlayerStore.getState().bestWpm;
    const wpmIsBest = usePlayerStore.getState().updateBestWpm(wpm);
    if (wpmIsBest && prevBestWpm > 0) {
      pushPopup(`NEW BEST: ${wpm} WPM`, 'best');
    }

    const newHp = Math.max(0, enemy.hp - damage);
    setEnemy((e) => (e ? { ...e, hp: newHp } : e));

    if (newHp <= 0) {
      finishEnemy({ ...enemy, hp: 0 });
    } else {
      spawnWord(level);
    }
  }, [enemy, currentWord, combo, pushFloating, pushPopup, finishEnemy, spawnWord]);

  const handleInputChange = useCallback((value: string) => {
    if (phase !== 'fighting') return;
    if (value.length > typedInput.length) {
      const idx = value.length - 1;
      totalKeystrokesRef.current += 1;
      if (currentWord[idx] === value[idx]) {
        correctKeystrokesRef.current += 1;
      } else {
        mistakesRef.current += 1;
        playSfx('typeError');
      }
      const acc = Math.round((correctKeystrokesRef.current / Math.max(1, totalKeystrokesRef.current)) * 100);
      setSessionAccuracy(acc);
      usePlayerStore.getState().updateBestAccuracy(acc);
    }
    setTypedInput(value);
    if (value === currentWord) {
      handleWordComplete();
    }
  }, [phase, typedInput, currentWord, handleWordComplete]);

  const retryAfterDefeat = useCallback(() => {
    const level = usePlayerStore.getState().level;
    const mh = maxHealthFor(level, usePlayerStore.getState().skills);
    setPlayerMaxHp(mh);
    setPlayerHp(mh);
    setCombo(0);
    spawnEncounter();
  }, [spawnEncounter]);

  return {
    phase,
    enemy,
    playerHp,
    playerMaxHp,
    currentWord,
    typedInput,
    combo,
    floatingDamages,
    events,
    popups,
    rewards,
    shakeSeed,
    enemyHitSeed,
    enemyHitCrit,
    playerHitSeed,
    playerHitSpecial,
    enemyCritSeed,
    heroAttackSeed,
    heroVictorySeed,
    runWordsTyped,
    sessionAccuracy,
    sessionWpm,
    runStartTime,
    runEnemiesDefeated,
    runXpEarned,
    runCoinsEarned,
    runCrits,
    runBestCombo,
    runUnlocks,
    wordDeadline: wordDeadlineRef,
    wordStart: wordStartRef,
    handleInputChange,
    beginFightingAfterIntro,
    retryAfterDefeat,
  };
}
