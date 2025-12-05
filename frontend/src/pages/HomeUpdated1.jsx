import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/Api/productApiSlice";
import { useEffect, useState } from "react";

import UltraLoader from "../components/UltraLoader";
import Message from "../components/Message";
import HeaderUpdated from "../components/HeaderUpdated";
import ProductCarousel from "./products/ProductCarousel";
import Product from "./products/Product";

const HomeUpdated1 = () => {
  const { keyword } = useParams();
  const { data, isLoading, error } = useGetProductsQuery({ keyword });

  const [showLoader, setShowLoader] = useState(true);

  // force loader for exactly 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // still show loader if API is loading OR 10sec delay is active
  if (showLoader || isLoading) {
    return <UltraLoader />;
  }

  return (
    <>
      <HeaderUpdated />

      <main className="pt-28 bg-gray-100 min-h-screen">
        {!keyword && (
          <div className="w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg">
            <ProductCarousel />
          </div>
        )}

        {error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <div className="flex justify-between items-center mt-10 bg-white px-10 py-4 rounded-xl shadow-md max-w-6xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
                Special Products
              </h1>

              <Link
                to="/shop"
                className="bg-green-600 text-white font-semibold rounded-full py-2 px-8 shadow-md hover:bg-green-700 transition"
              >
                Shop
              </Link>
            </div>

            <div className="relative mt-8">
              <div className="flex overflow-x-auto gap-6 px-4 py-4 scrollbar-hide">
                {data?.products?.map((product) => (
                  <div key={product._id} className="flex-none w-64">
                    <Product product={product} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default HomeUpdated1;
