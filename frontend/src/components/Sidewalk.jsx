import React from 'react';

const Sidewalk = ({ position, rotation = [0, 0, 0], size = [10, 0.2, 3] }) => (
  <mesh position={position} rotation={rotation} receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color="#bfbfbf" />
  </mesh>
);

export default Sidewalk;
