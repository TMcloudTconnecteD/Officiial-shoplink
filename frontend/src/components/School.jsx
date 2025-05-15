import React from 'react';

const FlagPost = ({ position }) => (
  <mesh position={position} castShadow receiveShadow>
    <cylinderGeometry args={[0.1, 0.1, 5, 8]} />
    <meshStandardMaterial color="brown" />
  </mesh>
);

const Flag = ({ position }) => (
  <mesh position={position} castShadow receiveShadow>
    <planeGeometry args={[2, 1]} />
    <meshStandardMaterial color="red" />
  </mesh>
);

const School = ({ position }) => (
  <group position={position}>
    {/* School building */}
    <mesh castShadow receiveShadow>
      <boxGeometry args={[12, 8, 10]} />
      <meshStandardMaterial color="#f0e68c" />
    </mesh>

    {/* Roof */}
    <mesh position={[0, 5, 0]} rotation={[Math.PI / 4, 0, 0]} castShadow receiveShadow>
      <coneGeometry args={[8, 4, 4]} />
      <meshStandardMaterial color="#8b0000" />
    </mesh>

    {/* Flagpost */}
    <FlagPost position={[-5, 4, 5]} />
    <Flag position={[-5, 6, 5.5]} />
  </group>
);

export default School;
