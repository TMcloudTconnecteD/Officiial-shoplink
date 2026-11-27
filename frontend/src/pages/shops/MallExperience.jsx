import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion as Motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FaArrowUp, FaFire, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader.jsx";
import Message from "../../components/Message.jsx";
import ProductCard from "../products/ProductCard.jsx";
import { useGetMallDetailsQuery, useRecordMallVisitMutation } from "../../redux/Api/shopApiSlice.js";
import { getOptimizedHeroImage } from "../../utils/imageOptimization.js";
import "./MallExperience.css";

const getVisitorKey = () => {
  const storageKey = "shoplink.mall.visitor";
  let key = localStorage.getItem(storageKey);
  if (!key) {
    key = globalThis.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(storageKey, key);
  }
  return key;
};

const colorFromImage = (imageUrl, fallbackHue = 160) => new Promise((resolve) => {
  if (!imageUrl) return resolve(`hsl(${fallbackHue} 58% 38%)`);
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      const shade = luminance > 145 ? 112 / luminance : 1;
      resolve(`rgb(${Math.round(red * shade)}, ${Math.round(green * shade)}, ${Math.round(blue * shade)})`);
    } catch {
      resolve(`hsl(${fallbackHue} 58% 38%)`);
    }
  };
  image.onerror = () => resolve(`hsl(${fallbackHue} 58% 38%)`);
  image.src = imageUrl;
});

