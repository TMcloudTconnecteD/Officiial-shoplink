import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFetchShopsQuery } from "../redux/api/shopApiSlice"; // Using the new shopApiSlice hook
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";

import {
  setCategories,
  setShops,
  setChecked,
  setSelectedShop, // Added for handling selected shop
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ShopCard from "./shops/ShopCard";

const Malls = () => {
  const dispatch = useDispatch();
  const { categories, shops, checked, radio, selectedShop } = useSelector(
    (state) => state.shop
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");

  const { data: filteredShops, isLoading: shopsLoading } = useFetchShopsQuery({
    checked,
    radio,
    priceFilter,
  });

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  useEffect(() => {
    if (filteredShops && !shopsLoading) {
      dispatch(setShops(filteredShops));
    }
  }, [filteredShops, shopsLoading, dispatch]);

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  const handleShopClick = (shop) => {
    dispatch(setSelectedShop(shop)); // Dispatch action to set the selected shop
  };

  return (
    <div className="container mx-auto">
      <div className="flex md:flex-row">
        <div className="bg-[#151515] p-3 mt-2 mb-2">
          <h2 className="h4 text-center py-2 text-white  bg-black rounded-full mb-2">
            Filter by Categories
          </h2>

          <div className="p-5 w-[15rem]">
            {categories?.map((c) => (
              <div key={c._id} className="mb-2">
                <div className="flex items-center mr-4">
                  <input
                    type="checkbox"
                    id={`category-${c._id}`}
                    onChange={(e) => handleCheck(e.target.checked, c._id)}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor={`category-${c._id}`}
                    className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                  >
                    {c.name}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <h2 className="h4 text-center py-2 bg-black text-white rounded-full mb-2">
            Filter by Price
          </h2>

          <div className="p-5 w-[15rem]">
            <input
              type="text"
              placeholder="Enter Price"
              value={priceFilter}
              onChange={handlePriceChange}
              className="w-full px-3 py-2 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring focus:border-pink-300"
            />
          </div>

          <div className="p-5 pt-0">
            <button
              className="w-full border my-4"
              onClick={() => window.location.reload()}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="p-3">
          <h2 className="h4 text-center mb-2">{shops?.length} Shops</h2>
          <div className="flex flex-wrap">
            {shopsLoading ? (
              <Loader />
            ) : (
              shops?.map((shop) => (
                <div className="p-3" key={shop._id} onClick={() => handleShopClick(shop)}>
                  <ShopCard shop={shop} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Malls;
