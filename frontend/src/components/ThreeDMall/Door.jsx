import React from 'react';

const Door = ({ position }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[3, 5, 0.2]} />
      <meshStandardMaterial color={0x654321} />
    </mesh>
  );
};

export default Door;
