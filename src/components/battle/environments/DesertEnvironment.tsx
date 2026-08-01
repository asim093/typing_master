import FallingParticles from './FallingParticles';
import WindParticles from './WindParticles';
import HeatHaze from './HeatHaze';

function Dune({ position, radius }: { position: [number, number, number]; radius: number }) {
  return (
    <mesh position={position} scale={[1, 0.32, 1]} receiveShadow>
      <sphereGeometry args={[radius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#c2985f" roughness={1} />
    </mesh>
  );
}

function Obelisk({ position, height }: { position: [number, number, number]; height: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[0.55, height, 0.55]} />
        <meshStandardMaterial color="#a9855a" roughness={0.85} />
      </mesh>
      <mesh position={[0, height + 0.25, 0]} castShadow>
        <coneGeometry args={[0.45, 0.5, 4]} />
        <meshStandardMaterial color="#8f6d45" roughness={0.85} />
      </mesh>
    </group>
  );
}

export default function DesertEnvironment() {
  return (
    <group>
      <Dune position={[-7, -0.4, -2]} radius={4} />
      <Dune position={[7.5, -0.5, 1]} radius={4.5} />
      <Dune position={[-5, -0.5, 5.5]} radius={3.5} />
      <Dune position={[0, -0.6, -8]} radius={5} />

      <Obelisk position={[-3, 0, -7.2]} height={2.6} />
      <Obelisk position={[3.4, 0, -7.6]} height={1.9} />
      <mesh position={[0.2, 0.15, -7]} rotation={[0, 0.4, 0.15]}>
        <boxGeometry args={[1.8, 0.3, 1.1]} />
        <meshStandardMaterial color="#8f6d45" roughness={0.9} />
      </mesh>

      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const r = 4.2;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.05, Math.sin(angle) * r]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.16, 8]} />
            <meshStandardMaterial color="#7a5a37" roughness={1} />
          </mesh>
        );
      })}

      {/* Air: slow settling dust, grit driven across on the wind, and heat
          shimmer sitting along the distant ground line. */}
      <FallingParticles count={50} color="#e8c98a" size={0.045} area={[16, 5, 16]} speed={0.15} opacity={0.35} />
      <WindParticles count={90} color="#f0d6a0" size={0.05} area={[22, 4.5, 14]} speed={2.6} opacity={0.4} />
      <HeatHaze color="#ffd9a0" bands={5} opacity={0.07} radius={11} />
    </group>
  );
}
