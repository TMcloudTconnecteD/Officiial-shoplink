import './TrustSection.css';
import { FaMapMarkerAlt, FaTruck, FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const trustPoints = [
  {
    id: 1,
    icon: FaMapMarkerAlt,
    title: 'Local Shops',
    description: 'Shop from verified local businesses near you',
    to: '/shops/all',
  },
  {
    id: 2,
    icon: FaTruck,
    title: 'Fast Delivery',
    description: 'Quick and reliable delivery right to your door',
    to: '/ride-boda',
  },
  {
    id: 3,
    icon: FaTag,
    title: 'Student Friendly',
    description: 'Special discounts for students and young professionals',
  },
];

const TrustSection = () => {
  return (
    <section className="trust-section">
      <div className="trust-container">
        <h2 className="trust-title">Why Choose ShopLink?</h2>
        
        <div className="trust-grid">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            const content = (
              <>
                <div className="trust-icon">
                  <Icon size={40} />
                </div>
                <h3 className="trust-card-title">{point.title}</h3>
                <p className="trust-card-text">{point.description}</p>
              </>
            );
            return point.to ? (
              <Link key={point.id} to={point.to} className="trust-card trust-card-link">
                {content}
              </Link>
            ) : (
              <div key={point.id} className="trust-card">{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
