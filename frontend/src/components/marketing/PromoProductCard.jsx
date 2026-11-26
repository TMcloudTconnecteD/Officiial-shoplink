import { Link } from "react-router-dom";
import { useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice";
import { reportPromoEvent } from "./marketingUtils";

const PromoProductCard = ({ product, module, badge }) => {
  const [logEvent] = useLogPromoEventMutation();
  const productId = product?._id;
  const shop = typeof product?.shop === "object" ? product.shop : null;

  if (!productId) return null;

  return (
    <Link
      to={`/product/${productId}`}
      className="marketing-product-card"
      onClick={() => reportPromoEvent(logEvent, module, "click", { product: productId, shop: shop?._id })}
    >
      <div className="marketing-product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        {badge && <span className="marketing-product-card__badge">{badge}</span>}
      </div>
      <div className="marketing-product-card__body">
        <strong title={product.name}>{product.name}</strong>
        <span className="marketing-product-card__shop">{shop?.name || "ShopLink seller"}</span>
        <span className="marketing-product-card__price">KES {Number(product.price || 0).toLocaleString()}</span>
      </div>
    </Link>
  );
};

export default PromoProductCard;
