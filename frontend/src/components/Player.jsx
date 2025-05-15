import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SPEED = 5

const Player = () => {
  const ref = useRef()
  const [keys, setKeys] = useState({})

  useEffect(() => {
    const downHandler = (e) => setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }))
    const upHandler = (e) => setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }))

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return

    const direction = new THREE.Vector3()

    if (keys['w']) direction.z -= 1
    if (keys['s']) direction.z += 1
    if (keys['a']) direction.x -= 1
    if (keys['d']) direction.x += 1

    direction.normalize().multiplyScalar(SPEED * delta)
    ref.current.position.add(direction)
  })

  return (
    <mesh ref={ref} position={[0, 1, 10]} castShadow>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="deepskyblue" />
    </mesh>
  )
}

export default Player
