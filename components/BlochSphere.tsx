
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { BlochCoordinates } from '../types';

interface BlochSphereProps {
  coords: BlochCoordinates;
}

const StateVector: React.FC<{ targetPos: THREE.Vector3 }> = ({ targetPos }) => {
  const meshRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(1, 0, 0)); // Start at +x (mapped)

  useFrame(() => {
    if (meshRef.current) {
      // Smoothly interpolate position for animation
      // We lerp and then normalize to ensure the vector always stays on the surface of the sphere
      // This makes the transition look like a path along the surface
      currentPos.current.lerp(targetPos, 0.1);
      
      // If the vector is near the center (during a polar flip), we nudge it slightly 
      // to ensure the normalization doesn't cause a jump
      if (currentPos.current.length() < 0.1) {
        currentPos.current.add(new THREE.Vector3(0.01, 0, 0));
      }
      
      currentPos.current.normalize();
      
      meshRef.current.lookAt(currentPos.current);
      // Scale it to length 1
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Arrow Shaft */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>
      {/* Arrow Head */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1]}>
        <coneGeometry args={[0.06, 0.15, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

const BlochSphereScene: React.FC<BlochSphereProps> = ({ coords }) => {
  // THREE.js Y is up, but Bloch sphere Z is up. 
  // We'll map Bloch (x, y, z) to Three (x, z, -y)
  const targetPos = useMemo(() => new THREE.Vector3(coords.x, coords.z, -coords.y), [coords]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* The Sphere Shell */}
      <Sphere args={[1, 64, 64]}>
        <meshPhongMaterial 
          color="#1e293b" 
          transparent 
          opacity={0.15} 
          shininess={100}
        />
      </Sphere>
      
      {/* Grid/Wireframe for depth */}
      <Sphere args={[1, 32, 32]}>
        <meshBasicMaterial color="#475569" wireframe transparent opacity={0.1} />
      </Sphere>

      {/* Axes - Corrected mapping for standard visualization where Z is up */}
      {/* Z Axis - Vertical (mapped to Three.js Y) */}
      <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#94a3b8" lineWidth={1} transparent opacity={0.5} />
      <Text position={[0, 1.35, 0]} fontSize={0.12} color="#f8fafc">|0⟩ (+z)</Text>
      <Text position={[0, -1.35, 0]} fontSize={0.12} color="#f8fafc">|1⟩ (-z)</Text>

      {/* X Axis (mapped to Three.js X) */}
      <Line points={[[-1.2, 0, 0], [1.2, 0, 0]]} color="#94a3b8" lineWidth={1} transparent opacity={0.5} />
      <Text position={[1.35, 0, 0]} fontSize={0.1} color="#f8fafc">+x</Text>
      <Text position={[1.0, 0.15, 0]} fontSize={0.08} color="#94a3b8">|+⟩</Text>

      {/* Y Axis (mapped to Three.js -Z) */}
      <Line points={[[0, 0, -1.2], [0, 0, 1.2]]} color="#94a3b8" lineWidth={1} transparent opacity={0.5} />
      <Text position={[0, 0, -1.35]} fontSize={0.1} color="#f8fafc">+y</Text>
      <Text position={[0, 0.15, -1.0]} fontSize={0.08} color="#94a3b8">|i+⟩</Text>

      {/* Equatorial Circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.99, 1.01, 64]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* The State Vector */}
      <StateVector targetPos={targetPos} />

      <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
    </>
  );
};

const BlochSphere: React.FC<BlochSphereProps> = ({ coords }) => {
  return (
    <div className="w-full h-full relative cursor-move bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
      <Canvas camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}>
        <BlochSphereScene coords={coords} />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none select-none">
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Bloch Sphere Visualization</h2>
      </div>
    </div>
  );
};

export default BlochSphere;
