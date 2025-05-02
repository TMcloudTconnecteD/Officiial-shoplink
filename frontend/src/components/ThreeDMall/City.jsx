import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import WalkingControls from './WalkingControls';
import Streetlight from './Streetlight';

const Building = ({ position, onClick, isGallery }) => {
  const doorRef = useRef();
  const [doorOpen, setDoorOpen] = useState(false);
  const doorRotation = useRef(0);

  useFrame(() => {
    if (doorOpen && doorRotation.current < Math.PI / 2) {
      doorRotation.current += 0.02;
      if (doorRef.current) {
        doorRef.current.rotation.y = doorRotation.current;
      }
    }
  });

  const handleBuildingClick = () => {
    if (isGallery) {
      setDoorOpen(true);
      setTimeout(() => {
        onClick();
      }, 1000);
    }
  };

  return (
    <group position={position}>
      {/* Building */}
      <mesh onClick={handleBuildingClick} castShadow receiveShadow>
        <boxGeometry args={[4, 8, 4]} />
        <meshStandardMaterial color={isGallery ? 'lightpink' : 'skyblue'} />
      </mesh>

      {/* Door */}
      {isGallery && (
        <mesh
          ref={doorRef}
          position={[0, -2, 2.1]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.5, 3, 0.1]} />
          <meshStandardMaterial color="brown" />
        </mesh>
      )}
    </group>
  );
};

const ContainerShop = ({ position, doorPosition, onClick, isBeautyParlor }) => {
  const meshRef = useRef();

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow onClick={onClick}>
        <boxGeometry args={[6, 4, 10]} />
        <meshStandardMaterial color={0x8b4513} />
      </mesh>
      <mesh position={doorPosition}>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial color={0x654321} />
      </mesh>
      {isBeautyParlor && (
        <mesh position={[0, 5, 5.5]}>
          <planeGeometry args={[6, 1.5]} />
          <meshBasicMaterial color={'#ff00ff'} />
          {/* For neon sign, a texture or text can be added here */}
        </mesh>
      )}
    </group>
  );
};

const LargeContainerShop = ({ position, doorPosition }) => (
  <group position={position}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[12, 6, 15]} />
      <meshStandardMaterial color={0x8b4513} />
    </mesh>
    <mesh position={doorPosition}>
      <boxGeometry args={[3, 4, 0.2]} />
      <meshStandardMaterial color={0x654321} />
    </mesh>
  </group>
);

const Apartment = ({ position }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[10, 12, 10]} />
    <meshStandardMaterial color={0x999999} />
  </mesh>
);

const Road = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
    <planeGeometry args={[20, 150]} />
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
  const [showGallery, setShowGallery] = useState(false);

  const handleEnterGallery = () => {
    setShowGallery(true);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  return (
    <>
      {!showGallery && (
        <Canvas shadows camera={{ position: [0, 5, 30], fov: 70 }}>
          {/* Lights */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />

          {/* Ground and Road */}
          <Ground />
          <Road />

          {/* Streetlights */}
          {[ -60, -40, -20, 0, 20, 40, 60 ].map((z) => (
            <React.Fragment key={z}>
              <Streetlight position={[-10, 3, z]} />
              <Streetlight position={[10, 3, z]} />
            </React.Fragment>
          ))}

          {/* Container Shops */}
          <ContainerShop
            position={[-20, 2, -40]}
            doorPosition={[-3, -0.5, 0]}
            isBeautyParlor={true}
            onClick={() => alert('Enter Beauty Parlor')}
          />
          <ContainerShop
            position={[-20, 2, -10]}
            doorPosition={[-3, -0.5, 0]}
          />

          {/* Large Container Shop */}
          <LargeContainerShop position={[20, 3, -10]} doorPosition={[6, -1, 0]} />

          {/* Apartment */}
          <Apartment position={[20, 6, 15]} />

          {/* Buildings */}
          <Building position={[-10, 4, -20]} />
          <Building position={[0, 4, -20]} isGallery={true} onClick={handleEnterGallery} />
          <Building position={[10, 4, -20]} />

          {/* Controls */}
          <WalkingControls />
        </Canvas>
      )}
      {showGallery && (
        <div>
          <button onClick={handleCloseGallery} style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}>
            Close Gallery
          </button>
          {/* Gallery component should be rendered here */}
        </div>
      )}
    </>
  );
};

export default City;
