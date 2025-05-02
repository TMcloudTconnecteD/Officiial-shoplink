import React from 'react';

const Building = ({ position, label, clickable }) => {
  return (
    <mesh position={position} onClick={() => clickable && alert(`Entering ${label}...`)}>
      <boxGeometry args={[4, 6, 4]} />
      <meshStandardMaterial color={clickable ? 'gold' : 'white'} />
    </mesh>
  );
};

export default Building;
