import './CategoryStrip.css';
import { FaShoppingBag, FaTshirt, FaLaptop, FaCar, FaBottleWater } from 'react-icons/fa';

const categories = [
  { id: 1, name: 'Groceries', icon: FaShoppingBag, color: '#10B981' },
  { id: 2, name: 'Fashion', icon: FaTshirt, color: '#F59E0B' },
  { id: 3, name: 'Electronics', icon: FaLaptop, color: '#3B82F6' },
  { id: 4, name: 'Transport', icon: FaCar, color: '#EF4444' },
  { id: 5, name: 'Liquor', icon: FaBottleWater, color: '#8B5CF6' },
];

const CategoryStrip = () => {
  return (
    <section className="category-strip">
      <div className="category-container">
        <h2 className="category-title">Browse by Category</h2>
        <div className="category-scroll">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button key={category.id} className="category-card" title={category.name}>
                <div className="category-icon" style={{ backgroundColor: category.color }}>
                  <Icon size={28} color="white" />
                </div>
                <span className="category-name">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;