const MallExperience = () => {
  const { mallId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems = [] } = useSelector((state) => state.cart);
  const { data: mall, isLoading, isError, error } = useGetMallDetailsQuery(mallId);
  const [recordVisit] = useRecordMallVisitMutation();
  const [mallAccent, setMallAccent] = useState("#176b63");
  const [shopAccents, setShopAccents] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [showTop, setShowTop] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 800], reduceMotion ? [0, 0] : [0, 110]);

  useEffect(() => {
    if (!mall) return;
    const previousTitle = document.title;
    document.title = `${mall.name} | ShopLink Mall`;
    let description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.content;
    const createdDescription = !description;
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = mall.description || `Explore shops and products at ${mall.name} on ShopLink.`;
    colorFromImage(mall.coverImage || mall.image).then(setMallAccent);
    const visitorKey = getVisitorKey();
    recordVisit({ mallId, visitorKey }).unwrap().catch((visitError) => {
      console.error("Could not record mall visit:", visitError);
    });
    return () => {
      document.title = previousTitle;
      if (createdDescription) description.remove();
      else description.content = previousDescription;
    };
  }, [mall, mallId, recordVisit]);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 560);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mall?.shops?.length) return;
    let cancelled = false;
    Promise.all(mall.shops.map((shop, index) => (
      colorFromImage(shop.image || shop.coverImage, 150 + index * 43).then((color) => [shop._id, color])
    ))).then((entries) => {
      if (!cancelled) setShopAccents(Object.fromEntries(entries));
    });
    return () => { cancelled = true; };
  }, [mall]);

  const categories = useMemo(() => {
    const unique = new Map();
    for (const shop of mall?.shops || []) {
      for (const product of shop.products || []) {
        if (product.category?._id) unique.set(String(product.category._id), product.category.name);
      }
    }
    return [...unique.entries()].map(([id, name]) => ({ id, name }));
  }, [mall]);

  const mallShopIds = useMemo(
    () => new Set((mall?.shops || []).map((shop) => String(shop._id))),
    [mall]
  );
  const cartMallShopIds = useMemo(() => {
    const ids = new Set();
    for (const item of cartItems) {
      const id = typeof item.shop === "object" ? item.shop?._id : item.shop;
      if (id && mallShopIds.has(String(id))) ids.add(String(id));
    }
    return ids;
  }, [cartItems, mallShopIds]);
  const bonusEligible = cartMallShopIds.size >= 2;

  const visitShop = useCallback((shopId) => {
    document.getElementById(`mall-shop-${shopId}`)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [reduceMotion]);

  if (isLoading) return <main className="beast-mall-page"><Loader /></main>;
  if (isError) return <main className="beast-mall-page"><Message variant="danger">{error?.data?.message || "This mall could not be loaded."}</Message></main>;
  if (!mall) return null;

  const featured = mall.featuredProducts?.length
    ? mall.featuredProducts
    : (mall.shops || []).flatMap((shop) => shop.products || []).slice(0, 8);

  return (
    <main className="beast-mall-page beast-mall-page--detail" style={{ "--mall-accent": mallAccent }}>
      <Link to="/malls" className="mall-all-link">← All malls</Link>
      <section className="mall-cinema-hero">
        <Motion.img src={getOptimizedHeroImage(mall.coverImage || mall.image)} alt="" fetchPriority="high" style={{ y: heroImageY }} />
        <div className="mall-cinema-hero__grain" aria-hidden="true" />
        <div className="mall-directory-hero__sparkles" aria-hidden="true"><i /><i /><i /><i /></div>
        <Motion.div
          className="mall-cinema-hero__content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7 }}
        >
          {mall.isFeaturedMall && <span className="mall-feature-ribbon">⚡ FEATURED</span>}
          <Motion.span className="mall-official-badge" initial={reduceMotion ? false : { opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.25 }}><FaStar /> OFFICIAL MALL 🏆</Motion.span>
          <p className="mall-kicker"><FaMapMarkerAlt /> {mall.location}</p>
          <h1>{mall.name}</h1>
          <p className="mall-cinema-hero__description">{mall.description || "A flagship destination for independent storefronts and standout finds."}</p>
          <div className="mall-live-stats">
            <span><strong>{mall.shopCount}</strong> shops</span>
            <span><strong>{mall.productCount}</strong> products</span>
            <span><strong>{mall.orderCountThisWeek}</strong> orders this week</span>
            <span><strong>{mall.visitsThisWeek}</strong> visits this week</span>
          </div>
          {mall._id === mall.mostLovedMallId && <span className="mall-loved-badge"><FaStar /> Most loved mall</span>}
        </Motion.div>
        <Motion.div className="mall-cinema-glow" aria-hidden="true" animate={reduceMotion ? {} : { y: [0, -9, 0], opacity: [0.35, 0.6, 0.35] }} transition={{ duration: 5, repeat: Infinity }} />
      </section>

      <nav className="mall-section-nav" aria-label="Mall shops">
        <a href="#mall-exclusives" onClick={(event) => { event.preventDefault(); document.getElementById("mall-exclusives")?.scrollIntoView({ behavior: "smooth" }); }}>Mall exclusives</a>
        {(mall.shops || []).map((shop) => (
          <button type="button" key={shop._id} onClick={() => visitShop(shop._id)}>{shop.name}</button>
        ))}
      </nav>

      <section id="mall-exclusives" className="mall-exclusive-section">
        <div className="mall-section-heading">
          <div><p className="mall-kicker"><FaFire /> CURATED ACROSS THE MALL</p><h2>🔥 Mall Exclusive Deals</h2></div>
          <span>Featured across all storefronts</span>
        </div>
        {featured.length ? (
          <div className="mall-exclusive-row">
            {featured.slice(0, 8).map((product, index) => (
              <Motion.div key={product._id} className="mall-exclusive-card" whileHover={reduceMotion ? {} : { y: -5, rotate: index % 2 ? 0.5 : -0.5 }} whileTap={{ scale: 0.98 }}>
                <ProductCard p={product} />
              </Motion.div>
            ))}
          </div>
        ) : <p className="mall-muted">Featured products from mall shops will appear here.</p>}
      </section>

      <div className="mall-sticky-categories" aria-label="Filter mall storefronts by category">
        <button type="button" className={activeCategory === "all" ? "is-active" : ""} onClick={() => setActiveCategory("all")}>All storefronts</button>
        {categories.map((category) => (
          <button type="button" key={category.id} className={activeCategory === category.id ? "is-active" : ""} onClick={() => setActiveCategory(category.id)}>
            {category.name}
          </button>
        ))}
      </div>

      <section className="mall-storefronts" aria-label="Mall storefronts">
        {(mall.shops || []).filter((shop) => activeCategory === "all" || shop.category?._id === activeCategory || shop.products?.some((product) => String(product.category?._id) === activeCategory)).map((shop, index) => (
          <Motion.section
            id={`mall-shop-${shop._id}`}
            className="mall-storefront"
            key={shop._id}
            style={{ "--shop-accent": shopAccents[shop._id] || `hsl(${(index * 67 + 156) % 360} 54% 37%)` }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: reduceMotion ? 0 : 0.5 }}
          >
            <header className="mall-storefront__header">
              <img src={shop.image} alt="" loading="lazy" decoding="async" />
              <div><p>{shop.category?.name || "INDEPENDENT STOREFRONT"}</p><h2>{shop.name}</h2><span>{shop.description || "Curated finds from this ShopLink storefront."}</span></div>
              <Link to={`/shops/${shop._id}`} className="mall-storefront__visit">Visit shop <span aria-hidden="true">↗</span></Link>
            </header>
            {shop.products?.length ? (
              <div className="mall-storefront__products">
                {shop.products.map((product) => (
                  <Motion.div key={product._id} className="mall-storefront__product" whileHover={reduceMotion ? {} : { y: -4 }} whileTap={{ scale: 0.985 }}>
                    <ProductCard p={product} />
                  </Motion.div>
                ))}
              </div>
            ) : <p className="mall-muted">This storefront is preparing its first products.</p>}
          </Motion.section>
        ))}
      </section>

      <aside className={`mall-cart-nudge${bonusEligible ? " is-eligible" : ""}`} aria-live="polite">
        <div><strong>{bonusEligible ? "Mall-wide reward unlocked ✨" : "Shop the whole mall"}</strong><span>
          {bonusEligible
            ? "You’ve selected products from 2+ shops. Earn 50 bonus points after confirming receipt for the complete order."
            : "Order from 2+ shops in this mall and earn 50 bonus points after confirming receipt for the complete order."}
        </span></div>
        {!userInfo && <Link to={`/login?redirect=${encodeURIComponent(`/malls/${mallId}`)}`}>Sign in to earn</Link>}
      </aside>

      {showTop && (
        <button type="button" className="mall-back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })} aria-label="Back to top">
          <FaArrowUp />
        </button>
      )}
    </main>
  );
};

export default MallExperience;
