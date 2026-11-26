import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigation } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import { useAllProductsQuery } from "../redux/Api/productApiSlice";
import { useFetchShopsQuery } from "../redux/Api/shopApiSlice";
import ShopLinkMark from "./ShopLinkMark";
import "./AppOpener.css";

const MINIMUM_DISPLAY_MS = 2600;
const MAXIMUM_DISPLAY_MS = 4500;

const AppOpener = () => {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isHome = pathname === "/";
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    isError: productsError,
  } = useAllProductsQuery(undefined, { skip: !isHome });
  const {
    data: shopsData,
    isLoading: shopsLoading,
    isFetching: shopsFetching,
    isError: shopsError,
  } = useFetchShopsQuery(undefined, { skip: !isHome });
  const [documentReady, setDocumentReady] = useState(
    () => document.readyState === "complete"
  );
  const [phase, setPhase] = useState("logo");
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const startedAt = useRef(Date.now());

  const products = useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (Array.isArray(productsData?.products)) return productsData.products;
    if (Array.isArray(productsData?.data)) return productsData.data;
    return [];
  }, [productsData]);
  const shops = useMemo(() => {
    if (Array.isArray(shopsData?.data)) return shopsData.data;
    if (Array.isArray(shopsData)) return shopsData;
    return [];
  }, [shopsData]);
  const photos = useMemo(() => [
    ...shops.map((shop) => ({
      src: shop.image || shop.imageUrl || shop.logo || shop.coverImage,
      label: shop.name || "Local shop",
    })),
    ...products.map((product) => ({
      src: product.image || product.imageUrl,
      label: product.name || "Marketplace find",
    })),
  ].filter((photo) => typeof photo.src === "string" && photo.src.length > 0).slice(0, 4), [products, shops]);

  const homeDataReady = (
    ((!productsLoading && !productsFetching) || productsError)
    && ((!shopsLoading && !shopsFetching) || shopsError)
  );
  const isReady = documentReady && navigation.state === "idle" && (!isHome || homeDataReady);

  useEffect(() => {
    if (document.readyState === "complete") {
      setDocumentReady(true);
      return undefined;
    }

    const handleLoad = () => setDocumentReady(true);
    window.addEventListener("load", handleLoad, { once: true });
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase("photos"), 800),
      window.setTimeout(() => setPhase("tagline"), 2200),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsExiting(true), MAXIMUM_DISPLAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return undefined;
    const remaining = Math.max(0, MINIMUM_DISPLAY_MS - (Date.now() - startedAt.current));
    const timer = window.setTimeout(() => setIsExiting(true), remaining);
    return () => window.clearTimeout(timer);
  }, [isReady]);

  useEffect(() => {
    if (!isExiting) return undefined;
    const timer = window.setTimeout(() => setIsVisible(false), 350);
    return () => window.clearTimeout(timer);
  }, [isExiting]);

  if (!isVisible) return null;

  return (
    <div
      className={`app-opener${isExiting ? " app-opener--exit" : ""}`}
      role="status"
      aria-label="Loading ShopLink marketplace"
    >
      <div className={`app-opener__content app-opener__content--${phase}`}>
        <div className="app-opener__brand">
          <ShopLinkMark className="app-opener__mark" />
          <div className="app-opener__brand-copy">
            <span className="app-opener__wordmark">ShopLink</span>
            <span className="app-opener__powered">
              <span>POWERED BY</span>
              <strong>QUIEKEE VENTURES</strong>
              <FaBolt aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="app-opener__market" aria-hidden="true">
          {photos.length > 0 ? photos.map((photo, index) => (
            <div className={`app-opener__photo app-opener__photo--${index + 1}`} key={`${photo.src}-${index}`}>
              <img src={photo.src} alt="" />
              <span>{photo.label}</span>
            </div>
          )) : (
            <div className="app-opener__market-empty">
              <ShopLinkMark />
              <span>Local shops, one marketplace</span>
            </div>
          )}
        </div>

        <p className="app-opener__tagline">
          <span>Where Every Shop Finds You.</span>
        </p>
        <div className="app-opener__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
};

export default AppOpener;
