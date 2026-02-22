import './CategoryStrip.css';
import { FaShoppingBag, FaTshirt, FaLaptop, FaCar, FaWineGlass, FaBox } from 'react-icons/fa';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  'Groceries': FaShoppingBag,
  'Food': FaShoppingBag,
  'Produce': FaShoppingBag,
  'Fashion': FaTshirt,
  'Clothing': FaTshirt,
  'Apparel': FaTshirt,
  'Electronics': FaLaptop,
  'Tech': FaLaptop,
  'Transport': FaCar,
  'Vehicles': FaCar,
  'Liquor': FaWineGlass,
  'Beverages': FaWineGlass,
  'Alcohol': FaWineGlass,
};

const colorMap = {
  'Groceries': '#10B981',
  'Food': '#10B981',
  'Produce': '#10B981',
  'Fashion': '#F59E0B',
  'Clothing': '#F59E0B',
  'Apparel': '#F59E0B',
  'Electronics': '#3B82F6',
  'Tech': '#3B82F6',
  'Transport': '#EF4444',
  'Vehicles': '#EF4444',
  'Liquor': '#8B5CF6',
  'Beverages': '#8B5CF6',
  'Alcohol': '#8B5CF6',
};

const CategoryStrip = () => {
  const { data: categoriesData, isLoading } = useFetchCategoriesQuery();
  const navigate = useNavigate();
  const categories = categoriesData?.categories || categoriesData || [];

  const handleCategoryClick = (categoryName) => {
    // Navigate to shop page with category filter
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  if (isLoading) {
    return (
      <section className="category-strip">
        <div className="category-container">
          <h2 className="category-title">Browse by Category</h2>
          <div className="category-scroll">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="category-card skeleton">
                <div className="category-icon" style={{ backgroundColor: '#e0e0e0' }}></div>
                <span className="category-name" style={{ backgroundColor: '#e0e0e0' }}></span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="category-strip">
      <div className="category-container">
        <h2 className="category-title">Browse by Category</h2>
        <div className="category-scroll">
          {categories.map((category) => {
            const categoryName = category.name || category;
            const Icon = iconMap[categoryName] || FaBox;
            const color = colorMap[categoryName] || '#6B7280';
            
            return (
              <button 
                key={category._id || categoryName} 
                onClick={() => handleCategoryClick(categoryName)}
                className="category-card" 
                title={categoryName}
              >
                <div className="category-icon" style={{ backgroundColor: color }}>
                  <Icon size={28} color="white" />
                </div>
                <span className="category-name">{categoryName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;
