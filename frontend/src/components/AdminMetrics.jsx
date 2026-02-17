import './AdminDashboard.css';
import { FaDollarSign, FaShoppingCart, FaUsers, FaStore, FaTrendingUp } from 'react-icons/fa';

// Mock data - in production this comes from API
const dashboardMetrics = [
  {
    id: 1,
    label: 'Total Revenue',
    value: '₦2,450,000',
    icon: FaDollarSign,
    color: 'primary',
    growth: '+12.5%',
    period: 'vs last month',
  },
  {
    id: 2,
    label: 'Total Orders',
    value: '1,247',
    icon: FaShoppingCart,
    color: 'accent',
    growth: '+8.2%',
    period: 'vs last month',
  },
  {
    id: 3,
    label: 'Active Users',
    value: '3,842',
    icon: FaUsers,
    color: 'success',
    growth: '+15.3%',
    period: 'vs last month',
  },
  {
    id: 4,
    label: 'Total Shops',
    value: '156',
    icon: FaStore,
    color: 'info',
    growth: '+2.4%',
    period: 'vs last month',
  },
];

const MetricCard = ({ metric }) => {
  const Icon = metric.icon;
  return (
    <div className="metric-card">
      <div className={`metric-icon metric-icon-${metric.color}`}>
        <Icon size={24} />
      </div>
      
      <div className="metric-content">
        <p className="metric-label">{metric.label}</p>
        <h3 className="metric-value">{metric.value}</h3>
        
        <div className="metric-growth">
          <FaTrendingUp size={12} />
          <span>{metric.growth}</span>
          <span className="metric-period">{metric.period}</span>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's your platform performance.</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h2 className="chart-title">Revenue Trend</h2>
          <div className="chart-placeholder">
            <p>Revenue chart will be displayed here using Line Chart component</p>
          </div>
        </div>

        <div className="chart-container">
          <h2 className="chart-title">Orders by Category</h2>
          <div className="chart-placeholder">
            <p>Category distribution will be displayed here using Bar Chart component</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2 className="activity-title">Recent Orders</h2>
        
        <div className="activity-table-wrapper">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="order-id">#ORD-001234</td>
                <td>John Okonkwo</td>
                <td className="amount">₦45,000</td>
                <td><span className="status-badge status-completed">Completed</span></td>
                <td>Feb 17, 2:45 PM</td>
              </tr>
              <tr>
                <td className="order-id">#ORD-001233</td>
                <td>Amara Chukwu</td>
                <td className="amount">₦28,500</td>
                <td><span className="status-badge status-processing">Processing</span></td>
                <td>Feb 17, 1:30 PM</td>
              </tr>
              <tr>
                <td className="order-id">#ORD-001232</td>
                <td>Daniel Adeyemi</td>
                <td className="amount">₦62,300</td>
                <td><span className="status-badge status-completed">Completed</span></td>
                <td>Feb 17, 12:00 PM</td>
              </tr>
              <tr>
                <td className="order-id">#ORD-001231</td>
                <td>Tunde Okafor</td>
                <td className="amount">₦35,750</td>
                <td><span className="status-badge status-pending">Pending</span></td>
                <td>Feb 16, 11:15 PM</td>
              </tr>
              <tr>
                <td className="order-id">#ORD-001230</td>
                <td>Grace Nwankwo</td>
                <td className="amount">₦52,100</td>
                <td><span className="status-badge status-completed">Completed</span></td>
                <td>Feb 16, 9:45 PM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
