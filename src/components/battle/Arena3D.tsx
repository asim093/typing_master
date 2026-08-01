import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import type { HeroClassId, SkinDef, WeaponDef, World } from '../../types';
import type { BattlePhase, EnemyRuntime } from '../../game/useCombatEngine';
import Hero from './Hero';
import EnemyMesh from './Enemy';
import CameraRig from './CameraRig';
import ParticleBurst from './ParticleBurst';
import ImpactRing from './ImpactRing';
import SlashTelegraph from './SlashTelegraph';
import TimeScaleController from './TimeScaleController';
import WorldEnvironment from './environments/WorldEnvironment';
import LightningFlash from './environments/LightningFlash';
import { ENEMY_POS, HERO_POS, IMPACT_HEIGHT } from './positions';

interface Arena3DProps {
  world: World;
  enemy: EnemyRuntime | null;
  heroClass: HeroClassId;
  heroColors: SkinDef['colors'];
  weapon: WeaponDef;
  phase: BattlePhase;
  shakeSeed: number;
  heroAttackSeed: number;
  heroVictorySeed: number;
  enemyHitSeed: number;
  enemyHitCrit: boolean;
  playerHitSeed: number;
}

export default function Arena3D({
  world,
  enemy,
  heroClass,
  heroColors,
  weapon,
  phase,
  shakeSeed,
  heroAttackSeed,
  heroVictorySeed,
  enemyHitSeed,
  enemyHitCrit,
  playerHitSeed,
}: Arena3DProps) {
  const { colors, lighting } = world;

  return (
    <Canvas shadows camera={{ position: [0, 2.0, 9.0], fov: 36 }} dpr={[1, 1.8]}>
      <color attach="background" args={[colors.sky[1]]} />
      <fog attach="fog" args={[colors.fog, 9, 22]} />
      <CameraRig shakeSeed={shakeSeed} bossIntro={phase === 'bossIntro'} />
      <TimeScaleController />

      <ambientLight intensity={lighting.ambientIntensity} color={colors.glow} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={lighting.directionalIntensity}
        color={lighting.directionalColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 2, -2]} intensity={1.2} color={colors.accent} />
      <pointLight position={[3, 1.5, 2]} intensity={0.8} color={colors.glow} />
      {/* Bright neutral key + fill lights on the hero/enemy so their own model colors read clearly, without needing an outline for readability */}
      <pointLight position={[HERO_POS[0], 2.6, HERO_POS[2] + 2.5]} intensity={9} color="#ffffff" distance={11} decay={1.3} />
      <pointLight position={[HERO_POS[0] - 1.6, 1.6, HERO_POS[2] + 1.8]} intensity={4} color="#ffffff" distance={9} decay={1.3} />
      <pointLight position={[HERO_POS[0] + 1.6, 1.6, HERO_POS[2] + 1.8]} intensity={3} color="#ffffff" distance={9} decay={1.3} />
      <pointLight position={[ENEMY_POS[0], 2.6, ENEMY_POS[2] - 2.5]} intensity={9} color="#ffffff" distance={11} decay={1.3} />
      <pointLight position={[ENEMY_POS[0] + 1.6, 1.6, ENEMY_POS[2] - 1.8]} intensity={4} color="#ffffff" distance={9} decay={1.3} />
      <pointLight position={[ENEMY_POS[0] - 1.6, 1.6, ENEMY_POS[2] - 1.8]} intensity={3} color="#ffffff" distance={9} decay={1.3} />
      {world.weather === 'storm' && <LightningFlash />}

      <Suspense fallback={null}>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[9, 48]} />
          <meshStandardMaterial color={colors.ground} roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <ringGeometry args={[3.1, 3.26, 64]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.35} toneMapped={false} />
        </mesh>

        <ContactShadows position={[0, 0.01, 0]} opacity={0.55} scale={10} blur={2.2} far={4} frames={1} resolution={512} />

        <WorldEnvironment worldId={world.id} />

        <Hero
          heroClass={heroClass}
          colors={heroColors}
          weapon={weapon}
          attackSeed={heroAttackSeed}
          hitSeed={playerHitSeed}
          victorySeed={heroVictorySeed}
        />
        {enemy && (
          <EnemyMesh
            enemy={enemy}
            hitSeed={enemyHitSeed}
            hitCrit={enemyHitCrit}
            attackSeed={playerHitSeed}
            dying={phase === 'victoryPause'}
          />
        )}

        {enemy && (
          <>
            <ParticleBurst
              trigger={enemyHitSeed}
              position={[ENEMY_POS[0] - 0.5, IMPACT_HEIGHT, ENEMY_POS[2]]}
              color={enemyHitCrit ? '#fde047' : colors.accent}
              big={enemy.isBoss || enemyHitCrit}
            />
            <ImpactRing
              trigger={enemyHitSeed}
              position={[ENEMY_POS[0] - 0.4, IMPACT_HEIGHT, ENEMY_POS[2]]}
              color={enemyHitCrit ? '#fde047' : colors.accent}
              big={enemyHitCrit}
            />
          </>
        )}
        <ParticleBurst trigger={playerHitSeed} position={[HERO_POS[0] + 0.5, IMPACT_HEIGHT, HERO_POS[2]]} color="#f87171" />
        <ImpactRing trigger={playerHitSeed} position={[HERO_POS[0] + 0.4, IMPACT_HEIGHT, HERO_POS[2]]} color="#f87171" />
        <SlashTelegraph
          trigger={playerHitSeed}
          position={[HERO_POS[0] + 0.55, IMPACT_HEIGHT + 0.1, HERO_POS[2]]}
          color={enemy?.accentColor ?? '#f87171'}
          big={enemy?.isBoss}
        />
      </Suspense>
    </Canvas>
  );
}
