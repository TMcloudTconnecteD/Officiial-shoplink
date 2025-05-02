import React from 'react';

const Lights = () => {
  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={0.5} />
      
      {/* Directional Light (from the sun) */}
      <directionalLight position={[5, 10, 5]} intensity={1.5} />

      {/* Streetlights */}
      <group>
        <mesh position={[-30, 3, -30]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 10]} />
          <meshStandardMaterial color="yellow" />
          <pointLight position={[0, 5, 0]} intensity={1.5} color="yellow" />
        </mesh>

        <mesh position={[30, 3, -30]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 10]} />
          <meshStandardMaterial color="yellow" />
          <pointLight position={[0, 5, 0]} intensity={1.5} color="yellow" />
        </mesh>
      </group>
    </>
  );
};

export default Lights;
