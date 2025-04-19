import React, { useState, useMemo } from 'react';
import ShopCard from '../../pages/shops/ShopCard';
import AdminMenu from '../Admin/AdminMenu';
import { useFetchShopsQuery } from '../../redux/api/shopApiSlice';

const Mall = () => {
  const { data: shops = [], isLoading, isError } = useFetchShopsQuery();
  const [locationFilter, setLocationFilter] = useState('');

  const filteredShops = useMemo(() => {
    if (!locationFilter) return shops;
    return shops.filter(shop =>
      shop.location.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }, [shops, locationFilter]);

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <AdminMenu />
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Shops 🏬</h2>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {isLoading && <p>Loading shops...</p>}
        {isError && <p>Error loading shops.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mall;
