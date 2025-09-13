import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetFilteredProductsQuery,
  useGetProductsQuery,
} from "../redux/Api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/Api/categoryApiSlice";
import {
  setCategories,
  setProducts,
  setChecked,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./products/ProductCard";
import MallCard from "../components/MallCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import HeaderUpdated from "../components/HeaderUpdated";

const ShopUpdated = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  );

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const categoriesQuery = useFetchCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
  });

  const [priceFilter, setPriceFilter] = useState("");

  const filteredProductsQuery = useGetFilteredProductsQuery(
    { checked, radio },
    {
      refetchOnMountOrArgChange: false,
      refetchOnReconnect: false,
      skip: keyword.length > 0,
    }
  );

  const searchedProductsQuery = useGetProductsQuery(
    { keyword },
    {
      refetchOnMountOrArgChange: false,
      refetchOnReconnect: false,
      skip: keyword.length === 0,
    }
  );

  // Set categories
  useEffect(() => {
    if (categoriesQuery.data) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  // Filter or search logic
  useEffect(() => {
    if (keyword.length > 0) {
      if (searchedProductsQuery.data) {
        let filtered = searchedProductsQuery.data;

        if (priceFilter) {
          filtered = filtered.filter((p) =>
            p.price.toString().includes(priceFilter)
          );
        }

        dispatch(setProducts(filtered));

        if (filtered.length === 0) {
          toast.info("No products found matching your search.");
        }
      }
    } else {
      if (filteredProductsQuery.data) {
        let filtered = filteredProductsQuery.data;

        if (priceFilter) {
          filtered = filtered.filter((p) =>
            p.price.toString().includes(priceFilter)
          );
        }

        dispatch(setProducts(filtered));

        if (filtered.length === 0) {
          toast.info("No products found matching your filters.");
        }
      }
    }
  }, [
    checked,
    radio,
    filteredProductsQuery.data,
    searchedProductsQuery.data,
    priceFilter,
    dispatch,
    keyword,
  ]);

  const handleCheck = (value, id) => {
    const updated = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updated));
  };

  const uniqueBrands = [
    ...new Set(
      (keyword.length > 0
        ? searchedProductsQuery.data
        : filteredProductsQuery.data
      )
        ?.map((p) => p.brand)
        .filter((b) => b !== undefined)
    ),
  ];

  const handleBrandClick = (brand) => {
    const sourceData =
      keyword.length > 0
        ? searchedProductsQuery.data
        : filteredProductsQuery.data;
    const filtered = sourceData?.filter((p) => p.brand === brand);
    dispatch(setProducts(filtered));
  };

  const handlePriceChange = (e) => setPriceFilter(e.target.value);
  const resetFilters = () => window.location.reload();
  const handleMallClick = () => {
    const sourceData =
      keyword.length > 0
        ? searchedProductsQuery.data
        : filteredProductsQuery.data;
    if (sourceData) {
      dispatch(setProducts(sourceData));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-md bg-white">
        <HeaderUpdated />
      </div>

      {/* Content with padding equal to header height */}
      <div className="container mx-auto px-4 pt-28 pb-10">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="bg-[#151515] text-white w-full lg:w-1/4 rounded-2xl p-5 shadow-lg max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-3">Filter by Categories</h2>
            <div className="space-y-2">
              {categories?.map((c) => (
                <div key={c._id} className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => handleCheck(e.target.checked, c._id)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm">{c.name}</label>
                </div>
              ))}
            </div>

            {/* Brands */}
            <h2 className="text-lg font-bold bg-black p-2 rounded mt-6 mb-3 text-center">
              Filter by Brands
            </h2>
            <div className="space-y-2">
              {uniqueBrands?.map((brand) => (
                <div key={brand} className="flex items-center">
                  <input
                    type="radio"
                    id={brand}
                    name="brand"
                    onChange={() => handleBrandClick(brand)}
                    className="w-4 h-4 text-pink-400"
                  />
                  <label htmlFor={brand} className="ml-2 text-sm">
                    {brand}
                  </label>
                </div>
              ))}
            </div>

            {/* Price */}
            <h2 className="text-lg font-bold bg-black p-2 rounded mt-6 mb-3 text-center">
              Filter by Price
            </h2>
            <input
              type="text"
              placeholder="Enter price"
              value={priceFilter}
              onChange={handlePriceChange}
              className="w-full px-3 py-2 text-black rounded"
            />

            <button
              className="mt-4 w-full bg-pink-500 text-white rounded py-2 hover:bg-pink-600 transition"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-6">
              <MallCard onClick={handleMallClick} />
            </div>

            <h2 className="text-xl font-semibold text-center mb-6">
              {products?.length} Products
            </h2>

            {filteredProductsQuery.isLoading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopUpdated;
