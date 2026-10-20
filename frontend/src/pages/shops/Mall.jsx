import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ShopCard from '../../pages/shops/ShopCard.jsx';
import { useFetchShopsQuery } from '../../redux/Api/shopApiSlice';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import Loader from '../../components/Loader.jsx';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';

const Mall = () => {
  const navigate = useNavigate();

  const { data: shops = [], isLoading, isError } = useFetchShopsQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const { userInfo } = useSelector((state) => state.auth);

  const [locationFilter, setLocationFilter] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Unique + searchable locations
  const locations = useMemo(() => {
    const unique = [
      ...new Set(
        shops
          .map(shop => shop.location)
          .filter(Boolean)
      ),
    ];

    return unique.filter(loc =>
      loc.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [shops, locationSearch]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const normalizeCategoryName = (category) => {
    if (!category) return 'General';
    if (typeof category === 'string') return category.trim() || 'General';
    if (typeof category?.name === 'string') return category.name.trim() || 'General';
    return 'General';
  };

  const normalizeCategoryId = (category) => {
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (category?._id) return String(category._id);
    return '';
  };

  const filteredShops = useMemo(() => {
    let filtered = shops;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(shop => {
        const shopCategoryId = normalizeCategoryId(shop.category);
        return shopCategoryId && selectedCategories.includes(shopCategoryId);
      });
    }

    if (locationFilter) {
      filtered = filtered.filter(
        shop => shop.location === locationFilter
      );
    }

    return filtered;
  }, [shops, selectedCategories, locationFilter]);

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            All Shops
          </h2>

          {userInfo?.isAdmin && (
            <button
              onClick={() => navigate('/admin/shop/add')}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md"
            >
              <FaPlus />
              Add Shop
            </button>
          )}
        </div>

        {/* Location Filter */}
        <div className="mb-8">
          <p className="font-semibold text-gray-800 mb-3">
            Filter by Location
          </p>

          {/* Location Search */}
          <input
            type="text"
            placeholder="Search location..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="w-full md:w-72 px-3 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="location"
                value=""
                checked={locationFilter === ''}
                onChange={() => setLocationFilter('')}
                className="w-4 h-4 text-pink-600 border-gray-300"
              />
              <span className="text-gray-700">All</span>
            </label>

            {locations.map((loc, idx) => (
              <label
                key={idx}
                className="inline-flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="location"
                  value={loc}
                  checked={locationFilter === loc}
                  onChange={() => setLocationFilter(loc)}
                  className="w-4 h-4 text-pink-600 border-gray-300"
                />
                <span className="text-gray-700">
                  {loc}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <p className="font-semibold text-gray-800 mb-3">
            Filter by Category
          </p>

          <div className="flex flex-wrap gap-4">
            {categories.map(category => {
              const categoryName = normalizeCategoryName(category);
              const categoryId = normalizeCategoryId(category);

              return (
                <label
                  key={categoryId || categoryName}
                  className="inline-flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={categoryId ? selectedCategories.includes(categoryId) : false}
                    onChange={() => handleCategoryChange(categoryId)}
                    className="w-4 h-4 text-pink-600 border-gray-300"
                  />
                  <span className="text-gray-700">
                    {categoryName}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && <Loader />}
        {isError && (
          <p className="text-red-500">
            Error loading shops.
          </p>
        )}

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.length > 0 ? (
            filteredShops.map(shop => (
              <ShopCard key={shop._id} shop={shop} />
            ))
          ) : (
            <p className="text-gray-500">
              No shops found for this filter.
            </p>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-800 font-semibold"
          >
            <FaArrowLeft />
            Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default Mall;
