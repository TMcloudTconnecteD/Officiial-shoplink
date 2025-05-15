import React from 'react';

const GrassPatch = ({ position, size = [10, 0.1, 10] }) => (
  <mesh position={position} receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color="#228B22" />
  </mesh>
);

export default GrassPatch;
