import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/Api/productApiSlice";
import { useEffect, useState } from "react";

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
import TrustSection from "../components/sections/TrustSection";

const HomeUpdated1 = () => {
  const { keyword } = useParams();
  const { data, isLoading, error } = useGetProductsQuery({ keyword });

  const [showLoader, setShowLoader] = useState(true);

  // force loader for exactly 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // still show loader if API is loading OR 1sec delay is active
  if (showLoader || isLoading) {
    return <UltraLoader />;
  }

  return (
    <>
      <HeaderUpdated />

      <main className="bg-white">
        {/* Hero Section - Only show on homepage */}
        {!keyword && <HeroSection />}

        {/* Category Strip */}
        {!keyword && <CategoryStrip />}

        {/* Featured Shops */}
        {!keyword && <FeaturedShops />}

        {/* Featured Products Carousel */}
        {!keyword && (
          <div className="w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg mb-12 px-4">
            <ProductCarousel />
          </div>
        )}

        {/* Popular Products Section */}
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

            {/* Product Grid */}
            <div className="relative max-w-6xl mx-auto px-4 mb-12">
              {data?.products && data.products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {data.products.map((product) => (
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

        {/* Trust Section */}
        {!keyword && <TrustSection />}
      </main>
    </>
  );
};

export default HomeUpdated1;
