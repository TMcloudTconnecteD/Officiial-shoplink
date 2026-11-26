import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAllProductsQuery, useGetTopProductsQuery } from "../../redux/Api/productApiSlice";
import { useFetchShopsQuery } from "../../redux/Api/shopApiSlice";
import { getOptimizedProductImage } from "../../utils/imageOptimization";
import ShopLinkMark from "../ShopLinkMark";
import "./HeroSection.css";

const pickRandom = (items, count) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: topProductsData } = useGetTopProductsQuery();
  const { data: allProductsData } = useAllProductsQuery();
  const { data: shopsData } = useFetchShopsQuery();

  const products = useMemo(() => {
    const topProducts = Array.isArray(topProductsData)
      ? topProductsData
      : Array.isArray(topProductsData?.products) ? topProductsData.products : [];
    const allProducts = Array.isArray(allProductsData)
      ? allProductsData
      : Array.isArray(allProductsData?.products) ? allProductsData.products : [];
    return topProducts.length > 0 ? topProducts : allProducts;
  }, [allProductsData, topProductsData]);
  const shops = useMemo(() => (
    Array.isArray(shopsData?.data)
      ? shopsData.data
      : Array.isArray(shopsData) ? shopsData : []
  ), [shopsData]);
  const featuredProducts = useMemo(() => pickRandom(products, 2), [products]);
  const featuredShops = useMemo(() => pickRandom(shops, 2), [shops]);

  const handleStartSelling = () => {
    if (!userInfo) {
      navigate("/login?redirect=%2Fseller%2Fapply");
      return;
    }
    navigate("/seller/apply");
  };

  return (
    <section className="hero-section">
      <div className="hero-background" />
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Find anything near you in seconds.</h1>
          <p className="hero-subtitle">
            Browse local shops, discover amazing products, and get fast delivery to your door.
          </p>
          <div className="hero-ctas">
            <button
              type="button"
              onClick={() => navigate("/shops/all")}
              className="btn btn-primary btn-lg"
            >
              Browse Shops
            </button>
            <button
              type="button"
              onClick={handleStartSelling}
              className="btn btn-secondary btn-lg hero-sell-button"
            >
              Start Selling
            </button>
          </div>
        </div>

        <div className="hero-illustration" aria-label="Featured local shops and products">
          <div className="illustration-box">
            {featuredProducts.length > 0 && (
              <div className="hero-product-list">
                {featuredProducts.map((product, index) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className={`hero-product-card hero-product-card--${index + 1}`}
                  >
                    <img
                      src={getOptimizedProductImage(product.image, 320)}
                      alt=""
                      loading="lazy"
                    />
                    <span className="hero-product-details">
                      <span className="hero-product-name">{product.name}</span>
                      <span className="hero-product-price">
                        KES {Number(product.price || 0).toLocaleString()}
                      </span>
                    </span>
                    <span className="hero-product-arrow" aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            )}

            {featuredShops.length > 0 && (
              <div className="hero-shop-list">
                <span className="hero-shop-label">Around you</span>
                {featuredShops.map((shop) => (
                  <Link
                    key={shop._id || shop.id}
                    to={`/shops/${shop._id || shop.id}`}
                    className="hero-shop-chip"
                  >
                    <span className="hero-shop-dot" />
                    {typeof shop.name === "string" ? shop.name : "Local shop"}
                  </Link>
                ))}
              </div>
            )}

            {featuredProducts.length === 0 && featuredShops.length === 0 && (
              <div className="hero-empty-state">
                <ShopLinkMark className="hero-empty-icon" />
                <span>Discover local finds and shops</span>
                <Link to="/shops/all" className="hero-empty-link">Explore all shops</Link>
                <Link to="/shop" className="hero-empty-link">Browse products</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
