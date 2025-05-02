import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const Streetlight = ({ position }) => {
  const lightRef = useRef()

  // Small twinkle animation
  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(Date.now() * 0.002) * 0.5
    }
  })

  return (
    <group>
      {/* Light Pole */}
      <mesh position={[position[0], position[1] - 1, position[2]]}>
        <cylinderGeometry args={[0.1, 0.1, 6]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Light bulb */}
      <mesh position={[position[0], position[1] + 2, position[2]]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial emissive="yellow" emissiveIntensity={5} />
      </mesh>

      {/* Point Light */}
      <pointLight
        ref={lightRef}
        position={[position[0], position[1] + 2, position[2]]}
        intensity={3}
        distance={15}
        color="white"
        castShadow
      />
    </group>
  )
}

export default Streetlight
