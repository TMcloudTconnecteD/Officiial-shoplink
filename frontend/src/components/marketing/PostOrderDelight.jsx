import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetTopProductsQuery } from "../../redux/Api/productApiSlice";
import { useGetPromoSettingsQuery, useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice";
import PromoProductCard from "./PromoProductCard";
import { promoEnabled, reportPromoEvent } from "./marketingUtils";

const PostOrderDelight = ({ order }) => {
  const { data: settings } = useGetPromoSettingsQuery();
  const enabled = promoEnabled(settings, "postOrderDelight");
  const { data: products = [] } = useGetTopProductsQuery(undefined, { skip: !order?.isPaid || !enabled });
  const [logEvent] = useLogPromoEventMutation();
  const orderedShopId = order?.shop?._id || order?.shop;
  const recommendations = useMemo(
    () => products.filter((product) => {
      const productShopId = product.shop?._id || product.shop;
      return productShopId && productShopId.toString() !== orderedShopId?.toString();
    }).slice(0, 4),
    [orderedShopId, products]
  );

  useEffect(() => {
    if (enabled && order?.isPaid) reportPromoEvent(logEvent, "postOrderDelight", "impression", { shop: orderedShopId });
  }, [enabled, logEvent, order?.isPaid, orderedShopId]);

  if (!enabled || !order?.isPaid) return null;

  return (
    <section className="marketing-delight" aria-live="polite">
      <div className="marketing-delight__message">
        <span aria-hidden="true" className="marketing-delight__mark">✓</span>
        <div>
          <p>Order confirmed</p>
          <h2>Thank you for shopping ShopLink.</h2>
          <span>Your receipt is ready and your order status is live.</span>
        </div>
        <Link to={`/order/${order._id}`} onClick={() => reportPromoEvent(logEvent, "postOrderDelight", "click", { shop: orderedShopId })}>Track order</Link>
      </div>
      {recommendations.length > 0 && (
        <div className="marketing-delight__recommendations">
          <h3>Discover another shop</h3>
          <div className="marketing-product-grid">
            {recommendations.map((product) => (
              <PromoProductCard key={product._id} product={product} module="postOrderDelight" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PostOrderDelight;
