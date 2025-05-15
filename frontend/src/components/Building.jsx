const Building = ({ onEnter }) => {
  return (
    <mesh position={[5, 2.5, -5]} onClick={onEnter} castShadow>
      <boxGeometry args={[5, 5, 5]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default Building
