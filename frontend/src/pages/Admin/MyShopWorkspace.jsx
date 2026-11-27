import { FaArrowRight, FaBoxOpen, FaChartLine, FaMapMarkerAlt, FaPlus, FaStore } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { useGetSellerWorkspaceQuery } from "../../redux/Api/sellerApiSlice";
import MallBuilderPanel from "./MallBuilderPanel.jsx";
import AdminMenu from "./AdminMenu";
import "./AdminWorkspace.css";

const MyShopWorkspace = () => {
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useGetSellerWorkspaceQuery();
  const shops = data?.shops || [];
  const targetShopId = searchParams.get("shop");
  const orderedShops = targetShopId
    ? [...shops].sort((a, b) => Number(b._id === targetShopId) - Number(a._id === targetShopId))
    : shops;

  return (
    <main className="admin-workspace seller-workspace">
      <AdminMenu />
      <header className="seller-workspace__hero">
        <div>
          <p className="admin-workspace__eyebrow">Your corner of ShopLink</p>
          <h1>My shop</h1>
          <p>Keep your shop fresh and your orders moving.</p>
        </div>
        <Link
          className="admin-workspace__action"
          to={shops[0] ? `/admin/productlist?shop=${shops[0]._id}` : "/admin/productlist"}
        >
          <FaPlus aria-hidden="true" /> Add a product
        </Link>
      </header>
      <MallBuilderPanel />

      {isLoading ? (
        <div className="admin-workspace__loading"><Loader /></div>
      ) : isError ? (
        <Message variant="danger">{error?.data?.message || "We couldn’t load your shop workspace."}</Message>
      ) : shops.length ? (
        <div className="seller-workspace__grid">
          {orderedShops.map((shop) => (
            <article className="seller-workspace__card" key={shop._id}>
              <img src={shop.image} alt="" className="seller-workspace__photo" />
              <div className="seller-workspace__card-body">
                <span className="seller-workspace__tag"><FaStore aria-hidden="true" /> Your shop</span>
                <h2>{shop.name}</h2>
                <p className="seller-workspace__location">
                  <FaMapMarkerAlt aria-hidden="true" /> {shop.location}
                </p>
                <p className="seller-workspace__description">
                  {shop.description || "Add great products and let customers discover your shop."}
                </p>
                <div className="seller-workspace__actions">
                  <Link to={`/admin/shop/update/${shop._id}`}>
                    <FaStore aria-hidden="true" /> Edit shop
                  </Link>
                  <Link to={`/admin/productlist?shop=${shop._id}`}>
                    <FaPlus aria-hidden="true" /> Add product
                  </Link>
                  <Link to={`/admin/allproductslist?shop=${shop._id}`}>
                    <FaBoxOpen aria-hidden="true" /> Manage products
                  </Link>
                  <Link to={`/admin/dashboard?shop=${shop._id}`}>
                    <FaChartLine aria-hidden="true" /> Business overview
                  </Link>
                </div>
                <Link className="seller-workspace__public-link" to={`/shops/${shop._id}`}>
                  View your shop <FaArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="admin-workspace__empty">
          <FaStore aria-hidden="true" />
          <h2>Your shop is getting ready</h2>
          <p>We couldn’t find your shop just yet. Check again in a moment.</p>
          <button type="button" className="admin-workspace__action" onClick={() => refetch()}>Check again</button>
        </section>
      )}
    </main>
  );
};

export default MyShopWorkspace;
