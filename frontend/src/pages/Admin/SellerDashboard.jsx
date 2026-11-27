import Chart from "react-apexcharts";
import {
  FaBoxOpen,
  FaChartLine,
  FaClipboardList,
  FaClock,
  FaHeart,
  FaStar,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useGetSellerAnalyticsQuery } from "../../redux/Api/sellerApiSlice";
import AdminMenu from "./AdminMenu";
import MallBuilderPanel from "./MallBuilderPanel.jsx";
import "./AdminWorkspace.css";

const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;

const SellerDashboard = () => {
  const { data, isLoading, isError, error } = useGetSellerAnalyticsQuery(undefined, {
    pollingInterval: 60000,
    refetchOnFocus: true,
  });

  if (isLoading) {
    return (
      <main className="seller-dashboard admin-workspace">
        <AdminMenu />
        <div className="admin-workspace__loading"><Loader /></div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="seller-dashboard admin-workspace">
        <AdminMenu />
        <Message variant="danger">
          {error?.data?.message || "We couldn’t load your shop analytics. Please try again."}
        </Message>
      </main>
    );
  }

  const summary = data?.summary || {};
  const series = [{
    name: "Sales",
    data: (data?.salesTrend || []).map((item) => ({
      x: item._id,
      y: Number(item.sales || 0),
    })),
  }];
  const chartOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#0f766e"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.26, opacityTo: 0.03 },
    },
    grid: { borderColor: "#e7eeec", strokeDashArray: 4 },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: { labels: { formatter: (value) => Number(value).toLocaleString() } },
    tooltip: { y: { formatter: money } },
    noData: { text: "Paid sales will appear here" },
  };
  const stats = [
    { label: "Total sales", value: money(summary.totalSales), icon: FaChartLine, tone: "sales" },
    { label: "Orders", value: summary.orderCount || 0, icon: FaClipboardList, tone: "orders" },
    { label: "Waiting for payment", value: summary.pendingOrderCount || 0, icon: FaClock, tone: "pending" },
    { label: "Products", value: summary.productCount || 0, icon: FaBoxOpen, tone: "products" },
    { label: "Receipt-confirmed points", value: summary.sellerLoyaltyPoints || 0, icon: FaStar, tone: "loyalty" },
  ];

  return (
    <main className="seller-dashboard admin-workspace">
      <AdminMenu />
      <header className="seller-dashboard__header">
        <div>
          <p className="admin-workspace__eyebrow">Your business, at a glance</p>
          <h1>Shop overview</h1>
          <p>Sales, orders, and customer favorites for your shop.</p>
        </div>
        <Link className="admin-workspace__action" to="/admin/my-shop">
          <FaBoxOpen aria-hidden="true" /> Manage my shop
        </Link>
      </header>

      <MallBuilderPanel />

      <section className="seller-dashboard__stats" aria-label="Shop performance">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <article className={`seller-dashboard__stat seller-dashboard__stat--${tone}`} key={label}>
            <span className="seller-dashboard__stat-icon"><Icon aria-hidden="true" /></span>
            <div><p>{label}</p><strong>{value}</strong></div>
          </article>
        ))}
      </section>

      <section className="seller-dashboard__panel seller-dashboard__trend">
        <div className="seller-dashboard__panel-heading">
          <div><p className="admin-workspace__eyebrow">Confirmed payments</p><h2>Sales trend</h2></div>
          <span>{summary.paidOrderCount || 0} paid orders</span>
        </div>
        <Chart options={chartOptions} series={series} type="area" height={270} />
      </section>

      <div className="seller-dashboard__insights">
        <section className="seller-dashboard__panel">
          <div className="seller-dashboard__panel-heading">
            <div><p className="admin-workspace__eyebrow">Best sellers</p><h2>Most ordered</h2></div>
          </div>
          <InsightList items={data?.bestSellers} empty="Your first best seller will show up here." metric={(item) => `${item.unitsSold || 0} sold`} />
        </section>
        <section className="seller-dashboard__panel">
          <div className="seller-dashboard__panel-heading">
            <div><p className="admin-workspace__eyebrow">Customer feedback</p><h2>Most reviewed</h2></div>
            <FaStar aria-hidden="true" />
          </div>
          <InsightList items={data?.mostReviewed} empty="Product reviews will show up here." metric={(item) => `${item.numReviews || 0} reviews`} />
        </section>
        <section className="seller-dashboard__panel">
          <div className="seller-dashboard__panel-heading">
            <div><p className="admin-workspace__eyebrow">Customer favorites</p><h2>Most liked</h2></div>
            <FaHeart aria-hidden="true" />
          </div>
          <InsightList items={data?.mostFavorited} empty="Customer favorites will show up here." metric={(item) => `${item.favoriteCount || 0} likes`} />
        </section>
      </div>

      <section className="seller-dashboard__panel seller-dashboard__recent">
        <div className="seller-dashboard__panel-heading">
          <div><p className="admin-workspace__eyebrow">The latest</p><h2>Recent orders</h2></div>
          <Link to="/admin/orderlist">View orders</Link>
        </div>
        {data?.recentOrders?.length ? (
          <div className="seller-dashboard__orders">
            {data.recentOrders.map((order) => (
              <article key={order._id}>
                <div><strong>{order.user?.username || "Customer"}</strong><span>{order.shop?.name || "Your shop"} · {new Date(order.createdAt).toLocaleDateString()}</span></div>
                <strong>{money(order.totalPrice)}</strong>
                <span className={`seller-dashboard__order-status${order.isPaid ? " is-paid" : ""}`}>
                  {order.isPaid ? "Paid" : "Awaiting payment"}
                </span>
              </article>
            ))}
          </div>
        ) : <p className="seller-dashboard__empty">New orders will show up here.</p>}
      </section>
    </main>
  );
};

const InsightList = ({ items = [], empty, metric }) => (
  items.length ? (
    <div className="seller-dashboard__insight-list">
      {items.map((item) => (
        <article key={item._id}>
          <img src={item.image} alt="" loading="lazy" />
          <div><strong>{item.name}</strong><span>{metric(item)}</span></div>
        </article>
      ))}
    </div>
  ) : <p className="seller-dashboard__empty">{empty}</p>
);

export default SellerDashboard;
