import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/Api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import HeaderUpdated from "../components/HeaderUpdated";
import ProductCarousel from "./products/ProductCarousel";
import VirtualTown from "../components/VirtualTown";
import Product from "./products/Product";
import StreetScenery from '../components/ThreeDMall/StreetScenery'

const HomeUpdated1 = () => {
  const { keyword } = useParams();
  const { data, isLoading, error } = useGetProductsQuery({ keyword });

  return (
    <>
      {!keyword ? <HeaderUpdated /> : null}
      {!keyword ? (
        <>
          <div>
            <ProductCarousel />
          </div>
          <div
            className="w-full mt-4"
            style={{
              maxHeight: '600px',
              height: 'min(600px, 50vh)',
              overflow: 'hidden',
            }}
          >
            <StreetScenery />
      
          </div>
        </>
      ) : null}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="ml-[20rem] mt-[10rem] text-[3rem]">
              Special Products
            </h1>

            <Link
              to="/shop"
              className="bg-pink-600 font-bold rounded-full py-2 px-10 mr-[18rem] mt-[10rem] animate-pulse shadow-lg shadow-pink-500/75"
            >
              Shop
            </Link>
          </div>

          <div>
            <div className="flex justify-center flex-wrap mt-[2rem]">
              {data.products.map((product) => (
                <div key={product._id}>
                  <Product product={product} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HomeUpdated1;
