import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Neon sign. The panel pulses, but the thing that actually sells it as a
 * *screen* rather than a glowing rectangle is the scanline sweeping down it
 * and the occasional glitch flicker — signage in this genre is never a
 * steady light source.
 */
function Billboard({ position, color, w = 0.9, h = 1.6, offset = 0 }: { position: [number, number, number]; color: string; w?: number; h?: number; offset?: number }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  const panelH = h * 0.4;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Cheap deterministic "glitch": a short dropout on an irregular beat.
    const glitch = Math.sin(t * 11 + offset * 3) > 0.94 ? 0.25 : 1;
    if (matRef.current) {
      matRef.current.opacity = (0.5 + Math.sin(t * 2 + offset) * 0.25) * glitch;
    }
    if (glowRef.current) {
      glowRef.current.opacity = (0.16 + Math.sin(t * 2 + offset) * 0.08) * glitch;
    }
    if (scanRef.current) {
      // Sweep top-to-bottom, then wrap.
      const p = ((t * 0.55 + offset * 0.3) % 1);
      scanRef.current.position.y = panelH / 2 - p * panelH;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * glitch;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.08, h, 0.08]} />
        <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.4} />
      </mesh>
      <group position={[0, h * 0.75, 0.06]}>
        <mesh>
          <planeGeometry args={[w, panelH]} />
          <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.7} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {/* Bloom halo bleeding past the panel edge */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[w * 1.5, panelH * 1.7]} />
          <meshBasicMaterial
            ref={glowRef}
            color={color}
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        {/* Scanline */}
        <mesh ref={scanRef} position={[0, 0, 0.012]}>
          <planeGeometry args={[w, panelH * 0.09]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
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
      {/* Pulled in from the far edges and pushed back in depth so the signs
          actually sit inside the camera frustum — out at x=±8 they were
          clipped off both sides and all the sign animation went unseen. */}
      <Billboard position={[-5.6, 0, -5]} color="#e879f9" w={1.2} h={2.6} offset={0} />
      <Billboard position={[-7.2, 0, -1.5]} color="#22d3ee" w={0.9} h={1.8} offset={1} />
      <Billboard position={[5.8, 0, -5.4]} color="#67e8f9" w={1.1} h={2.4} offset={2} />
      <Billboard position={[7.4, 0, -1]} color="#f0abfc" w={0.95} h={2.9} offset={0.5} />
      <Billboard position={[-2.2, 0, -9]} color="#a78bfa" w={1.4} h={3.4} offset={1.6} />
      <Billboard position={[2.6, 0, -9.4]} color="#22d3ee" w={1.3} h={3} offset={2.4} />

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
