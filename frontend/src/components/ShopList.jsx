import React, { useEffect, useState } from 'react';

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/shops/all', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch shops');
        }
        const data = await response.json();
        setShops(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (loading) return <p>Loading shops...</p>;
  if (error) return <p>Error: {error}</p>;

  if (shops.length === 0) return <p>No shops found.</p>;

  return (
    <div>
      <h2>Shop List</h2>
      <ul>
        {shops.map((shop) => (
          <li key={shop._id}>
            <strong>{shop.name}</strong> - {shop.location} - {shop.telephone}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShopList;
