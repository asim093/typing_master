import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import FallingParticles from './FallingParticles';
import GroundFog from './GroundFog';

function IceCrystal({ position, height, color = '#7dd3fc' }: { position: [number, number, number]; height: number; color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  return (
    <mesh ref={ref} position={position} castShadow>
      <coneGeometry args={[height * 0.28, height, 6]} />
      <meshStandardMaterial color={color} transparent opacity={0.75} roughness={0.1} metalness={0.1} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  );
}

export default function FrozenEnvironment() {
  return (
    <group>
      <IceCrystal position={[-6.5, 1.1, -2]} height={2.2} />
      <IceCrystal position={[-7.8, 0.7, 1.5]} height={1.4} color="#bae6fd" />
      <IceCrystal position={[6.8, 1.3, -1]} height={2.6} />
      <IceCrystal position={[8, 0.6, 2]} height={1.2} color="#e0f2fe" />
      <IceCrystal position={[-3, 0.9, -7.5]} height={1.8} />
      <IceCrystal position={[3.4, 1.0, -7.8]} height={2} color="#bae6fd" />

      {/* frozen terrain plates — low roughness + high metalness is what
          gives them a wet-ice sheen that catches the arena lights */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const r = 4.4;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.03, Math.sin(angle) * r]} rotation={[-Math.PI / 2, 0, angle]}>
            <planeGeometry args={[0.9, 0.6]} />
            <meshStandardMaterial color="#dbeafe" roughness={0.08} metalness={0.65} transparent opacity={0.55} />
          </mesh>
        );
      })}

      {/* A broad polished ice sheet under the fighters. Sitting just above
          the world's own ground plane, its near-mirror finish picks up the
          character key lights and reads as reflective ice without the cost
          of an actual reflection pass. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[8.6, 48]} />
        <meshStandardMaterial color="#a8c8de" roughness={0.1} metalness={0.75} transparent opacity={0.28} />
      </mesh>

      {/* Cold ground mist — slower than the forest's. Layers are additive,
          so opacity has to stay low: stacking five sheets at the forest's
          value washed the whole arena out to near-white. */}
      <GroundFog color="#cfe9ff" layers={3} opacity={0.07} radius={9.5} height={0.6} speed={0.55} />

      <FallingParticles count={140} color="#ffffff" size={0.055} area={[18, 9, 18]} speed={1.1} opacity={0.85} />
    </group>
  );
}
