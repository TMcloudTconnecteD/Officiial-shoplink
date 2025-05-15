import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Fan = () => {
  const fanRef = useRef();
  useFrame(() => {
    if (fanRef.current) {
      fanRef.current.rotation.y += 0.05;
    }
  });

  return (
    <mesh ref={fanRef} position={[0, 3, 0]}>
      <boxGeometry args={[0.1, 0.1, 2]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};

const Bench = ({ position }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[3, 0.5, 1]} />
    <meshStandardMaterial color="#8B4513" />
  </mesh>
);

const Church = ({ position }) => (
  <group position={position}>
    {/* Church building */}
    <mesh castShadow receiveShadow>
      <boxGeometry args={[10, 8, 15]} />
      <meshStandardMaterial color="white" />
    </mesh>

    {/* Roof */}
    <mesh position={[0, 5, 0]} rotation={[Math.PI / 4, 0, 0]} castShadow receiveShadow>
      <coneGeometry args={[8, 4, 4]} />
      <meshStandardMaterial color="red" />
    </mesh>

    {/* Fan */}
    <Fan />

    {/* Benches */}
    <Bench position={[-3, 0.25, 3]} />
    <Bench position={[0, 0.25, 3]} />
    <Bench position={[3, 0.25, 3]} />
  </group>
);

export default Church;
