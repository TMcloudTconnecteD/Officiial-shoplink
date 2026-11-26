import { useEffect } from "react";
import { useGetFeaturedPromoProductsQuery, useGetPromoSettingsQuery, useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice";
import PromoProductCard from "./PromoProductCard";
import { promoEnabled, reportPromoEvent } from "./marketingUtils";

const FeaturedProductsStrip = () => {
  const { data: settings } = useGetPromoSettingsQuery();
  const enabled = promoEnabled(settings, "freshDrops");
  const { data: products = [] } = useGetFeaturedPromoProductsQuery(undefined, { skip: !enabled });
  const [logEvent] = useLogPromoEventMutation();

  useEffect(() => {
    if (enabled && products.length) reportPromoEvent(logEvent, "freshDrops", "impression");
  }, [enabled, logEvent, products.length]);

  if (!enabled || !products.length) return null;

  return (
    <section className="marketing-section" aria-label="Featured products">
      <div className="marketing-section__heading">
        <div>
          <span className="marketing-eyebrow">Seller picks</span>
          <h2>Featured finds</h2>
        </div>
      </div>
      <div className="marketing-product-rail">
        {products.map((product) => <PromoProductCard key={product._id} product={product} module="freshDrops" badge="Featured" />)}
      </div>
    </section>
  );
};

export default FeaturedProductsStrip;
