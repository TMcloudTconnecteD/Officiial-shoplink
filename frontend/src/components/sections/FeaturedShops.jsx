import './FeaturedShops.css';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Mock featured shops - in production this comes from API
const featuredShops = [
  {
    id: 1,
    name: 'Fresh Mart Supermarket',
    rating: 4.8,
    reviews: 342,
    category: 'Groceries',
    image: 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder',
  },
  {
    id: 2,
    name: 'Style & Comfort Co.',
    rating: 4.6,
    reviews: 218,
    category: 'Fashion',
    image: 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder',
  },
  {
    id: 3,
    name: 'Tech Haven Store',
    rating: 4.7,
    reviews: 421,
    category: 'Electronics',
    image: 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder',
  },
];

const ShopCard = ({ shop }) => (
  <Link to={`/shops/${shop.id}`} className="shop-card-link">
    <div className="featured-shop-card">
      <div className="shop-image-container">
        <img
          src={shop.image}
          alt={shop.name}
          loading="lazy"
          className="shop-image"
        />
        <span className="shop-category-badge">{shop.category}</span>
      </div>
      
      <div className="shop-info">
        <h3 className="shop-name">{shop.name}</h3>
        
        <div className="shop-rating">
          <FaStar size={14} color="#F59E0B" />
          <span className="rating-value">{shop.rating}</span>
          <span className="rating-text">({shop.reviews})</span>
        </div>
        
        <button className="shop-cta">View Shop</button>
      </div>
    </div>
  </Link>
);

const FeaturedShops = () => {
  return (
    <section className="featured-shops-section">
      <div className="featured-shops-container">
        <div className="section-header">
          <h2 className="section-title">Featured Shops</h2>
          <Link to="/shops/all" className="view-all-link">View All Shops →</Link>
        </div>
        
        <div className="shops-grid">
          {featuredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedShops;
