import React from 'react';
import { useFetchShopsQuery } from '../redux/Api/shopApiSlice';
import { Link } from 'react-router-dom';
import Loader from './Loader.jsx';

const ShopList = () => {
  const { data: shops, isLoading, error } = useFetchShopsQuery();

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading shops</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-4">All Shops</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {shops.map(shop => (
          <div key={shop._id} className="bg-white rounded-lg shadow p-4">
            <img src={shop.image} alt={shop.name} className="h-40 w-full object-cover rounded-md mb-2" />
            <h3 className="font-semibold text-lg">{shop.name}</h3>
            <p className="text-gray-600">{shop.location}</p>
            <p className="text-gray-600">{shop.telephone}</p>
            <p className="text-gray-600">Category: {shop.category?.name}</p>
            <Link
              to={`/admin/shop/update/${shop._id}`}
              className="mt-2 inline-block bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
            >
              Update
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopList;
