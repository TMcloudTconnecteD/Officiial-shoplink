import './TrustSection.css';
import { FaMapMarkerAlt, FaTruck, FaTag } from 'react-icons/fa';

const trustPoints = [
  {
    id: 1,
    icon: FaMapMarkerAlt,
    title: 'Local Shops',
    description: 'Shop from verified local businesses near you',
  },
  {
    id: 2,
    icon: FaTruck,
    title: 'Fast Delivery',
    description: 'Quick and reliable delivery right to your door',
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
            return (
              <div key={point.id} className="trust-card">
                <div className="trust-icon">
                  <Icon size={40} />
                </div>
                <h3 className="trust-card-title">{point.title}</h3>
                <p className="trust-card-text">{point.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
