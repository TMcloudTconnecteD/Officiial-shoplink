import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopCard from '../../pages/shops/ShopCard.jsx';
import { useFetchShopsQuery } from '../../redux/Api/shopApiSlice';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import Loader from '../../components/Loader.jsx';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';

const Mall = () => {
  const navigate = useNavigate();
  const { data: shops = [], isLoading, isError } = useFetchShopsQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();

  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Get unique locations for radio buttons
  const locations = useMemo(() => {
    const unique = [...new Set(shops.map(shop => shop.location))];
    return unique;
  }, [shops]);

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
      filtered = filtered.filter((shop) => shop.location === locationFilter);
    }

    return filtered;
  }, [shops, selectedCategories, locationFilter]);

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        {/* Header with Add Shop Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Shops 🏬</h2>
          <button
            onClick={() => navigate('/admin/shop/add')}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md"
          >
            <FaPlus /> Add Shop
          </button>
        </div>

        {/* Location Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <span className="font-semibold mr-2">Filter by Location:</span>
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="location"
              value=""
              checked={locationFilter === ''}
              onChange={() => setLocationFilter('')}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded"
            />
            <span>All</span>
          </label>
          {locations.map((loc, idx) => (
            <label key={idx} className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="location"
                value={loc}
                checked={locationFilter === loc}
                onChange={() => setLocationFilter(loc)}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded"
              />
              <span>{loc}</span>
            </label>
          ))}
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-3">
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

        {/* Loading/Error */}
        {isLoading && <Loader />}
        {isError && <p>Error loading shops.</p>}

        {/* Horizontal Scrollable Shops */}
        <div className="flex overflow-x-auto gap-6 py-4">
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <div key={shop._id} className="flex-shrink-0 w-64">
                <ShopCard shop={shop} />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No shops found for this filter.</p>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-800 font-semibold"
          >
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mall;
