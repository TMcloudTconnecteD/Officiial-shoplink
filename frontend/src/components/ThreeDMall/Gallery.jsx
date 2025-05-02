import React, { useState } from 'react';

const Gallery = () => {
  const [message, setMessage] = useState('');

  const products = [
    { id: 1, name: 'Product 1', image: '/images/product1.jpg' },
    { id: 2, name: 'Product 2', image: '/images/product2.jpg' },
    // Add more products as needed
  ];

  const handleBuyProduct = (productName) => {
    setMessage(`You have bought: ${productName}`);
  };

  return (
    <div style={styles.galleryContainer}>
      <h2>Product Gallery</h2>
      <div style={styles.productContainer}>
        {products.map((product) => (
          <div key={product.id} style={styles.product}>
            <img src={product.image} alt={product.name} style={styles.productImage} />
            <button onClick={() => handleBuyProduct(product.name)}>Buy</button>
          </div>
        ))}
      </div>
      <p>{message}</p>
    </div>
  );
};

const styles = {
  galleryContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 15px rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
  productContainer: {
    display: 'flex',
    gap: '20px',
  },
  product: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  productImage: {
    width: '200px',
    height: '200px',
    objectFit: 'cover',
  },
};

export default Gallery;
