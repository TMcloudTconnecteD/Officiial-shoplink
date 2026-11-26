import React from "react";
import { FaChartLine, FaEnvelope, FaPhone, FaWhatsapp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../redux/features/cart/cartSlice";
import HeartIcon from "../pages/products/HeartIcon";
import "./ShopPortfolio.css";

const whatsappLink = (phone) => {
  if (!phone) return "#";
  const digits = String(phone).replace(/\D/g, "");
  const normalized = digits.startsWith("254") ? digits : `254${digits.replace(/^0/, "")}`;
  return `https://wa.me/${normalized}`;
};

const ShopPortfolio = ({ shop, products = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const ownerId = typeof shop.owner === "object" ? shop.owner?._id : shop.owner;
  const viewerId = userInfo?._id || userInfo?.id;
  const canManageShop = Boolean(userInfo?.isSuperAdmin || (viewerId && String(ownerId) === String(viewerId)));

  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
  };
  const shopPhoto = shop.image || "https://res.cloudinary.com/tmcloud/image/upload/w_900,q_auto,f_auto/v1/shop-placeholder";

  return (
    <div className="shop-portfolio">
      <section className="shop-portfolio-hero">
        <img className="shop-portfolio-cover" src={shopPhoto} alt="" />
        <div className="shop-portfolio-overlay" />
        <div className="shop-portfolio-profile">
          <img className="shop-portfolio-logo" src={shopPhoto} alt={shop.name} />
          <div className="shop-portfolio-heading">
            <p>Verified local shop</p>
            <h1>{shop.name}</h1>
            <span>{typeof shop.location === "string" ? shop.location : shop.location?.name}</span>
          </div>
        </div>
        <div className="shop-portfolio-actions">
          {canManageShop && (
            <Link to={`/admin/my-shop?shop=${shop._id}`} aria-label={`Manage ${shop.name}`}>
              <FaChartLine aria-hidden="true" /> Manage shop
            </Link>
          )}
          <a href={`tel:${shop.telephone}`}><FaPhone /> Call</a>
          <a href={whatsappLink(shop.telephone)} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp</a>
        </div>
      </section>

      <div className="shop-portfolio-layout">
        <aside className="shop-portfolio-about">
          <p className="shop-portfolio-label">About this shop</p>
          <h2>{shop.name}</h2>
          <p>{shop.description || "Curated local products, friendly service, and convenient delivery."}</p>
          <dl>
            <div><dt>Location</dt><dd>{typeof shop.location === "string" ? shop.location : shop.location?.name || "Available locally"}</dd></div>
            <div><dt>Collection</dt><dd>{products.length} products</dd></div>
          </dl>
          {shop.owner?.email && (
            <a className="shop-portfolio-email" href={`mailto:${shop.owner.email}`}>
              <FaEnvelope /> Email shop
            </a>
          )}
          <button type="button" onClick={() => navigate("/shops/all")}>Browse all shops</button>
        </aside>

        <section className="shop-portfolio-products">
          <div className="shop-portfolio-section-head">
            <div>
              <p>Shop collection</p>
              <h2>Popular picks</h2>
            </div>
            <span>{products.length} items</span>
          </div>
          {products.length === 0 ? (
            <div className="shop-portfolio-empty">This shop is preparing its collection. Please check back soon.</div>
          ) : (
            <div className="shop-portfolio-grid">
              {products.map((product) => (
                <article key={product._id} className="shop-portfolio-card">
                  <Link className="shop-portfolio-card-image" to={`/product/${product._id}`} state={{ fromShop: shop._id }}>
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </Link>
                  <div className="shop-portfolio-card-body">
                    <div>
                      <Link to={`/product/${product._id}`}><h3>{product.name}</h3></Link>
                      <p>KES {Number(product.price || 0).toLocaleString()}</p>
                    </div>
                    <div className="shop-portfolio-card-actions">
                      <HeartIcon product={product} />
                      <button type="button" onClick={() => addToCartHandler(product)}>Add to cart</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShopPortfolio;
