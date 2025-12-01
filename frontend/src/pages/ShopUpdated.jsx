// src/pages/ShopUpdated.jsx
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
import ProductCard from "../pages/products/ProductCard";
import MallCard from "../components/MallCard";
import { toast } from "react-toastify";
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
  const [collapsedCats, setCollapsedCats] = useState({}); // track which categories collapsed on mobile

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

  useEffect(() => {
    if (categoriesQuery.data) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

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
    const updated = value ? [...checked, id] : checked.filter((c) => c !== id);
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

  // Group products by category id for grouped sections (Alibaba / grouped style)
  const grouped = {};
  products?.forEach((p) => {
    const catId = p.category?._id || "uncategorized";
    if (!grouped[catId]) grouped[catId] = { meta: p.category, items: [] };
    grouped[catId].items.push(p);
  });

  return (
    <div className="min-h-screen bg-glass-hero">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderUpdated />
      </div>

      <div className="pt-28 container mx-auto px-4 pb-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left controls - compact glass panel */}
          <aside className="w-full lg:w-72 order-2 lg:order-1">
            <div className="backdrop-glass rounded-2xl p-4 shadow-lg border border-white/10 sticky top-28">
              <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
                Filters
              </h3>

              <div className="mb-4">
                <p className="text-sm mb-2 text-zinc-600 dark:text-zinc-300">
                  Categories
                </p>
                <div className="space-y-2 max-h-56 overflow-auto pr-2">
                  {categories?.map((c) => (
                    <label
                      key={c._id}
                      className="flex items-center gap-3 text-zinc-800 dark:text-zinc-100"
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => handleCheck(e.target.checked, c._id)}
                        className="w-4 h-4 rounded accent-emerald-400"
                      />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm mb-2 text-zinc-600 dark:text-zinc-300">
                  Brands
                </p>
                <div className="space-y-2">
                  {uniqueBrands?.map((brand) => (
                    <div key={brand} className="flex items-center gap-3">
                      <input
                        type="radio"
                        id={brand}
                        name="brand"
                        onChange={() => handleBrandClick(brand)}
                        className="w-4 h-4 accent-emerald-400"
                      />
                      <label htmlFor={brand} className="text-sm">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm mb-2 text-zinc-600 dark:text-zinc-300">
                  Price
                </p>
                <input
                  type="text"
                  placeholder="e.g. 1500"
                  value={priceFilter}
                  onChange={handlePriceChange}
                  className="w-full px-3 py-2 rounded-lg bg-white/30 placeholder:text-zinc-500 text-zinc-900 dark:bg-black/30"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2 rounded-lg text-sm bg-zinc-800 text-white hover:opacity-90 transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleMallClick}
                  className="flex-1 py-2 rounded-lg text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* small mobile category bar */}
            <div className="mt-6 lg:hidden">
              <div className="overflow-x-auto flex gap-3 py-2">
                {categories?.map((c) => (
                  <button
                    key={c._id}
                    onClick={() =>
                      handleCheck(!checked.includes(c._id), c._id)
                    }
                    className="min-w-max px-3 py-2 backdrop-glass rounded-full text-sm shadow-sm border border-white/8"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 order-1 lg:order-2">
            <div className="mb-6">
              <MallCard onClick={handleMallClick} />
            </div>

            {/* statistics + hero */}
            <div className="mb-6 backdrop-glass rounded-2xl p-4 shadow-md border border-white/8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                 
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Curated and grouped for easy browsing
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    {products?.length || 0} products
                  </div>
                  
                </div>
              </div>
            </div>

            {/* grouped sections */}
            {Object.keys(grouped).length === 0 ? (
              <div className="mt-6">
                {filteredProductsQuery.isLoading ? (
                  <Loader />
                ) : (
                  <p className="text-center text-zinc-600 dark:text-zinc-300">
                    No products found
                  </p>
                )}
              </div>
            ) : (
              Object.entries(grouped).map(([catId, block]) => (
                <section key={catId} className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {block.meta?.name || "Other"}
                    </h2>
                    <button
                      onClick={() =>
                        setCollapsedCats((s) => ({
                          ...s,
                          [catId]: !s[catId],
                        }))
                      }
                      className="text-sm text-emerald-500"
                    >
                      {collapsedCats[catId] ? "Show" : "Hide"}
                    </button>
                  </div>

                  {!collapsedCats[catId] && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {block.items.map((p) => (
                        <ProductCard key={p._id} p={p} />
                      ))}
                    </div>
                  )}
                </section>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopUpdated;
