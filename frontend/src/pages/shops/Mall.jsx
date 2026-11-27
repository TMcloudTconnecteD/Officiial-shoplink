import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaFire, FaMapMarkerAlt, FaStar, FaStore } from "react-icons/fa";
import Loader from "../../components/Loader.jsx";
import Message from "../../components/Message.jsx";
import ProductCard from "../products/ProductCard.jsx";
import { useAllProductsQuery } from "../../redux/Api/productApiSlice.js";
import { useFetchCategoriesQuery } from "../../redux/Api/categoryApiSlice.js";
import { useGetMallOverviewQuery } from "../../redux/Api/shopApiSlice.js";
import { getOptimizedHeroImage, getOptimizedProductImage } from "../../utils/imageOptimization.js";
import "./Mall.css";

const normalize = (value) => String(value || "").trim().toLowerCase();
const getProductCategoryId = (product) => String(product?.category?._id || product?.category || "");
const EMPTY_LOCATIONS = [];

const Mall = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLocation = searchParams.get("mall") || "";
  const [activePromotion, setActivePromotion] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const { data: overview, isLoading: loadingOverview, isError: overviewError } = useGetMallOverviewQuery(undefined, {
    pollingInterval: 300000,
  });
  const { data: products = [], isLoading: loadingProducts, isError: productsError } = useAllProductsQuery(undefined, {
    pollingInterval: 300000,
  });
  const { data: categoriesData = [] } = useFetchCategoriesQuery();
  const locationGroups = overview?.malls || EMPTY_LOCATIONS;
  const selectedLocationData = locationGroups.find((location) => normalize(location.location) === normalize(selectedLocation));
  const locations = useMemo(
    () => [...locationGroups].sort((a, b) => b.orderCountThisWeek - a.orderCountThisWeek || b.lifetimeOrderCount - a.lifetimeOrderCount),
    [locationGroups]
  );

  useEffect(() => {
    if (locations.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActivePromotion((index) => (index + 1) % locations.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [locations.length]);

  useEffect(() => {
    setActivePromotion((index) => locations.length ? index % locations.length : 0);
  }, [locations.length]);

  const productsForLocation = useMemo(() => {
    if (!selectedLocationData) return [];
    const shopIds = new Set(selectedLocationData.shops.map((shop) => String(shop._id)));
    return products.filter((product) => {
      const productShopId = String(product?.shop?._id || product?.shop || "");
      return shopIds.has(productShopId) && Number(product.inStock ?? 1) > 0;
    });
  }, [products, selectedLocationData]);

  const locationProductOrderCounts = useMemo(
    () => new Map((selectedLocationData?.productOrderCounts || []).map((stat) => [stat.productId, stat.orderCount])),
    [selectedLocationData]
  );

  const locationCategories = useMemo(() => {
    const categoryIds = new Set(productsForLocation.map(getProductCategoryId));
    const availableCategories = Array.isArray(categoriesData?.categories)
      ? categoriesData.categories
      : Array.isArray(categoriesData) ? categoriesData : [];
    return availableCategories.filter((category) => categoryIds.has(String(category._id)));
  }, [categoriesData, productsForLocation]);

  const sortedProducts = useMemo(() => {
    let filtered = productsForLocation;
    if (activeCategory !== "all") {
      filtered = filtered.filter((product) => getProductCategoryId(product) === activeCategory);
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
      if (sortBy === "price") return Number(a.price || 0) - Number(b.price || 0);
      return (locationProductOrderCounts.get(String(b._id)) || 0) - (locationProductOrderCounts.get(String(a._id)) || 0)
        || new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
    });
  }, [productsForLocation, activeCategory, sortBy, locationProductOrderCounts]);

  const openLocation = (location) => setSearchParams({ mall: location });
  const leaveLocation = () => {
    setSearchParams({});
    setActiveCategory("all");
    setSortBy("popular");
  };

  if (loadingOverview || loadingProducts) {
    return <main className="malls-page"><Loader /></main>;
  }
  if (overviewError || productsError) {
    return (
      <main className="malls-page">
        <Message variant="danger">Shop locations could not be loaded. Please refresh and try again.</Message>
      </main>
    );
  }

  if (selectedLocation && !selectedLocationData) {
    return (
      <main className="malls-page malls-page--empty">
        <h1>Location not found</h1>
        <button type="button" className="mall-button" onClick={leaveLocation}><FaArrowLeft /> Browse all locations</button>
      </main>
    );
  }

  if (selectedLocationData) {
    const promoProducts = sortedProducts.slice(0, 4);
    return (
      <main className="malls-page">
        <button type="button" className="mall-back-link" onClick={leaveLocation}><FaArrowLeft /> All locations</button>
        <section className="mall-detail-hero">
          <img
            src={getOptimizedHeroImage(selectedLocationData.shops.find((shop) => shop.coverImage)?.coverImage || selectedLocationData.shops[0]?.coverImage || selectedLocationData.shops[0]?.image)}
            alt=""
            fetchPriority="high"
          />
          <div className="mall-detail-hero__shade" />
          <div className="mall-detail-hero__content">
            <p><FaMapMarkerAlt /> LOCATION</p>
            <h1>{selectedLocationData.location}</h1>
            <span>
              {selectedLocationData.shopCount} {selectedLocationData.shopCount === 1 ? "shop" : "shops"} · {selectedLocationData.productCount} {selectedLocationData.productCount === 1 ? "product" : "products"} · {selectedLocationData.orderCountThisWeek} {selectedLocationData.orderCountThisWeek === 1 ? "order" : "orders"} this week across {selectedLocationData.shopCount} local {selectedLocationData.shopCount === 1 ? "shop" : "shops"}
            </span>
          </div>
        </section>

        <section className="mall-location-shops" aria-label={`Shops and malls in ${selectedLocationData.location}`}>
            <div className="mall-section-heading">
              <div><p>BUSINESSES AT THIS LOCATION</p><h2>Shops &amp; malls in {selectedLocationData.location}</h2></div>
              <span>{selectedLocationData.shopCount} {selectedLocationData.shopCount === 1 ? "business" : "businesses"}</span>
            </div>
            <div className="mall-location-shops__grid">
              {selectedLocationData.shops.map((shop) => {
                const shopProducts = products.filter((product) => (
                  String(product?.shop?._id || product?.shop || "") === String(shop._id)
                ));
                const productsById = new Map(shopProducts.map((product) => [String(product._id), product]));
                const topProducts = (shop.productOrderCounts || [])
                  .slice(0, 3)
                  .map((stat) => productsById.get(stat.productId))
                  .filter(Boolean);
                const shopLink = shop.type === "mall" ? `/malls/${shop._id}` : `/shops/${shop._id}`;
                return (
                  <article className="mall-location-shop" key={shop._id}>
                    <Link to={shopLink} className="mall-location-shop__image">
                      <img src={getOptimizedHeroImage(shop.coverImage || shop.image)} alt="" loading="lazy" decoding="async" />
                      <span>{shop.type === "mall" ? "MALL" : "SHOP"}</span>
                    </Link>
                    <div className="mall-location-shop__body">
                      <div className="mall-location-shop__title">
                        <div>
                          <span className="mall-location-shop__eyebrow">{shop.type === "mall" ? "MALL NAME" : "SHOP NAME"}</span>
                          <h3>{shop.name}</h3>
                          <span>{shop.category?.name || "Independent storefront"}</span>
                        </div>
                        <span className="mall-location-shop__products">{shop.productCount} {shop.productCount === 1 ? "product" : "products"}</span>
                      </div>
                      <div className="mall-location-shop__meta">
                        <span><FaMapMarkerAlt /> Located in {selectedLocationData.location}</span>
                        <span className="mall-location-shop__orders"><FaFire /> {shop.orderCountThisWeek || 0} orders this week</span>
                      </div>
                      {shop.parentMall?.name && <p className="mall-location-shop__parent">Part of {shop.parentMall.name}</p>}
                      {topProducts.length > 0 && (
                        <div className="mall-location-shop__trending" aria-label={`Popular products from ${shop.name}`}>
                          {topProducts.map((product) => (
                            <Link to={`/product/${product._id}`} key={product._id} title={`${product.name} from ${shop.name}`}>
                              <img src={getOptimizedProductImage(product.image, 120)} alt="" loading="lazy" decoding="async" />
                            </Link>
                          ))}
                        </div>
                      )}
                      <Link to={shopLink} className="mall-location-shop__link">
                        {shop.type === "mall" ? `Explore ${shop.name}` : `Visit ${shop.name}`} <FaArrowRight />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
        </section>

        <section className="mall-promo-strip" aria-label={`Popular products in ${selectedLocationData.location}`}>
          <div className="mall-promo-strip__heading">
            <div><span>Fresh from {selectedLocationData.location}</span><h2>Popular local products</h2></div>
            <FaFire aria-hidden="true" />
          </div>
          {promoProducts.length ? (
            <div className="mall-promo-strip__items">
              {promoProducts.map((product) => (
                <Link to={`/product/${product._id}`} state={{ fromMall: selectedLocationData.location }} key={product._id}>
                  <img src={getOptimizedProductImage(product.image, 180)} alt="" loading="lazy" decoding="async" />
                  <span>{product.name}</span>
                  <strong>KES {Number(product.price || 0).toLocaleString()}</strong>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mall-empty-copy">Shops in {selectedLocationData.location} are getting their products ready.</p>
          )}
        </section>

        <section className="mall-product-section">
          <div className="mall-product-section__top">
            <div><p>SHOP THIS LOCATION</p><h2>Popular products in {selectedLocationData.location}</h2></div>
            <label>
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="price">Price: low to high</option>
              </select>
            </label>
          </div>

          <div className="mall-category-chips" aria-label="Filter products by category">
            <button type="button" className={activeCategory === "all" ? "is-active" : ""} onClick={() => setActiveCategory("all")}>All products</button>
            {locationCategories.map((category) => (
              <button
                type="button"
                key={category._id}
                className={activeCategory === String(category._id) ? "is-active" : ""}
                onClick={() => setActiveCategory(String(category._id))}
              >
                {category.name}
              </button>
            ))}
          </div>

          {sortedProducts.length ? (
            <div className="mall-products-grid">
              {sortedProducts.map((product) => <ProductCard key={product._id} p={product} />)}
            </div>
          ) : (
            <p className="mall-empty-copy">No products match this category yet.</p>
          )}
        </section>
      </main>
    );
  }

  const featuredLocation = locations[activePromotion];
  const featuredShop = featuredLocation?.shops?.find((shop) => shop.coverImage) || featuredLocation?.shops?.[0];
  const featuredTopProductIds = new Set(
    (featuredLocation?.productOrderCounts || []).slice(0, 4).map((stat) => stat.productId)
  );
  const featuredPromoProduct = products.find((product) => featuredTopProductIds.has(String(product._id)));

  return (
    <main className="malls-page">
      <section className="mall-hero" aria-label="Featured locations">
        {featuredLocation && (
          <img
            className="mall-hero__image"
            src={getOptimizedHeroImage(featuredShop?.coverImage || featuredShop?.image || featuredPromoProduct?.image)}
            alt=""
            fetchPriority="high"
          />
        )}
        <div className="mall-hero__shade" />
        <div className="mall-hero__content">
          <span className="mall-hero__eyebrow"><FaMapMarkerAlt /> SHOPLINK LOCATIONS</span>
          <h1>Explore local places <span aria-hidden="true">🛍️</span></h1>
          <p>Choose a location first. Then explore the separately named shops and malls based there.</p>
          {featuredLocation && (
            <div className="mall-hero__feature">
              <span className="mall-hero__feature-label">FEATURED LOCATION</span>
              <strong>{featuredLocation.location}</strong>
              <span>{featuredLocation.shopCount} {featuredLocation.shopCount === 1 ? "shop" : "shops"} · {featuredLocation.orderCountThisWeek} orders this week</span>
              {featuredPromoProduct && <span className="mall-hero__feature-product">Trending product: {featuredPromoProduct.name}</span>}
              <button type="button" onClick={() => openLocation(featuredLocation.location)}>Explore shops in {featuredLocation.location} <FaArrowRight /></button>
            </div>
          )}
          {locations.length > 1 && (
            <div className="mall-hero__dots" aria-label="Featured locations">
              {locations.map((mall, index) => (
                <button key={mall.normalizedLocation} type="button" aria-label={`Show ${mall.location}`} aria-pressed={index === activePromotion} onClick={() => setActivePromotion(index)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mall-destinations">
        <div className="mall-section-heading">
          <div><p>FIND YOUR PLACE</p><h2>Choose a location</h2></div>
          <span>{locationGroups.length} {locationGroups.length === 1 ? "location" : "locations"}</span>
        </div>

        {locationGroups.length ? (
          <div className="mall-destinations-grid">
            {locationGroups.map((mall) => {
              const shopCover = mall.shops.find((shop) => shop.coverImage) || mall.shops[0];
              const mallProductStats = mall.productOrderCounts || [];
              const productById = new Map(products.map((product) => [String(product._id), product]));
              const popularProducts = mallProductStats.slice(0, 4)
                .map((stat) => productById.get(stat.productId))
                .filter(Boolean);
              const ordersByProduct = new Map(mallProductStats.map((stat) => [stat.productId, stat.orderCount]));
              const locationShopCount = mall.shops.length;
              return (
                <article className="mall-destination-card" key={mall.normalizedLocation}>
                  <button type="button" className="mall-destination-card__banner" onClick={() => openLocation(mall.location)} aria-label={`Explore shops and malls located in ${mall.location}`}>
                    <img src={getOptimizedHeroImage(shopCover?.coverImage || shopCover?.image)} alt="" loading="lazy" decoding="async" />
                    {mall.location === overview.mostLovedMallLocation && <span className="mall-destination-card__badge"><FaStar /> Most loved location</span>}
                    <span className="mall-destination-card__shop-count"><FaStore /> {locationShopCount} {locationShopCount === 1 ? "business" : "businesses"}</span>
                  </button>
                  <div className="mall-destination-card__body">
                    <div className="mall-destination-card__title">
                      <div><p><FaMapMarkerAlt /> LOCATION</p><h3>{mall.location}</h3></div>
                      <strong>{mall.productCount}<span>{mall.productCount === 1 ? " product" : " products"}</span></strong>
                    </div>
                    <p className="mall-destination-card__orders"><FaFire /> {mall.orderCountThisWeek} orders this week across {locationShopCount} local {locationShopCount === 1 ? "shop" : "shops"}</p>
                    <div className="mall-destination-card__shops" aria-label={`Businesses located in ${mall.location}`}>
                      <h4>Businesses in {mall.location}</h4>
                      {mall.shops.slice(0, 4).map((shop) => (
                        <Link className="mall-destination-card__business" to={shop.type === "mall" ? `/malls/${shop._id}` : `/shops/${shop._id}`} key={shop._id}>
                          <span className="mall-destination-card__business-icon"><FaStore /></span>
                          <span className="mall-destination-card__business-info">
                            <strong>{shop.name}</strong>
                            <small>{shop.type === "mall" ? "Mall" : "Shop"} · {shop.category?.name || "Independent business"}</small>
                          </span>
                          <span className="mall-destination-card__business-orders">{shop.orderCountThisWeek || 0}<small>orders</small></span>
                        </Link>
                      ))}
                      {mall.shops.length > 4 && <small>+{mall.shops.length - 4} more shops</small>}
                    </div>
                    <div className="mall-trending">
                      <h4><FaFire /> Trending products in {mall.location}</h4>
                      {popularProducts.length ? (
                        <div className="mall-trending__row">
                          {popularProducts.map((product) => (
                            <Link
                              className="mall-trending__item"
                              to={`/product/${product._id}`}
                              key={product._id}
                              aria-label={`${product.name}, ${ordersByProduct.get(String(product._id)) || 0} ${ordersByProduct.get(String(product._id)) === 1 ? "order" : "orders"} from ${product.shop?.name || "local shop"}`}
                              title={product.name}
                            >
                              <img src={getOptimizedProductImage(product.image, 160)} alt="" loading="lazy" decoding="async" />
                              <span className="mall-trending__info">
                                <strong>{product.name}</strong>
                                <small>{product.shop?.name || "Local shop"}</small>
                                <small>{ordersByProduct.get(String(product._id)) || 0} {ordersByProduct.get(String(product._id)) === 1 ? "order" : "orders"}</small>
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="mall-empty-copy">No order trends yet.</p>
                      )}
                    </div>
                    <button type="button" className="mall-button" onClick={() => openLocation(mall.location)}>
                      Explore shops in {mall.location} <FaArrowRight />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mall-no-results">
            <FaStore />
            <h3>No locations to show yet</h3>
            <p>Locations appear here once a shop has published its location.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Mall;
