import { useMemo } from 'react';
import { useGetProductsQuery } from '../redux/api/productApiSlice';
import Shelves from './ThreeDMall/Shelves';
import { Text, Box } from '@react-three/drei';

const ProductBox = ({ position, name }) => (
  <group position={position}>
    <Box args={[1, 1, 1]} castShadow receiveShadow>
      <meshStandardMaterial color="lightblue" />
    </Box>
    <Text
      position={[0, 0.6, 0]}
      fontSize={0.2}
      color="black"
      anchorX="center"
      anchorY="middle"
    >
      {name}
    </Text>
  </group>
);

const BuildingInterior = () => {
  const { data, isLoading, error } = useGetProductsQuery();

  const inStockProducts = useMemo(() => {
    if (!data || !data.products) return [];
    return data.products.filter((product) => product.countInStock > 0);
  }, [data]);

  // Arrange products on shelves, 3 per shelf level, 5 shelves total (15 max)
  const productPositions = useMemo(() => {
    const positions = [];
    const shelvesCount = 5;
    const productsPerShelf = 3;
    for (let i = 0; i < Math.min(inStockProducts.length, shelvesCount * productsPerShelf); i++) {
      const shelfIndex = Math.floor(i / productsPerShelf);
      const positionOnShelf = i % productsPerShelf;
      // Shelves are spaced 6 units apart on x axis, shelves at y=0,1,2
      const x = shelfIndex * 6 - 12 + positionOnShelf * 1.5 - 1.5;
      const y = 0.5; // height of product box on shelf
      const z = -5;
      positions.push([x, y, z]);
    }
    return positions;
  }, [inStockProducts]);

  if (isLoading) return null;
  if (error) return <></>;

  return (
    <>
      <Shelves />
      {inStockProducts.slice(0, productPositions.length).map((product, idx) => (
        <ProductBox key={product._id} position={productPositions[idx]} name={product.name} />
      ))}
    </>
  );
};

export default BuildingInterior;
