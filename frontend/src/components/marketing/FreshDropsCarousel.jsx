import { useEffect, useRef } from "react";
import { useGetFreshDropsQuery, useGetPromoSettingsQuery, useLogPromoEventMutation } from "../../redux/Api/marketingApiSlice";
import PromoProductCard from "./PromoProductCard";
import { promoEnabled, reportPromoEvent } from "./marketingUtils";

const FreshDropsCarousel = () => {
  const railRef = useRef(null);
  const { data: settings } = useGetPromoSettingsQuery();
  const { data: products = [] } = useGetFreshDropsQuery(undefined, { skip: !promoEnabled(settings, "freshDrops") });
  const [logEvent] = useLogPromoEventMutation();

  useEffect(() => {
    if (!products.length || !promoEnabled(settings, "freshDrops")) return undefined;
    reportPromoEvent(logEvent, "freshDrops", "impression");
    const timer = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail || rail.matches(":hover") || rail.dataset.touching === "true") return;
      const firstCard = rail.querySelector(".marketing-product-card");
      const amount = firstCard ? firstCard.getBoundingClientRect().width + 16 : rail.clientWidth;
      if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - amount) {
        rail.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        rail.scrollBy({ left: amount, behavior: "smooth" });
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [logEvent, products.length, settings]);

  if (!promoEnabled(settings, "freshDrops") || !products.length) return null;

  return (
    <section className="marketing-section" aria-label="New products">
      <div className="marketing-section__heading">
        <div>
          <span className="marketing-eyebrow">Just arrived</span>
          <h2>New on ShopLink today</h2>
        </div>
        <span className="marketing-section__note">Fresh finds from shops across ShopLink</span>
      </div>
      <div
        className="marketing-product-rail"
        ref={railRef}
        onTouchStart={(event) => { event.currentTarget.dataset.touching = "true"; }}
        onTouchEnd={(event) => { event.currentTarget.dataset.touching = "false"; }}
      >
        {products.map((product) => <PromoProductCard key={product._id} product={product} module="freshDrops" />)}
      </div>
    </section>
  );
};

export default FreshDropsCarousel;
