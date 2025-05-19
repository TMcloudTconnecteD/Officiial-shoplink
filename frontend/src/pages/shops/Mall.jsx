import React, { useState, useMemo } from 'react';
import ShopCard from './ShopCard.jsx';
import AdminMenu from '../Admin/AdminMenu';
import { useFetchShopsQuery } from '../../redux/Api/shopApiSlice.js';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice.js';
import Loader from '../../components/Loader.jsx';

const Mall = () => {
  const { data: shops = [], isLoading, isError } = useFetchShopsQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();

  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredShops = useMemo(() => {
    let filtered = shops;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((shop) =>
        selectedCategories.includes(shop.category?._id)
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((shop) =>
        shop.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    return filtered;
  }, [shops, selectedCategories, locationFilter]);

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <AdminMenu />
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Shops 🏬</h2>

        <div className="mb-6 flex flex-col md:flex-row md:space-x-6">
          <div className="mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <label key={category._id} className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => handleCategoryChange(category._id)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded"
                />
                <span className="text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {isLoading && <p>Loading shops...</p>} <Loader />
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
