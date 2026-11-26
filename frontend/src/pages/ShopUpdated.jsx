// src/pages/ShopUpdated.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useGetFilteredProductsQuery,
  useGetProductsQuery,
} from "../redux/Api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/Api/categoryApiSlice";
import { setCategories, setProducts, setChecked } from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "../pages/products/ProductCard";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderUpdated from "../components/HeaderUpdated";
import { FaArrowRight, FaBolt, FaSearch, FaStore, FaTag } from "react-icons/fa";
import { getOptimizedProductImage } from "../utils/imageOptimization";
import { useGetPromoSettingsQuery } from "../redux/Api/marketingApiSlice";
import "./ShopUpdated.css";

const ShopUpdated = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector((state) => state.shop);
  const { userInfo } = useSelector((state) => state.auth);

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";
  const categoryParam = queryParams.get("category") || "";
  const [searchText, setSearchText] = useState(keyword);
  const [sortMode, setSortMode] = useState("featured");
  const { data: promoSettings } = useGetPromoSettingsQuery();

  const categoriesQuery = useFetchCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
  });

  const [priceFilter, setPriceFilter] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchText(keyword);
  }, [keyword]);

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

  // Auto-select category from URL parameter
  useEffect(() => {
    if (categoryParam && categories && categories.length > 0) {
      const categoryObj = categories.find((c) => c.name === categoryParam);
      if (categoryObj && !checked.includes(categoryObj._id)) {
        dispatch(setChecked([...checked, categoryObj._id]));
      }
    }
  }, [categoryParam, categories, checked, dispatch]);

  useEffect(() => {
    if (keyword.length > 0) {
      if (searchedProductsQuery.data) {
        let filtered = searchedProductsQuery.data;
        if (priceFilter) {
          filtered = filtered.filter((p) => p.price.toString().includes(priceFilter));
        }
        dispatch(setProducts(filtered));
        if (filtered.length === 0) toast.info("No products found matching your search.");
      }
    } else {
      if (filteredProductsQuery.data) {
        let filtered = filteredProductsQuery.data;
        if (priceFilter) {
          filtered = filtered.filter((p) => p.price.toString().includes(priceFilter));
        }
        dispatch(setProducts(filtered));
        if (filtered.length === 0) toast.info("No products found matching your filters.");
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
      (keyword.length > 0 ? searchedProductsQuery.data : filteredProductsQuery.data)
        ?.map((p) => p.brand)
        .filter((b) => typeof b === "string" && b.trim())
    ),
  ];

  const handleBrandClick = (brand) => {
    const sourceData = keyword.length > 0 ? searchedProductsQuery.data : filteredProductsQuery.data;
    const filtered = sourceData?.filter((p) => p.brand === brand);
    dispatch(setProducts(filtered));
  };

  const handlePriceChange = (e) => setPriceFilter(e.target.value);

  const resetFilters = () => {
    dispatch(setChecked([]));
    setPriceFilter("");
    const sourceData = keyword.length > 0 ? searchedProductsQuery.data : filteredProductsQuery.data;
    if (sourceData) dispatch(setProducts(sourceData));
  };

  const handleMallClick = () => {
    const sourceData = keyword.length > 0 ? searchedProductsQuery.data : filteredProductsQuery.data;
    if (sourceData) dispatch(setProducts(sourceData));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const value = searchText.trim();
    navigate(value ? `/shop?keyword=${encodeURIComponent(value)}` : "/shop");
  };

  const grouped = {};
  const categoryList = Array.isArray(categories)
    ? categories
    : Array.isArray(categories?.categories) ? categories.categories : [];
  products?.forEach((p) => {
    const catId = normalizeCategoryId(p.category);
    const storedCategory = categoryList.find((category) => String(category?._id) === catId);
    const productCategoryName = p.category && typeof p.category === "object"
      ? p.category.name
      : "";
    const categoryName = storedCategory?.name || productCategoryName;
    const safeCategoryName = (
      typeof categoryName === "string"
      && categoryName.trim()
      && !/^[a-f\d]{24}$/i.test(categoryName.trim())
    ) ? categoryName.trim() : "Other";
    const meta = { name: safeCategoryName };
    if (!grouped[catId]) grouped[catId] = { meta, items: [] };
    grouped[catId].items.push(p);
  });

  const productCount = products?.length || 0;
  const previewProducts = (products || []).slice(0, 3);
  const hasActiveFilters = checked.length > 0 || Boolean(priceFilter) || Boolean(keyword);
  const customer = !userInfo?.isAdmin && !userInfo?.isSuperAdmin;
  const rewardsLink = userInfo ? "/student-friendly" : "/register?redirect=%2Fstudent-friendly";

  return (
    <div className="shop-catalog-page">
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderUpdated />
      </div>

      <main className="shop-catalog-page__content">
        <div className="shop-catalog-page__shell">
          <section className="shop-catalog-hero">
            <div className="shop-catalog-hero__copy">
              <span className="shop-catalog-hero__eyebrow"><FaBolt aria-hidden="true" /> Your next great find starts here</span>
              <h1>Good finds.<br /><span>Closer than you think.</span></h1>
              <p>Explore independent local shops, discover something unexpected, and check out in one place.</p>
              <form className="shop-catalog-hero__search" onSubmit={submitSearch} role="search">
                <FaSearch aria-hidden="true" />
                <input
                  type="search"
                  placeholder="What are you looking for?"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  aria-label="Search products and brands"
                />
                <button type="submit">Search</button>
              </form>
              <div className="shop-catalog-hero__actions">
                <Link to="/shops/all">Explore local shops <FaArrowRight aria-hidden="true" /></Link>
                <span><FaStore aria-hidden="true" /> {productCount} finds ready to explore</span>
              </div>
            </div>
            <div className="shop-catalog-hero__visual" aria-hidden="true">
              <div className="shop-catalog-hero__orbit shop-catalog-hero__orbit--one" />
              <div className="shop-catalog-hero__orbit shop-catalog-hero__orbit--two" />
              {previewProducts.map((product, index) => (
                <div className={`shop-catalog-hero__product shop-catalog-hero__product--${index + 1}`} key={product._id}>
                  <img src={getOptimizedProductImage(product.image, 520)} alt="" />
                  <span>{product.name}</span>
                  <strong>KES {Number(product.price || 0).toLocaleString()}</strong>
                </div>
              ))}
              {!previewProducts.length && <div className="shop-catalog-hero__fallback">Local finds<br />made easy.</div>}
              <span className="shop-catalog-hero__stamp">SHOP LOCAL<br />FIND MORE</span>
            </div>
          </section>

          {customer && promoSettings?.rewardProgramEnabled === true && (
            <section className="shop-reward-banner">
              <span className="shop-reward-banner__icon"><FaTag aria-hidden="true" /></span>
              <div>
                <span className="shop-reward-banner__eyebrow">Good shopping comes back around</span>
                <h2>Earn 10 points on every paid order. Get KES 100 off at 1,000.</h2>
                <p>Rewards are saved to your account email and automatically applied to your next checkout.</p>
              </div>
              <Link to={rewardsLink}>See your rewards <FaArrowRight aria-hidden="true" /></Link>
            </section>
          )}

          <div className="shop-category-bar">
            <div>
              <span className="shop-category-bar__eyebrow">Browse by mood</span>
              <h2>Find your corner</h2>
            </div>
            <div className="shop-category-bar__chips">
              <button
                type="button"
                className={checked.length === 0 ? "is-active" : ""}
                onClick={() => dispatch(setChecked([]))}
              >
                Everything
              </button>
              {categoryList.map((category) => (
                <button
                  type="button"
                  key={category._id}
                  className={checked.includes(category._id) ? "is-active" : ""}
                  onClick={() => handleCheck(!checked.includes(category._id), category._id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="shop-catalog-layout">
            <aside
              id="shop-filters"
              className={`shop-filter-panel ${filtersOpen ? "is-open" : ""}`}
              aria-label="Product filters"
            >
              <div className="shop-filter-panel__heading">
                <div><span>Make it yours</span><h2>Refine your find</h2></div>
                {hasActiveFilters && <button type="button" onClick={resetFilters}>Clear all</button>}
              </div>
              <section className="shop-filter-panel__group">
                <h3>Categories</h3>
                {categoryList.map((category) => (
                  <label key={category._id}>
                    <input
                      type="checkbox"
                      checked={checked.includes(category._id)}
                      onChange={(event) => handleCheck(event.target.checked, category._id)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </section>
              <section className="shop-filter-panel__group">
                <h3>Popular brands</h3>
                <div className="shop-filter-panel__brands">
                  {uniqueBrands.slice(0, 10).map((brand) => (
                    <button type="button" key={brand} onClick={() => handleBrandClick(brand)}>{brand}</button>
                  ))}
                  {!uniqueBrands.length && <p>Brand filters appear as products are loaded.</p>}
                </div>
              </section>
              <section className="shop-filter-panel__group">
                <label className="shop-filter-panel__price" htmlFor="shop-price-filter">
                  <span>Price contains</span>
                  <input
                    id="shop-price-filter"
                    type="search"
                    inputMode="numeric"
                    placeholder="e.g. 1500"
                    value={priceFilter}
                    onChange={handlePriceChange}
                  />
                </label>
              </section>
              <button type="button" className="shop-filter-panel__apply" onClick={() => { handleMallClick(); setFiltersOpen(false); }}>
                Show {productCount} products
              </button>
            </aside>

            <section className="shop-catalog-results" aria-label="Shop products">
              <div className="shop-catalog-results__heading">
                <div>
                  <span>{keyword ? "Your search results" : "The marketplace"}</span>
                  <h2>{keyword ? `Finds for “${keyword}”` : "A little bit of everything."}</h2>
                  <p>{productCount} products {hasActiveFilters ? "match your current filters" : "from shops across the marketplace"}</p>
                </div>
                <div className="shop-catalog-results__controls">
                  <button
                    type="button"
                    className="shop-catalog-results__filter-toggle"
                    aria-expanded={filtersOpen}
                    aria-controls="shop-filters"
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    Refine {checked.length > 0 && <span>{checked.length}</span>}
                  </button>
                  <label>
                    <span>Sort by</span>
                    <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: low to high</option>
                      <option value="price-high">Price: high to low</option>
                    </select>
                  </label>
                </div>
              </div>

              {Object.keys(grouped).length === 0 ? (
                <div className="shop-catalog-empty">
                  {filteredProductsQuery.isLoading || searchedProductsQuery.isLoading ? <Loader /> : (
                    <>
                      <span><FaSearch aria-hidden="true" /></span>
                      <h3>No products found yet</h3>
                      <p>Try a different search or clear some filters to see more local finds.</p>
                      <button type="button" onClick={resetFilters}>Clear filters</button>
                    </>
                  )}
                </div>
              ) : (
                Object.entries(grouped).map(([catId, block], index) => {
                  const sortedItems = [...block.items].sort((a, b) => {
                    if (sortMode === "price-low") return Number(a.price || 0) - Number(b.price || 0);
                    if (sortMode === "price-high") return Number(b.price || 0) - Number(a.price || 0);
                    if (sortMode === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    return 0;
                  });
                  return (
                    <section key={catId} className={`shop-category-section ${index % 2 ? "is-soft" : ""}`}>
                      <div className="shop-category-section__heading">
                        <div>
                          <span>{String(index + 1).padStart(2, "0")} / CATEGORY EDIT</span>
                          <h3>{block.meta?.name || "Other"}</h3>
                        </div>
                        <span>{block.items.length} {block.items.length === 1 ? "find" : "finds"}</span>
                        <button
                          type="button"
                          aria-expanded={!collapsedCats[catId]}
                          onClick={() => setCollapsedCats((current) => ({
                            ...current,
                            [catId]: !current[catId],
                          }))}
                        >
                          {collapsedCats[catId] ? "Show products" : "Hide"}
                        </button>
                      </div>
                      {!collapsedCats[catId] && (
                        <div className="shop-category-section__products">
                          {sortedItems.map((product) => <ProductCard key={product._id} p={product} />)}
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopUpdated;

const normalizeCategoryId = (category) => {
  if (!category) return "uncategorized";
  if (typeof category === "string") return category;
  if (category?._id) return String(category._id);
  return "uncategorized";
};
