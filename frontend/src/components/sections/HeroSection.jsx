import './HeroSection.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HeroSection = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const handleBrowseShops = () => {
    navigate('/shops/all');
  };

  const handleStartSelling = () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    // If user is admin, take them to add shop page, otherwise to malls page
    if (userInfo.isSuperAdmin || userInfo.isAdmin) {
      navigate('/admin/shop/add');
    } else {
      navigate('/shops/all');
    }
  };

  return (
    <section className="hero-section">
      {/* Background gradient */}
      <div className="hero-background"></div>
      
      {/* Content */}
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Find anything near you in seconds.</h1>
          <p className="hero-subtitle">
            Browse local shops, discover amazing products, and get fast delivery to your door.
          </p>
          
          <div className="hero-ctas">
            <button 
              onClick={handleBrowseShops}
              className="btn btn-primary btn-lg"
            >
              Browse Shops
            </button>
            <button 
              onClick={handleStartSelling}
              className="btn btn-secondary btn-lg"
            >
              Start Selling
            </button>
          </div>
        </div>
        
        {/* Hero illustration placeholder */}
        <div className="hero-illustration">
          <div className="illustration-box"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
