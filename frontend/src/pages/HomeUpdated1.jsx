import { Link, useLocation } from "react-router-dom";
import { useGetProductsQuery, useGetTopProductsQuery } from "../redux/Api/productApiSlice";
import { useEffect, useMemo, useState } from "react";

import UltraLoader from "../components/UltraLoader";
import Message from "../components/Message";
import HeaderUpdated from "../components/HeaderUpdated";
import ProductCarousel from "./products/ProductCarousel";
import Product from "./products/Product";
import { ProductGridSkeleton } from "../components/SkeletonLoader";

// New premium sections
import HeroSection from "../components/sections/HeroSection";
import CategoryStrip from "../components/sections/CategoryStrip";
import FeaturedShops from "../components/sections/FeaturedShops";
import LocalShops from "../components/sections/LocalShops";
import TrustSection from "../components/sections/TrustSection";
import { getOptimizedProductImage } from "../utils/imageOptimization";

const RankingCard = ({ product, label, accentClass }) => {
  if (!product) return null;

  const price = Number(product.price || 0);
  const rating = Number(product.rating || 0);
  const reviews = Number(product.numReviews || 0);
  const image = getOptimizedProductImage(product.image, 600);

  return (
    <Link to={`/product/${product._id}`} className="group block rounded-3xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${accentClass}`}>
          {label}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">{product.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{product.brand || 'Campus favorite'}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-emerald-600">KES {price.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">⭐ {rating.toFixed(1)} · {reviews} reviews</div>
        </div>
      </div>
    </Link>
  );
};

const RankingSection = ({ title, subtitle, products, accentClass }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto mb-12 max-w-6xl px-4">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Trending</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">{title}</h2>
        </div>
        <span className="text-sm text-slate-500">{subtitle}</span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <RankingCard key={product._id} product={product} label={title.split(' ')[0]} accentClass={accentClass} />
        ))}
      </div>
    </section>
  );
};

const HomeUpdated1 = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";
  const { data, isLoading, error } = useGetProductsQuery(
    { keyword },
    { skip: !keyword }
  );
  const { data: topProductsData } = useGetTopProductsQuery();

  const [showLoader, setShowLoader] = useState(true);

  const baseProducts = useMemo(() => {
    const productList = data?.products || topProductsData || [];
    return Array.isArray(productList) ? productList : [];
  }, [data, topProductsData]);

  const bestRatedProducts = useMemo(() => {
    return [...baseProducts]
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 4);
  }, [baseProducts]);

  const mostBoughtProducts = useMemo(() => {
    return [...baseProducts]
      .sort((a, b) => {
        const scoreA = (Number(a.numReviews) || 0) * 3 + (Number(a.inStock) || 0);
        const scoreB = (Number(b.numReviews) || 0) * 3 + (Number(b.inStock) || 0);
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [baseProducts]);

  const mostRequestedProducts = useMemo(() => {
    return [...baseProducts]
      .sort((a, b) => {
        const scoreA = (Number(a.quantity) || 0) + (Number(a.numReviews) || 0) * 2;
        const scoreB = (Number(b.quantity) || 0) + (Number(b.numReviews) || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [baseProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (showLoader || isLoading) {
    return <UltraLoader />;
  }

  return (
    <>
      <HeaderUpdated />

      <main className="bg-white">
        {!keyword && <HeroSection />}

        {!keyword && <CategoryStrip />}

        {!keyword && <FeaturedShops />}

        {!keyword && <LocalShops />}

        {!keyword && (
          <div className="w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg mb-12 px-4">
            <ProductCarousel />
          </div>
        )}

        {!keyword && (
          <>
            <RankingSection
              title="Best Rated"
              subtitle="Top quality picks"
              products={bestRatedProducts}
              accentClass="bg-emerald-600 text-white"
            />

            <RankingSection
              title="Most Bought"
              subtitle="Campus favorites"
              products={mostBoughtProducts}
              accentClass="bg-orange-500 text-white"
            />

            <RankingSection
              title="Most Requested"
              subtitle="Student demand"
              products={mostRequestedProducts}
              accentClass="bg-sky-600 text-white"
            />
          </>
        )}

        {error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <div className="flex justify-between items-center mt-10 bg-white px-6 md:px-10 py-6 rounded-xl shadow-md max-w-6xl mx-auto mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                {keyword ? `Search Results: "${keyword}"` : "Popular Products"}
              </h1>

              {!keyword && (
                <Link
                  to="/shop"
                  className="bg-teal-600 text-white font-semibold rounded-lg py-2 px-8 shadow-md hover:bg-teal-700 transition-all duration-200 hover:shadow-lg"
                >
                  View All
                </Link>
              )}
            </div>

            <div className="relative max-w-6xl mx-auto px-4 mb-12">
              {baseProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {baseProducts.slice(0, 10).map((product) => (
                    <Product key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found</p>
                </div>
              )}
            </div>
          </>
        )}

        {!keyword && <TrustSection />}
      </main>
    </>
  );
};

export default HomeUpdated1;
