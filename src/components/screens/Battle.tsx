import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { World } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatEngine } from '../../game/useCombatEngine';
import { getSkin } from '../../data/skins';
import { getWeapon } from '../../data/weapons';
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
  const selectedWeapon = usePlayerStore((s) => s.selectedWeapon);
  const skin = getSkin(selectedSkinByHero[heroClass]);
  const weapon = getWeapon(selectedWeapon);
  const bossStatus = getBossStatus(world.id, level, bossesDefeated);

  const engine = useCombatEngine(world);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [engine.phase]);

  useEffect(() => {
    startAmbient(world.id);
    return () => stopAmbient();
  }, [world.id]);

  const focusInput = () => inputRef.current?.focus();

  const requestExit = () => {
    playSfx('uiClick');
    setShowSummary(true);
  };

  return (
    <div className="relative w-full h-full" onClick={focusInput}>
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
        <div className="absolute inset-x-0 bottom-16 flex flex-col items-center gap-3 z-10">
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

      <input
        ref={inputRef}
        value={engine.typedInput}
        onChange={(e) => engine.handleInputChange(e.target.value)}
        className="absolute opacity-0 pointer-events-none w-1 h-1"
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
        {engine.phase === 'defeat' && (
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
    </div>
  );
}
