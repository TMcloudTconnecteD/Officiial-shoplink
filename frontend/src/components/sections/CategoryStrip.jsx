import './CategoryStrip.css';
import {
  FaBaby,
  FaBook,
  FaBox,
  FaCar,
  FaGift,
  FaHeartbeat,
  FaHome,
  FaLaptop,
  FaMobileAlt,
  FaPaw,
  FaShoppingBag,
  FaSpa,
  FaTshirt,
  FaUtensils,
  FaWineGlass,
} from 'react-icons/fa';
import { useFetchCategoriesQuery } from '../../redux/Api/categoryApiSlice';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  groceries: FaShoppingBag,
  food: FaUtensils,
  produce: FaShoppingBag,
  fashion: FaTshirt,
  clothing: FaTshirt,
  apparel: FaTshirt,
  shoes: FaTshirt,
  electronics: FaLaptop,
  tech: FaMobileAlt,
  phones: FaMobileAlt,
  transport: FaCar,
  vehicles: FaCar,
  automotive: FaCar,
  liquor: FaWineGlass,
  beverages: FaWineGlass,
  alcohol: FaWineGlass,
  home: FaHome,
  "home and living": FaHome,
  furniture: FaHome,
  beauty: FaSpa,
  wellness: FaHeartbeat,
  health: FaHeartbeat,
  books: FaBook,
  stationery: FaBook,
  toys: FaGift,
  gifts: FaGift,
  baby: FaBaby,
  pets: FaPaw,
};

const colorMap = {
  groceries: '#10B981',
  food: '#10B981',
  produce: '#10B981',
  fashion: '#F59E0B',
  clothing: '#F59E0B',
  apparel: '#F59E0B',
  shoes: '#F59E0B',
  electronics: '#3B82F6',
  tech: '#3B82F6',
  phones: '#3B82F6',
  transport: '#EF4444',
  vehicles: '#EF4444',
  automotive: '#EF4444',
  liquor: '#8B5CF6',
  beverages: '#8B5CF6',
  alcohol: '#8B5CF6',
  home: '#0F766E',
  "home and living": '#0F766E',
  furniture: '#0F766E',
  beauty: '#DB2777',
  wellness: '#DB2777',
  health: '#DB2777',
  books: '#B45309',
  stationery: '#B45309',
  toys: '#EA580C',
  gifts: '#EA580C',
  baby: '#EA580C',
  pets: '#7C3AED',
};

const normalizeCategoryName = (category) => {
  if (!category) return 'General';
  if (typeof category === 'string') return category;
  if (typeof category?.name === 'string') return category.name;
  return 'General';
};

const CategoryStrip = () => {
  const { data: categoriesData, isLoading } = useFetchCategoriesQuery();
  const navigate = useNavigate();
  const categories = categoriesData?.categories || categoriesData || [];

  const handleCategoryClick = (categoryName) => {
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
            const categoryName = normalizeCategoryName(category);
            const categoryKey = categoryName.trim().toLowerCase();
            const Icon = iconMap[categoryKey] || FaBox;
            const color = colorMap[categoryKey] || '#0F766E';

            return (
              <button
                key={String(category?._id || categoryName)}
                onClick={() => handleCategoryClick(categoryName)}
                className="category-card"
                title={categoryName}
                aria-label={`Browse ${categoryName}`}
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
