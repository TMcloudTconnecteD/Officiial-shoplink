import React from 'react';

const Balcony = ({ position }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[3, 0.5, 1]} />
    <meshStandardMaterial color="#8B4513" />
  </mesh>
);

const Apartment = ({ position }) => (
  <group position={position}>
    {/* Main building */}
    <mesh castShadow receiveShadow>
      <boxGeometry args={[10, 12, 10]} />
      <meshStandardMaterial color="#999999" />
    </mesh>

    {/* Balconies */}
    <Balcony position={[-4, 3, 5.5]} />
    <Balcony position={[0, 6, 5.5]} />
    <Balcony position={[4, 9, 5.5]} />
  </group>
);

export default Apartment;
