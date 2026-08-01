import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import type { World } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatEngine } from '../../game/useCombatEngine';
import { getSkin } from '../../data/skins';
import { getWeaponForClass } from '../../data/weapons';
import { getBossStatus } from '../../data/enemies';
import { startAmbient, stopAmbient, playSfx } from '../../game/audio';
import Arena3D from '../battle/Arena3D';
import HUD from '../ui/HUD';
import WordDisplay from '../ui/WordDisplay';
import FloatingDamageLayer from '../ui/FloatingDamageLayer';
import EventBanner from '../ui/EventBanner';
import ComboPopupLayer from '../ui/ComboPopupLayer';
import ComboMeter from '../ui/ComboMeter';
import RewardToast from '../ui/RewardToast';
import HitFlashOverlay from '../ui/HitFlashOverlay';
import BossIntroOverlay from '../ui/BossIntroOverlay';
import DefeatOverlay from '../ui/DefeatOverlay';
import ModelLoadingOverlay from '../ui/ModelLoadingOverlay';
import LoadingScreen from '../ui/LoadingScreen';
import SessionSummaryOverlay from '../ui/SessionSummaryOverlay';

interface BattleProps {
  world: World;
  onExit: () => void;
}

export default function Battle({ world, onExit }: BattleProps) {
  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);
  const coins = usePlayerStore((s) => s.coins);
  const bestWpm = usePlayerStore((s) => s.bestWpm);
  const bossesDefeated = usePlayerStore((s) => s.bossesDefeated);
  const heroClass = usePlayerStore((s) => s.heroClass);
  const selectedSkinByHero = usePlayerStore((s) => s.selectedSkinByHero);
  const skin = getSkin(selectedSkinByHero[heroClass]);
  const weapon = getWeaponForClass(heroClass);
  const bossStatus = getBossStatus(world.id, level, bossesDefeated);

  const engine = useCombatEngine(world);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Full tips-and-progress screen for the *first* load only (hero + opening
  // enemy) — after that, model loads for the next random enemy mid-run use
  // the small non-blocking badge instead so a fight in progress never gets
  // interrupted by a full-screen takeover.
  //
  // Hero/enemy GLB components are lazy-loaded (React.lazy) — the dynamic
  // import() itself takes a tick to resolve *before* useGLTF ever registers
  // with THREE's loading manager, so `active` can read false for a moment
  // right at mount even though nothing has actually finished. A flat
  // "wait until quiet" check falls for that gap, so this also requires a
  // minimum time to have passed since the screen mounted.
  const { active: assetsLoading } = useProgress();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const mountedAtRef = useRef(performance.now());
  // Models are now compressed + preloaded on app mount + cached by the
  // service worker, so by the time a player reaches Battle everything is
  // usually already loaded — assetsLoading is false almost immediately. A
  // short minimum display made the screen dismiss before a single tip
  // rotation (every 3400ms, see LoadingScreen) ever happened, so it read as
  // "doesn't show at all" even though it technically rendered. This holds
  // long enough to comfortably see a tip change before dropping into battle.
  const MIN_DISPLAY_MS = 4200;
  const QUIET_MS = 700;

  useEffect(() => {
    if (initialLoadDone || assetsLoading) return;
    const elapsed = performance.now() - mountedAtRef.current;
    const wait = Math.max(QUIET_MS, MIN_DISPLAY_MS - elapsed);
    const t = window.setTimeout(() => setInitialLoadDone(true), wait);
    return () => window.clearTimeout(t);
  }, [assetsLoading, initialLoadDone]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [engine.phase]);

  // Give the hero's death animation (2.96s, see Hero2GLB) room to actually
  // play out before the defeat popup covers the screen, plus a beat to let
  // the fallen pose register instead of cutting straight to UI.
  const DEATH_ANIM_DURATION_MS = 2960;
  const DEFEAT_OVERLAY_DELAY_MS = DEATH_ANIM_DURATION_MS + 3000;
  const [showDefeatOverlay, setShowDefeatOverlay] = useState(false);

  useEffect(() => {
    if (engine.phase !== 'defeat') {
      setShowDefeatOverlay(false);
      return;
    }
    const t = window.setTimeout(() => setShowDefeatOverlay(true), DEFEAT_OVERLAY_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [engine.phase]);

  useEffect(() => {
    startAmbient(world.id);
    return () => stopAmbient();
  }, [world.id]);

  const focusInput = () => inputRef.current?.focus();

  // Mobile has no physical keyboard, so the on-screen one has to be summoned
  // by focusing the input — and browsers only honour focus() inside a real
  // user gesture. onClick alone is unreliable on touch (it fires late, after
  // the gesture window on some browsers), so touchend is handled explicitly.
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const requestExit = () => {
    playSfx('uiClick');
    setShowSummary(true);
  };

  return (
    <div
      className="relative w-full h-full"
      onClick={focusInput}
      onTouchEnd={(e) => {
        // Don't steal the tap from real controls (Exit, overlay buttons).
        if ((e.target as HTMLElement).closest('button')) return;
        focusInput();
      }}
    >
      <Arena3D
        world={world}
        enemy={engine.enemy}
        heroClass={heroClass}
        heroColors={skin.colors}
        weapon={weapon}
        phase={engine.phase}
        shakeSeed={engine.shakeSeed}
        heroAttackSeed={engine.heroAttackSeed}
        heroVictorySeed={engine.heroVictorySeed}
        enemyHitSeed={engine.enemyHitSeed}
        enemyHitCrit={engine.enemyHitCrit}
        playerHitSeed={engine.playerHitSeed}
      />

      <ModelLoadingOverlay variant="badge" />

      <HitFlashOverlay
        enemyHitSeed={engine.enemyHitSeed}
        enemyHitCrit={engine.enemyHitCrit}
        playerHitSeed={engine.playerHitSeed}
        playerHitSpecial={engine.playerHitSpecial}
      />

      <HUD
        world={world}
        level={level}
        xp={xp}
        coins={coins}
        playerHp={engine.playerHp}
        playerMaxHp={engine.playerMaxHp}
        enemy={engine.enemy}
        wpm={bestWpm}
        accuracy={engine.sessionAccuracy}
        bossStatus={bossStatus}
        runEnemiesDefeated={engine.runEnemiesDefeated}
        runStartTime={engine.runStartTime}
        onExit={requestExit}
      />

      <FloatingDamageLayer damages={engine.floatingDamages} />
      <EventBanner events={engine.events} />
      <ComboPopupLayer popups={engine.popups} />
      <RewardToast rewards={engine.rewards} />

      {engine.phase === 'fighting' && (
        // Sits high enough that the mobile on-screen keyboard (which eats
        // roughly the bottom 40% of a phone screen) can't cover the word
        // being typed. Drops back down to a comfortable margin on desktop.
        <div className="absolute inset-x-0 bottom-[42vh] sm:bottom-16 flex flex-col items-center gap-2 sm:gap-3 z-10 px-3 pointer-events-none">
          <ComboMeter combo={engine.combo} />
          <WordDisplay
            word={engine.currentWord}
            typed={engine.typedInput}
            wordStart={engine.wordStart}
            wordDeadline={engine.wordDeadline}
            active={engine.phase === 'fighting'}
          />
        </div>
      )}

      {/* Mobile-only affordance: until the keyboard is up there is nothing
          on screen telling a touch player how to play at all. */}
      {engine.phase === 'fighting' && !keyboardOpen && (
        <div className="sm:hidden absolute inset-x-0 bottom-8 flex justify-center z-20 pointer-events-none px-4">
          <div className="rounded-full bg-violet-500/90 text-white text-sm font-bold px-5 py-2.5 shadow-lg animate-pulse">
            Tap anywhere to start typing
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        value={engine.typedInput}
        onChange={(e) => engine.handleInputChange(e.target.value)}
        onFocus={() => setKeyboardOpen(true)}
        onBlur={() => setKeyboardOpen(false)}
        inputMode="text"
        enterKeyHint="go"
        // Invisible but NOT pointer-events-none/zero-size: a touch device
        // needs a real, focusable target to open the keyboard. 16px font is
        // what stops iOS auto-zooming the whole page on focus.
        style={{ fontSize: '16px' }}
        className="absolute bottom-0 left-0 w-full h-12 opacity-0 z-0"
        aria-label="Type the word shown on screen"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <AnimatePresence>
        {engine.phase === 'bossIntro' && engine.enemy && (
          <BossIntroOverlay
            boss={engine.enemy}
            worldAccent={world.colors.accent}
            onFight={() => {
              engine.beginFightingAfterIntro();
              focusInput();
            }}
          />
        )}
        {showDefeatOverlay && (
          <DefeatOverlay
            wordsTyped={engine.runWordsTyped}
            wpm={bestWpm}
            accuracy={engine.sessionAccuracy}
            onRetry={() => {
              engine.retryAfterDefeat();
              focusInput();
            }}
            onExit={onExit}
          />
        )}
        {showSummary && (
          <SessionSummaryOverlay
            xpEarned={engine.runXpEarned}
            coinsEarned={engine.runCoinsEarned}
            accuracy={engine.sessionAccuracy}
            wpm={engine.sessionWpm}
            crits={engine.runCrits}
            bestCombo={engine.runBestCombo}
            wordsTyped={engine.runWordsTyped}
            enemiesDefeated={engine.runEnemiesDefeated}
            unlocks={engine.runUnlocks}
            elapsedMs={performance.now() - engine.runStartTime}
            onContinue={onExit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{!initialLoadDone && <LoadingScreen />}</AnimatePresence>
    </div>
  );
}
