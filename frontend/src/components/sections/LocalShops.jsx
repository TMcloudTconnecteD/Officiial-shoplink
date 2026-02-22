import { useState, useMemo } from 'react';
import { useFetchShopsQuery } from '../../redux/Api/shopApiSlice';
import { Link } from 'react-router-dom';
import { FaStar, FaChevronDown } from 'react-icons/fa';
import './LocalShops.css';

const LocalShops = () => {
  const { data: shopsData, isLoading } = useFetchShopsQuery();
  const shops = shopsData?.data || shopsData || [];
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Extract unique locations
  const uniqueLocations = useMemo(() => {
    const locations = [...new Set(shops.map(shop => shop.location).filter(Boolean))];
    return locations.sort();
  }, [shops]);

  // Filter shops by selected location
  const localShops = useMemo(() => {
    if (!selectedLocation) return [];
    return shops.filter(shop => shop.location === selectedLocation);
  }, [shops, selectedLocation]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowDropdown(false);
  };

  if (isLoading) {
    return <div className="local-shops-section skeleton"></div>;
  }

  return (
    <section className="local-shops-section">
      <div className="local-shops-container">
        <h2 className="local-shops-title">🏪 Shop Locally</h2>
        <p className="local-shops-subtitle">Select your location to see nearby shops</p>

        {/* Location Selector Dropdown */}
        <div className="location-dropdown-wrapper">
          <button
            className="location-dropdown-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="location-icon">📍</span>
            {selectedLocation || 'Select your location'}
            <FaChevronDown 
              size={14} 
              style={{ 
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }} 
            />
          </button>

          {showDropdown && (
            <div className="location-dropdown-menu">
              {uniqueLocations.map((location) => (
                <button
                  key={location}
                  className={`location-option ${selectedLocation === location ? 'active' : ''}`}
                  onClick={() => handleLocationSelect(location)}
                >
                  {location}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shops Grid for Selected Location */}
        {selectedLocation && (
          <div className="local-shops-content">
            <h3 className="location-heading">Shops in {selectedLocation}</h3>
            
            {localShops.length > 0 ? (
              <div className="local-shops-grid">
                {localShops.map((shop) => (
                  <Link
                    key={shop._id}
                    to={`/shops/${shop._id}`}
                    className="local-shop-card-link"
                  >
                    <div className="local-shop-card">
                      <div className="local-shop-image">
                        <img
                          src={shop.image || 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder'}
                          alt={shop.name}
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder';
                          }}
                        />
                      </div>
                      <div className="local-shop-info">
                        <h4 className="local-shop-name">{shop.name}</h4>
                        <div className="local-shop-location">📍 {shop.location}</div>
                        <div className="local-shop-phone">📞 {shop.telephone}</div>
                        <button className="visit-shop-btn">Visit Shop</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-shops-message">
                <p>No shops found in {selectedLocation}</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedLocation && (
          <div className="location-placeholder">
            <p className="placeholder-text">👇 Select a location to browse shops</p>
          </div>
        )}

        {/* All Locations Summary */}
        {uniqueLocations.length > 0 && (
          <div className="locations-summary">
            <p className="summary-text">
              {uniqueLocations.length} locations available • {shops.length} total shops
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LocalShops;
