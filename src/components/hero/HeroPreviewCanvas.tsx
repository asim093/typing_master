import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import type { HeroClassId, SkinDef, WeaponDef } from '../../types';
import HeroModel from '../battle/heroes/HeroModel';
import ArenaEnvironment from '../battle/ArenaEnvironment';

interface HeroPreviewCanvasProps {
  heroClass: HeroClassId;
  colors: SkinDef['colors'];
  weapon: WeaponDef;
}

export default function HeroPreviewCanvas({ heroClass, colors, weapon }: HeroPreviewCanvasProps) {
  return (
    <Canvas shadows camera={{ position: [0, 1.35, 4.4], fov: 32 }} dpr={[1, 1.8]}>
      <color attach="background" args={['#0a0714']} />
      <fog attach="fog" args={['#0a0714', 6, 12]} />

      {/* Same fix as the arena: the armour is heavily metallic, and metal
          takes its colour from reflections — with no environment to reflect
          it renders near-black however many lamps you point at it. A light
          neutral studio environment is what actually makes it read as metal
          here, and it's the single biggest reason this preview was dark. */}
      <ArenaEnvironment skyTop="#cfd6e6" skyHorizon="#8e93a8" ground="#3a3550" keyLight="#fff4e2" />

      {/* Three-point studio rig, brighter than the in-battle lighting because
          this is a showcase — the player is here to actually inspect the
          character, not read it at a glance mid-fight. */}
      <hemisphereLight intensity={1.05} color="#c9d4ea" groundColor="#2a2340" />
      <ambientLight intensity={0.5} color={colors.glow} />
      {/* Key */}
      <directionalLight position={[3, 5, 4]} intensity={2.6} color="#fff2e0" castShadow />
      {/* Fill, opposite the key so the shadow side doesn't go solid black */}
      <directionalLight position={[-4, 2.5, 3]} intensity={1.1} color="#cddcff" />
      {/* Rim/back light to separate the silhouette from the dark backdrop */}
      <directionalLight position={[-1.5, 3.5, -5]} intensity={2.2} color="#ffffff" />
      {/* Skin-tinted accents, kept low so they colour rather than light */}
      <pointLight position={[-2, 1.5, -1]} intensity={1.4} color={colors.accent} distance={9} />
      <pointLight position={[2, 1, 2]} intensity={0.9} color={colors.glow} distance={9} />

      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <HeroModel heroClass={heroClass} colors={colors} weapon={weapon} attackSeed={0} hitSeed={0} victorySeed={0} dying={false} />
        </group>
        {/* Pedestal, deliberately UNLIT.
            It faces straight up into the key light, the hemisphere's sky
            colour and the IBL all at once, so as a standard material it
            washed out to a pale grey that fought the character for
            attention. Darkening the albedo didn't help — with this much
            irradiance even a near-black diffuse surface resolves to mid
            grey, and envMapIntensity only damps reflections, not direct
            light. A basic material renders exactly the colour given
            regardless of the rig, which is what this needs: the hero can be
            lit hard while the stage stays put. Grounding still reads from
            the ContactShadows below, which is its own plane. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[2.2, 40]} />
          <meshBasicMaterial color="#0c0918" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[1.15, 1.22, 48]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={4} blur={2} far={2} frames={1} resolution={256} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={2.2}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.95, 0]}
      />
    </Canvas>
  );
}
