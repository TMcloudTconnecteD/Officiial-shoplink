import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { useFetchShopsQuery } from "../redux/api/shopApiSlice"; // New API query to fetch shops

import {
  setCategories,
  setShops, // Action to set shops in the Redux state
  setChecked,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ShopCard from "./shops/ShopCard"; // Assuming you have a ShopCard component for rendering shop details

const Malls = () => {
  const dispatch = useDispatch();
  const { categories, shops, checked, radio } = useSelector(
    (state) => state.shop
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");

  // Use the query to fetch shops instead of products
  const filteredShopsQuery = useFetchShopsQuery({
    checked,
    radio,
  });

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  useEffect(() => {
    if (!checked.length || !radio.length) {
      if (!filteredShopsQuery.isLoading) {
        // Filter shops based on categories and price filter
        const filteredShops = filteredShopsQuery.data.filter(
          (shop) => {
            return (
              shop.price.toString().includes(priceFilter) ||
              shop.price === parseInt(priceFilter, 10)
            );
          }
        );  

        dispatch(setShops(filteredShops)); // Set filtered shops in Redux state
      }
    }
  }, [checked, radio, filteredShopsQuery.data, dispatch, priceFilter]);

  const handleBrandClick = (brand) => {
    const shopsByBrand = filteredShopsQuery.data?.filter(
      (shop) => shop.brand === brand
    );
    dispatch(setShops(shopsByBrand));
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  // Add "All Brands" option to uniqueBrands (assuming shops have a brand field)
  const uniqueBrands = [
    ...Array.from(
      new Set(
        filteredShopsQuery.data
          ?.map((shop) => shop.brand)
          .filter((brand) => brand !== undefined)
      )
    ),
  ];

  const handlePriceChange = (e) => {
    // Update the price filter state when the user types in the input field
    setPriceFilter(e.target.value);
  };

  return (
    <>
      <div className="container mx-auto">
        <div className="flex md:flex-row">
          <div className="bg-[#151515] p-3 mt-2 mb-2">
            <h2 className="h4 text-center py-2 text-white  bg-black rounded-full mb-2">
              Filter by Categories
            </h2>

            <div className="p-5 w-[15rem]">
              {categories?.map((c) => (
                <div key={c._id} className="mb-2">
                  <div className="flex ietms-center mr-4">
                    <input
                      type="checkbox"
                      id="red-checkbox"
                      onChange={(e) => handleCheck(e.target.checked, c._id)}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />

                    <label
                      htmlFor="pink-checkbox"
                      className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                    >
                      {c.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="h4 text-center py-2 bg-black text-white rounded-full mb-2">
              Filter by Brands
            </h2>

            <div className="p-5">
              {uniqueBrands?.map((brand) => (
                <div className="flex items-enter mr-4 mb-5" key={brand}>
                  <input
                    type="radio"
                    id={brand}
                    name="brand"
                    onChange={() => handleBrandClick(brand)}
                    className="w-4 h-4 text-pink-400 bg-gray-100 border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />

                  <label
                    htmlFor="pink-radio"
                    className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>

            <h2 className="h4 text-center py-2 bg-black text-white  rounded-full mb-2">
              Filer by Price
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
              {shops.length === 0 ? (
                <Loader />
              ) : (
                shops?.map((shop) => (
                  <div className="p-3" key={shop._id}>
                    <ShopCard shop={shop} /> {/* Render ShopCard instead of ProductCard */}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Malls;
