import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useGetProductsQuery } from '../redux/api/productApiSlice';
import Shelves from './Shelves';
import WalkingControls from './WalkingControls';

const Product = ({ position, product }) => {
  return (
    <mesh position={position}>
      <planeBufferGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial>
        <Html distanceFactor={10}>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '10px',
            textAlign: 'center'
          }}>
            <img src={product.image} alt={product.name} style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
            <h4>{product.name}</h4>
            <p>${product.price}</p>
          </div>
        </Html>
      </meshBasicMaterial>
    </mesh>
  );
};

const GalleryRoom = () => {
  const { data, isLoading, error } = useGetProductsQuery();

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products.</div>;

  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <WalkingControls />
      <Shelves />
      {/* Products on the shelves */}
      {data.products.map((product, index) => (
        <Product 
          key={product._id}
          product={product}
          position={[index * 2 - 3, 1, 0]} 
        />
      ))}
      <OrbitControls />
    </Canvas>
  );
};

export default GalleryRoom;
