import './FeaturedShops.css';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useFetchShopsQuery } from '../../redux/Api/shopApiSlice';
import { useMemo } from 'react';

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

const normalizeShopImage = (shop) => {
  const image = shop?.image || shop?.logo || shop?.shopImage;
  if (typeof image === 'string' && image.trim()) return image;
  return 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder';
};

const ShopCard = ({ shop }) => {
  const shopId = shop._id || shop.id;
  const shopName = typeof shop.name === 'string' && shop.name.trim() ? shop.name : 'Shop';
  const shopImage = normalizeShopImage(shop);
  const category = normalizeCategoryName(shop.category);
  const categoryId = normalizeCategoryId(shop.category);
  const rating = Number(shop.rating) || 4.5;
  const reviews = Number(shop.reviews) || 0;

  return (
    <Link to={`/shops/${shopId}`} state={{ fromShop: categoryId || shopId }} className="shop-card-link">
      <div className="featured-shop-card">
        <div className="shop-image-container">
          <img
            src={shopImage}
            alt={shopName}
            loading="lazy"
            className="shop-image"
            onError={(e) => {
              e.target.src = 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder';
            }}
          />
          <span className="shop-category-badge">{category}</span>
        </div>
        
        <div className="shop-info">
          <h3 className="shop-name">{shopName}</h3>
          
          <div className="shop-rating">
            <FaStar size={14} color="#F59E0B" />
            <span className="rating-value">{rating.toFixed(1)}</span>
            <span className="rating-text">({reviews})</span>
          </div>
          
          <button className="shop-cta">View Shop</button>
        </div>
      </div>
    </Link>
  );
};

const FeaturedShops = () => {
  const { data: shopsData, isLoading } = useFetchShopsQuery();
  const shops = shopsData?.data || shopsData || [];

  const featuredShops = useMemo(() => {
    if (shops.length === 0) return [];
    const shuffled = [...shops].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  }, [shops]);

  if (isLoading) {
    return (
      <section className="featured-shops-section">
        <div className="featured-shops-container">
          <div className="section-header">
            <h2 className="section-title">Featured Shops</h2>
            <Link to="/shops/all" className="view-all-link">View All Shops →</Link>
          </div>
          
          <div className="shops-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="featured-shop-card skeleton">
                <div className="shop-image-container skeleton"></div>
                <div className="shop-info">
                  <div className="skeleton-line" style={{ height: '16px', marginBottom: '8px' }}></div>
                  <div className="skeleton-line" style={{ height: '14px', width: '80%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-shops-section">
      <div className="featured-shops-container">
        <div className="section-header">
          <h2 className="section-title">Featured Shops</h2>
          <Link to="/shops/all" className="view-all-link">View All Shops →</Link>
        </div>
        
        <div className="shops-grid">
          {featuredShops.map((shop) => (
            <ShopCard key={shop._id || shop.id || Math.random()} shop={shop} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedShops;
