import React from 'react';
import { Canvas } from '@react-three/fiber';
import Streetlight from './ThreeDMall/Streetlight';
import Apartment from './Apartment';
import School from './School';
import FlatRoofBuilding from './FlatRoofBuilding';
import Building from './Building';
import Sidewalk from './Sidewalk';
import GrassPatch from './GrassPatch';
import WalkingControls from './ThreeDMall/WalkingControls';

const Road = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
    <planeGeometry args={[50, 150]} />
    <meshStandardMaterial color={0x333333} />
  </mesh>
);

const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[150, 150]} />
    <meshStandardMaterial color={0x228b22} />
  </mesh>
);

const City = () => {
  return (
    <Canvas shadows camera={{ position: [0, 5, 15], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />

      <Ground />

      {/* Roads */}
      <Road />

      {/* Sidewalks */}
      <Sidewalk position={[-15, 0.1, -20]} size={[10, 0.2, 40]} />
      <Sidewalk position={[15, 0.1, -20]} size={[10, 0.2, 40]} />
      <Sidewalk position={[0, 0.1, -45]} rotation={[0, Math.PI / 2, 0]} size={[10, 0.2, 60]} />

      {/* Grass patches */}
      <GrassPatch position={[-25, 0, -20]} size={[10, 0.1, 40]} />
      <GrassPatch position={[25, 0, -20]} size={[10, 0.1, 40]} />
      <GrassPatch position={[0, 0, -80]} size={[60, 0.1, 20]} />

      {/* Buildings spaced with realistic gaps */}
      <Apartment position={[-25, 6, -20]} />
      <School position={[-5, 4, -20]} />
      <FlatRoofBuilding position={[15, 3, -20]} />
      <FlatRoofBuilding position={[25, 3, -60]} />

      {/* Additional buildings for context */}
      <Building position={[0, 4, -60]} />
      <Building position={[15, 4, -40]} />

      {/* Streetlights along sidewalks */}
      {[-40, -20, 0, 20].map((z) => (
        <React.Fragment key={z}>
          <Streetlight position={[-20, 3, z]} />
          <Streetlight position={[20, 3, z]} />
        </React.Fragment>
      ))}

      <WalkingControls />
    </Canvas>
  );
};

export default City;
