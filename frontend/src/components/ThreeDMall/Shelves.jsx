import { useMemo } from 'react';
import { Box } from '@react-three/drei';

const Shelf = ({ position }) => (
  <group position={position}>
    {/* Bottom shelf */}
    <Box args={[4, 0.2, 1]} position={[0, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#8B4513" />
    </Box>

    {/* Middle shelf */}
    <Box args={[4, 0.2, 1]} position={[0, 1, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#A0522D" />
    </Box>

    {/* Top shelf */}
    <Box args={[4, 0.2, 1]} position={[0, 2, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#CD853F" />
    </Box>

    {/* Support beams */}
    <Box args={[0.1, 2.5, 0.1]} position={[-1.95, 1, -0.45]}>
      <meshStandardMaterial color="gray" />
    </Box>
    <Box args={[0.1, 2.5, 0.1]} position={[1.95, 1, -0.45]}>
      <meshStandardMaterial color="gray" />
    </Box>
  </group>
);

const Shelves = () => {
  const shelfPositions = useMemo(() => {
    const shelves = [];
    for (let i = 0; i < 5; i++) {
      shelves.push([i * 6 - 12, 0, -5]); // Spread shelves across
    }
    return shelves;
  }, []);

  return (
    <>
      {shelfPositions.map((pos, index) => (
        <Shelf key={index} position={pos} />
      ))}
    </>
  );
};

export default Shelves;
