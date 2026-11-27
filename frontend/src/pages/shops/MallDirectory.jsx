import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaFire, FaMapMarkerAlt, FaStar, FaStore } from "react-icons/fa";
import Loader from "../../components/Loader.jsx";
import Message from "../../components/Message.jsx";
import { useAllProductsQuery, useGetTopProductsQuery } from "../../redux/Api/productApiSlice.js";
import { useGetMallsQuery } from "../../redux/Api/shopApiSlice.js";
import { getOptimizedHeroImage, getOptimizedProductImage } from "../../utils/imageOptimization.js";
import "./MallExperience.css";

const MallDirectory = () => {
  const { data, isLoading, isError } = useGetMallsQuery(undefined, { pollingInterval: 300000 });
  const { data: topData } = useGetTopProductsQuery();
  const { data: allData } = useAllProductsQuery();
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const malls = useMemo(() => data?.malls || [], [data]);
  const featuredMall = malls.find((mall) => mall.isFeaturedMall) || malls[0];
  const products = useMemo(() => {
    const topProducts = Array.isArray(topData) ? topData : Array.isArray(topData?.products) ? topData.products : [];
    const allProducts = Array.isArray(allData) ? allData : Array.isArray(allData?.products) ? allData.products : [];
    const seen = new Set();
    return [...topProducts, ...allProducts].filter((product) => {
      if (!product?._id || seen.has(String(product._id))) return false;
      seen.add(String(product._id));
      return true;
    }).slice(0, 12);
  }, [allData, topData]);
  const featuredProduct = products.length
    ? products[activeProductIndex % products.length]
    : null;

  useEffect(() => {
    if (products.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveProductIndex((index) => (index + 1) % products.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [products.length]);

  if (isLoading) return <main className="beast-mall-page"><Loader /></main>;
  if (isError) return <main className="beast-mall-page"><Message variant="danger">Malls could not be loaded. Please try again.</Message></main>;

  return (
    <main className="beast-mall-page">
      <Motion.section
        className="mall-directory-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        style={{ "--mall-accent": "#087f5b" }}
      >
        {(featuredMall?.coverImage || featuredMall?.image || featuredProduct?.image) && (
          <img
            src={getOptimizedHeroImage(featuredMall?.coverImage || featuredMall?.image || featuredProduct?.image)}
            alt=""
            fetchPriority="high"
          />
        )}
        <div className="mall-directory-hero__grain" aria-hidden="true" />
        <div className="mall-directory-hero__copy">
          {featuredMall?.isFeaturedMall && <span className="mall-feature-ribbon">⚡ FEATURED</span>}
          <span className="mall-official-badge"><FaStar /> {featuredMall ? "OFFICIAL MALL 🏆" : "SHOPLINK LOCAL FINDS"}</span>
          <p className="mall-kicker">{featuredMall ? "A destination made for discovery" : "Independent shops. Real finds. Close to you."}</p>
          <h1>{featuredMall ? <>Find your next<br />favourite place.</> : <>Malls are coming.<br />Great finds are here.</>}</h1>
          <p className="mall-directory-hero__description">
            {featuredMall
              ? "Explore ShopLink malls, their independent storefronts, and new finds in one place."
              : "While new malls are being built, shop live products from local businesses and explore stores by location."}
          </p>
          <div className="mall-directory-hero__actions">
            <Link to="/shops/all" className="mall-primary-link">
              Explore local locations <FaArrowRight />
            </Link>
            {featuredMall && (
              <Link to={`/malls/${featuredMall._id}`} className="mall-secondary-link">
                Enter {featuredMall.name}
              </Link>
            )}
          </div>
          {featuredMall ? (
            <div className="mall-live-stats">
              <span><strong>{featuredMall.shopCount}</strong> shops</span>
              <span><strong>{featuredMall.productCount}</strong> products</span>
              <span><strong>{featuredMall.orderCountThisWeek}</strong> orders this week</span>
            </div>
          ) : featuredProduct ? (
            <Motion.div
              className="mall-directory-spotlight"
              key={featuredProduct._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .35 }}
            >
              <img src={getOptimizedProductImage(featuredProduct.image, 180)} alt="" />
              <span><small>LIVE FROM SHOPLINK SHOPS</small><strong>{featuredProduct.name}</strong><b>KES {Number(featuredProduct.price || 0).toLocaleString()}</b></span>
              <Link to={`/product/${featuredProduct._id}`} aria-label={`View ${featuredProduct.name}`}><FaArrowRight /></Link>
            </Motion.div>
          ) : (
            <div className="mall-live-stats"><span><strong>ShopLink</strong> local shopping</span><span>Discover stores and products by location</span></div>
          )}
          {products.length > 1 && (
            <div className="mall-directory-controls" aria-label="Featured product controls">
              <button type="button" aria-label="Previous featured product" onClick={() => setActiveProductIndex((index) => (index - 1 + products.length) % products.length)}><FaArrowLeft /></button>
              <span>{activeProductIndex + 1} / {products.length}</span>
              <button type="button" aria-label="Next featured product" onClick={() => setActiveProductIndex((index) => (index + 1) % products.length)}><FaArrowRight /></button>
            </div>
          )}
        </div>
        <div className="mall-directory-hero__sparkles" aria-hidden="true"><i /><i /><i /><i /></div>
      </Motion.section>

      <header className="mall-directory-heading">
        <div>
          <p className="mall-kicker">{malls.length ? "Curated places, independent shops" : "Shop real products while malls grow"}</p>
          <h2>{malls.length ? "Explore the malls" : "Local favourites, ready to shop"}</h2>
        </div>
        <span>{malls.length} destinations</span>
      </header>

      {products.length > 0 && (
        <section className="mall-commerce-section" aria-label="Shop live products">
          <div className="mall-commerce-heading">
            <div><p className="mall-kicker"><FaFire /> LIVE FROM LOCAL SHOPS</p><h2>Good finds, picked for you</h2></div>
            <Link to="/shop">Browse all products <FaArrowRight /></Link>
          </div>
          <div className="mall-commerce-grid">
            {products.slice(0, 4).map((product, index) => (
              <Motion.article
                className="mall-commerce-card"
                key={product._id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: .15 }}
                transition={{ duration: .35, delay: index * .06 }}
              >
                <Link to={`/product/${product._id}`} className="mall-commerce-card__image">
                  <img src={getOptimizedProductImage(product.image, 420)} alt={product.name} loading="lazy" decoding="async" />
                  <span>SHOP LOCAL</span>
                </Link>
                <div>
                  <small>{product.shop?.name || "ShopLink local shop"}{product.shop?.location ? ` · ${product.shop.location}` : ""}</small>
                  <h3>{product.name}</h3>
                  <strong>KES {Number(product.price || 0).toLocaleString()}</strong>
                  <Link to={`/product/${product._id}`}>Discover product <FaArrowRight /></Link>
                </div>
              </Motion.article>
            ))}
          </div>
        </section>
      )}

      {malls.length ? (
        <section className="mall-directory-grid" aria-label="ShopLink malls">
          {malls.map((mall, index) => (
            <Motion.article
              className="mall-directory-card"
              key={mall._id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
            >
              <Link to={`/malls/${mall._id}`} className="mall-directory-card__image">
                <img src={getOptimizedHeroImage(mall.coverImage || mall.image)} alt="" loading="lazy" decoding="async" />
                {mall.isFeaturedMall && <span className="mall-feature-ribbon">⚡ FEATURED</span>}
                <span className="mall-directory-card__brand"><FaStore /> OFFICIAL MALL</span>
              </Link>
              <div className="mall-directory-card__body">
                <div className="mall-directory-card__title">
                  <div><p><FaMapMarkerAlt /> {mall.location}</p><h3>{mall.name}</h3></div>
                  {String(mall._id) === String(data?.mostLovedMallId) && <span className="mall-loved-badge"><FaStar /> Most loved</span>}
                </div>
                <p className="mall-directory-card__description">{mall.description || "A collection of independent storefronts, together in one destination."}</p>
                <div className="mall-directory-card__metrics">
                  <span><FaStore /> {mall.shopCount} shops</span>
                  <span>{mall.productCount} products</span>
                  <span><FaFire /> {mall.orderCountThisWeek} this week</span>
                </div>
                <p className="mall-directory-card__visits">{mall.visitsThisWeek} visits this week</p>
                <Link to={`/malls/${mall._id}`} className="mall-directory-card__enter">Explore mall <FaArrowRight /></Link>
              </div>
            </Motion.article>
          ))}
        </section>
      ) : (
        <section className="mall-empty-state">
          <FaStore />
          <h2>New destinations are on the way</h2>
          <p>As shop owners unlock malls, they’ll appear here. For now, enter a location to meet its shops and discover what they sell.</p>
          <Link to="/shops/all" className="mall-empty-state__action">Enter a location <FaArrowRight /></Link>
        </section>
      )}
    </main>
  );
};

export default MallDirectory;
