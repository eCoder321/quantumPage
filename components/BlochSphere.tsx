
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { BlochCoordinates } from '../types';

interface BlochSphereProps {
  coords: BlochCoordinates;
}

const StateVector: React.FC<{ targetPos: THREE.Vector3 }> = ({ targetPos }) => {
  const meshRef = useRef<THREE.Group>(null);
  const shaftMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const headMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const currentPos = useRef(new THREE.Vector3(0, 1, 0)); 
  const lastTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!targetPos.equals(lastTarget.current)) {
      lastTarget.current.copy(targetPos);
    }
  }, [targetPos]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Snappier lerp (0.22)
      currentPos.current.lerp(targetPos, 0.22);
      
      if (currentPos.current.length() < 0.01) {
        currentPos.current.set(0, 0.01, 0);
      }
      
      currentPos.current.normalize();
      
      // Look at the tip of the vector
      const lookTarget = currentPos.current.clone();
      meshRef.current.lookAt(lookTarget);

      // Glow logic: Intensify emissive color while moving
      const dist = currentPos.current.distanceTo(targetPos);
      const isMoving = dist > 0.005;
      
      const targetShaftIntensity = isMoving ? 4.0 : 0.8;
      const targetHeadIntensity = isMoving ? 6.0 : 1.5;

      if (shaftMatRef.current) {
        shaftMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
          shaftMatRef.current.emissiveIntensity, 
          targetShaftIntensity, 
          0.1
        );
      }
      if (headMatRef.current) {
        headMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
          headMatRef.current.emissiveIntensity, 
          targetHeadIntensity, 
          0.1
        );
      }
    }
  });

  return (
    <group ref={meshRef}>
      {/* Arrow Shaft */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial 
          ref={shaftMatRef}
          color="#38bdf8" 
          emissive="#38bdf8" 
          emissiveIntensity={0.8} 
          toneMapped={false}
        />
      </mesh>
      {/* Arrow Head */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1]}>
        <coneGeometry args={[0.06, 0.15, 12]} />
        <meshStandardMaterial 
          ref={headMatRef}
          color="#38bdf8" 
          emissive="#38bdf8" 
          emissiveIntensity={1.5} 
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

const BlochSphereScene: React.FC<BlochSphereProps> = ({ coords }) => {
  // Map Bloch (x, y, z) to Three (x, z, -y)
  const targetPos = useMemo(() => new THREE.Vector3(coords.x, coords.z, -coords.y), [coords]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1} />

      <group position={[0, -0.4, 0]}>
        {/* Sphere Shell - increased opacity for visibility */}
        <Sphere args={[1, 64, 64]}>
          <meshPhongMaterial 
            color="#334155" 
            transparent 
            opacity={0.25} 
            shininess={50}
            side={THREE.DoubleSide}
          />
        </Sphere>
        
        {/* Grid */}
        <Sphere args={[1.01, 32, 32]}>
          <meshBasicMaterial color="#475569" wireframe transparent opacity={0.15} />
        </Sphere>

        {/* Z Axis */}
        <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#94a3b8" lineWidth={2} transparent opacity={0.6} />
        <Text position={[0, 1.4, 0]} fontSize={0.15} color="white">|0⟩</Text>
        <Text position={[0, -1.4, 0]} fontSize={0.15} color="white">|1⟩</Text>

        {/* X Axis */}
        <Line points={[[-1.2, 0, 0], [1.2, 0, 0]]} color="#ef4444" lineWidth={1} transparent opacity={0.4} />
        <Text position={[1.4, 0, 0]} fontSize={0.12} color="#f8fafc">X</Text>

        {/* Y Axis */}
        <Line points={[[0, 0, -1.2], [0, 0, 1.2]]} color="#10b981" lineWidth={1} transparent opacity={0.4} />
        <Text position={[0, 0, -1.4]} fontSize={0.12} color="#f8fafc">Y</Text>

        {/* Equatorial Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.995, 1.005, 64]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>

        <StateVector targetPos={targetPos} />
      </group>

      <OrbitControls 
        enablePan={false} 
        minDistance={2} 
        maxDistance={6} 
        makeDefault 
        rotateSpeed={0.8}
        target={[0, -0.4, 0]}
      />
    </>
  );
};

const BlochSphere: React.FC<BlochSphereProps> = ({ coords }) => {
  return (
    <div className="w-full h-full min-h-[400px] relative bg-[#020617] overflow-hidden">
      <Canvas 
        camera={{ position: [3, 2, 3], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <BlochSphereScene coords={coords} />
      </Canvas>
      
      {/* Visual Labels */}
      <div className="absolute top-6 right-6 pointer-events-none select-none text-right">
        <div className="flex items-center justify-end gap-2 mb-1">
           <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">3D Qubit Geometry</span>
           <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        </div>
        <h2 className="text-white text-lg font-bold">Bloch Sphere</h2>
      </div>

      <div className="absolute bottom-6 right-6 pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800/50 text-[10px] text-slate-500 font-medium">
          Drag to orbit • Scroll to zoom
        </div>
      </div>
    </div>
  );
};

export default BlochSphere;
