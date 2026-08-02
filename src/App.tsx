import { useCallback, useEffect, useState } from 'react';
import type { AchievementToast, GameScreen, WorldId } from './types';
import { usePlayerStore } from './store/playerStore';
import { getWorld, getWorldForLevel } from './data/worlds';
import { useAchievementWatcher } from './hooks/useAchievementWatcher';
import { setAudioMuted } from './game/audio';
import { preloadAllRealHeroes, preloadWorld } from './game/modelPreload';
import MainMenu from './components/screens/MainMenu';
import WorldSelect from './components/screens/WorldSelect';
import SkillTree from './components/screens/SkillTree';
import Achievements from './components/screens/Achievements';
import HeroSelect from './components/screens/HeroSelect';
import Profile from './components/screens/Profile';
import HowToPlay from './components/screens/HowToPlay';
import Settings from './components/screens/Settings';
import Battle from './components/screens/Battle';
import AchievementToastLayer from './components/ui/AchievementToastLayer';
import RotatePrompt from './components/ui/RotatePrompt';

let toastId = 0;
const PLAYTIME_TICK_MS = 10000;

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const currentWorldId = usePlayerStore((s) => s.currentWorld);
  const setCurrentWorld = usePlayerStore((s) => s.setCurrentWorld);
  const muted = usePlayerStore((s) => s.muted);
  const addPlayTime = usePlayerStore((s) => s.addPlayTime);
  const recordDailyLogin = usePlayerStore((s) => s.recordDailyLogin);
  const level = usePlayerStore((s) => s.level);
  const [toasts, setToasts] = useState<AchievementToast[]>([]);

  // Start fetching both real hero GLBs + the player's likely world the
  // moment the app opens (main menu, before they've even clicked anything)
  // — by the time they've clicked through a menu or two to reach Battle or
  // Choose Your Hero, it's often already cached instead of loading late.
  useEffect(() => {
    preloadAllRealHeroes();
    preloadWorld(getWorldForLevel(level));
  }, [level]);

  useAchievementWatcher((achievement) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, achievement }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  });

  useEffect(() => {
    setAudioMuted(muted);
  }, [muted]);

  useEffect(() => {
    const id = window.setInterval(() => addPlayTime(PLAYTIME_TICK_MS), PLAYTIME_TICK_MS);
    return () => window.clearInterval(id);
  }, [addPlayTime]);

  useEffect(() => {
    recordDailyLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enterWorld = useCallback(
    (worldId: WorldId) => {
      setCurrentWorld(worldId);
      setScreen('battle');
    },
    [setCurrentWorld],
  );

  return (
    <div className="w-full h-full relative">
      {screen === 'menu' && <MainMenu onNavigate={setScreen} />}
      {screen === 'worldSelect' && <WorldSelect onEnter={enterWorld} onBack={() => setScreen('menu')} />}
      {screen === 'skillTree' && <SkillTree onBack={() => setScreen('menu')} />}
      {screen === 'achievements' && <Achievements onBack={() => setScreen('menu')} />}
      {screen === 'heroSelect' && <HeroSelect onBack={() => setScreen('menu')} />}
      {screen === 'profile' && <Profile onBack={() => setScreen('menu')} />}
      {screen === 'howToPlay' && <HowToPlay onBack={() => setScreen('menu')} />}
      {screen === 'settings' && <Settings onBack={() => setScreen('menu')} onNavigate={setScreen} />}
      {screen === 'battle' && <Battle world={getWorld(currentWorldId)} onExit={() => setScreen('worldSelect')} />}

      <AchievementToastLayer toasts={toasts} />
      <RotatePrompt />
    </div>
  );
}
