import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function Billboard({ position, color, w = 0.9, h = 1.6, offset = 0 }: { position: [number, number, number]; color: string; w?: number; h?: number; offset?: number }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + offset) * 0.25;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.08, h, 0.08]} />
        <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, h * 0.75, 0.06]}>
        <planeGeometry args={[w, h * 0.4]} />
        <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.7} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Hologram({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.6;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <torusGeometry args={[0.55, 0.02, 8, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.015, 8, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} wireframe />
      </mesh>
    </group>
  );
}

function FloatingPlatform({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.2;
  });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.14, 1.4]} />
        <meshStandardMaterial color="#1e1b2e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[1.45, 0.02, 1.45]} />
        <meshBasicMaterial color="#e879f9" toneMapped={false} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export default function CyberEnvironment() {
  return (
    <group>
      <Billboard position={[-6.5, 0, -3]} color="#e879f9" offset={0} />
      <Billboard position={[-8, 0, 0.5]} color="#22d3ee" w={0.7} h={1.2} offset={1} />
      <Billboard position={[7, 0, -2.5]} color="#67e8f9" offset={2} />
      <Billboard position={[8.6, 0, 1.2]} color="#f0abfc" w={0.8} h={1.9} offset={0.5} />

      <Hologram position={[-3.2, 1.6, -6.8]} color="#22d3ee" />
      <Hologram position={[3.4, 1.9, -7]} color="#e879f9" />

      <FloatingPlatform position={[-5.5, 0.4, 3]} />
      <FloatingPlatform position={[5.8, 0.55, -1.5]} />
      <FloatingPlatform position={[6.5, 0.3, 3.5]} />

      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 3.4;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.02, Math.sin(angle) * r]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.05, 0.09, 6]} />
            <meshBasicMaterial color="#c026d3" toneMapped={false} transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}
