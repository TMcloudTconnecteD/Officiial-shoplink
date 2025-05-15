import React, { useState } from 'react';
import InteriorFlatRoof from './InteriorFlatRoof';

const FlatRoofBuilding = ({ position }) => {
  const [inside, setInside] = useState(false);

  const handleEnter = () => {
    setInside(true);
  };

  const handleExit = () => {
    setInside(false);
  };

  return (
    <>
      {!inside ? (
        <group position={position}>
          {/* Building */}
          <mesh castShadow receiveShadow onClick={handleEnter}>
            <boxGeometry args={[8, 6, 8]} />
            <meshStandardMaterial color="#a9a9a9" />
          </mesh>

          {/* Door */}
          <mesh position={[0, -2, 4.1]} castShadow receiveShadow onClick={handleEnter}>
            <boxGeometry args={[2, 4, 0.2]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </group>
      ) : (
        <group position={position}>
          <InteriorFlatRoof />
          <mesh
            position={[0, -3, 6]}
            onClick={handleExit}
            castShadow
            receiveShadow
            >
            <boxGeometry args={[2, 1, 0.1]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </group>
      )}
    </>
  );
};

export default FlatRoofBuilding;
