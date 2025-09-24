import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/Api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import HeaderUpdated from "../components/HeaderUpdated";
import ProductCarousel from "./products/ProductCarousel";
import Product from "./products/Product";

const HomeUpdated1 = () => {
  const { keyword } = useParams();
  const { data, isLoading, error } = useGetProductsQuery({ keyword });

  return (
    <>
      <HeaderUpdated />

      <main className="pt-28 bg-gray-50 min-h-screen">
        {!keyword && (
          <div>
            <ProductCarousel />
          </div>
        )}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <div className="flex justify-between items-center mt-10 px-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Special Products
              </h1>

              <Link
                to="/shop"
                className="bg-cyan-400 text-white font-bold rounded-full py-2 px-8 shadow-lg hover:bg-pink-700 transition"
              >
                Shop
              </Link>
            </div>

            <div className="flex justify-center flex-wrap gap-6 mt-8 px-4">
              {data?.products?.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default HomeUpdated1;
