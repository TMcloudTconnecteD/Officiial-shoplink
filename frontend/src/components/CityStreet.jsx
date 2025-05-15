const CityStreet = () => {
  return (
    <mesh receiveShadow position={[0, -1, 0]}>
      <boxGeometry args={[50, 1, 50]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  )
}

export default CityStreet
