import { useEffect } from "react";
import { useGetPromoSettingsQuery, useGetTrendingProductsQuery, useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice";
import PromoProductCard from "./PromoProductCard";
import { promoEnabled, reportPromoEvent } from "./marketingUtils";

const TrendingNowStrip = () => {
  const { data: settings } = useGetPromoSettingsQuery();
  const enabled = promoEnabled(settings, "trendingNow");
  const { data: products = [] } = useGetTrendingProductsQuery(undefined, { skip: !enabled });
  const [logEvent] = useLogPromoEventMutation();

  useEffect(() => {
    if (enabled && products.length) reportPromoEvent(logEvent, "trendingNow", "impression");
  }, [enabled, logEvent, products.length]);

  if (!enabled || !products.length) return null;

  return (
    <section className="marketing-section" aria-label="Popular this week">
      <div className="marketing-section__heading">
        <div>
          <span className="marketing-eyebrow">The crowd agrees</span>
          <h2>Most ordered this week</h2>
        </div>
        <span className="marketing-section__note">Real orders from the last 7 days</span>
      </div>
      <div className="marketing-product-grid">
        {products.slice(0, 8).map((product) => (
          <PromoProductCard
            key={product._id}
            product={product}
            module="trendingNow"
            badge={`${product.orderCount || 0} orders`}
          />
        ))}
      </div>
    </section>
  );
};

export default TrendingNowStrip;
