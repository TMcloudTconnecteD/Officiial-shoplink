import React, { useState, useMemo } from "react";
import ShopCard from "../../pages/shops/ShopCard.jsx";
import { useFetchShopsQuery } from "../../redux/Api/shopApiSlice";
import { useFetchCategoriesQuery } from "../../redux/Api/categoryApiSlice";
import Loader from "../../components/Loader.jsx";

const Mall = () => {
  const { data: shops = [], isLoading, isError } = useFetchShopsQuery();
  const { data: categories = [] } = useFetchCategoriesQuery();

  const [locationFilter, setLocationFilter] = useState("");
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
    <div className="max-w-7xl mx-auto mt-28 px-6">
      <div className="bg-white rounded-2xl shadow-xl p-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">
          All Shops
        </h2>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row md:space-x-6 gap-6">
          <input
            type="text"
            placeholder="Search by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="flex-1 p-4 border border-gray-300 rounded-xl shadow-sm bg-gray-50 focus:ring-2 focus:ring-green-500"
          />

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => handleCategoryChange(category._id)}
                  className="w-5 h-5 text-green-500 rounded"
                />
                <span className="text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {isLoading && <Loader />}
        {isError && <p>Error loading shops.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredShops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mall;
