import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useGetPromoSettingsQuery, useGetSellerSpotlightQuery, useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice";
import { promoEnabled, reportPromoEvent } from "./marketingUtils";

const SellerSpotlightCard = () => {
  const { data: settings } = useGetPromoSettingsQuery();
  const enabled = promoEnabled(settings, "sellerSpotlight");
  const { data: shop } = useGetSellerSpotlightQuery(undefined, { skip: !enabled });
  const [logEvent] = useLogPromoEventMutation();

  useEffect(() => {
    if (enabled && shop?._id) reportPromoEvent(logEvent, "sellerSpotlight", "impression", { shop: shop._id });
  }, [enabled, logEvent, shop?._id]);

  if (!enabled || !shop?._id) return null;

  return (
    <section className="marketing-spotlight">
      <img src={shop.image} alt="" aria-hidden="true" loading="lazy" />
      <div className="marketing-spotlight__content">
        <span className="marketing-eyebrow">Shop of the day</span>
        <h2>{shop.name}</h2>
        <p>{shop.productCount || 0} products to explore{shop.location ? ` · ${shop.location}` : ""}</p>
        <Link
          to={`/shops/${shop._id}`}
          onClick={() => reportPromoEvent(logEvent, "sellerSpotlight", "click", { shop: shop._id })}
        >
          Visit shop
        </Link>
      </div>
    </section>
  );
};

export default SellerSpotlightCard;
