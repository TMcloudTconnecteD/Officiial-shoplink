import './HeroSection.css';

const HeroSection = () => {
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
            <button className="btn btn-primary btn-lg">
              Browse Shops
            </button>
            <button className="btn btn-secondary btn-lg">
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
