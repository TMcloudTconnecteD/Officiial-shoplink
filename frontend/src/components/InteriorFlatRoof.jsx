import React from 'react';

const Fan = () => (
  <mesh position={[0, 3, 0]}>
    <boxGeometry args={[0.1, 0.1, 2]} />
    <meshStandardMaterial color="gray" />
  </mesh>
);

const Ceiling = () => (
  <mesh position={[0, 3.5, 0]}>
    <boxGeometry args={[8, 0.2, 8]} />
    <meshStandardMaterial color="#d3d3d3" />
  </mesh>
);

const Shelf = ({ position }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[3, 0.5, 1]} />
    <meshStandardMaterial color="#8B4513" />
  </mesh>
);

const InteriorFlatRoof = () => (
  <group>
    <Fan />
    <Ceiling />
    <Shelf position={[-2, 0, 0]} />
    <Shelf position={[2, 0, 0]} />
  </group>
);

export default InteriorFlatRoof;
