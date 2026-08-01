import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import type { HeroClassId, SkinDef, WeaponDef } from '../../types';
import HeroModel from '../battle/heroes/HeroModel';

interface HeroPreviewCanvasProps {
  heroClass: HeroClassId;
  colors: SkinDef['colors'];
  weapon: WeaponDef;
}

export default function HeroPreviewCanvas({ heroClass, colors, weapon }: HeroPreviewCanvasProps) {
  return (
    <Canvas shadows camera={{ position: [0, 1.35, 4.4], fov: 32 }} dpr={[1, 1.8]}>
      <color attach="background" args={['#0a0714']} />
      <fog attach="fog" args={['#0a0714', 5, 10]} />
      <ambientLight intensity={0.6} color={colors.glow} />
      <directionalLight position={[3, 5, 3]} intensity={1.5} color="#fff2e0" castShadow />
      <pointLight position={[-2, 1.5, -1]} intensity={1.2} color={colors.accent} />
      <pointLight position={[2, 1, 2]} intensity={0.7} color={colors.glow} />

      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <HeroModel heroClass={heroClass} colors={colors} weapon={weapon} attackSeed={0} hitSeed={0} victorySeed={0} dying={false} />
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[2.2, 40]} />
          <meshStandardMaterial color="#15101f" roughness={0.8} />
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
