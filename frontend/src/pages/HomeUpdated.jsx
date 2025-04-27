import React from "react";
import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import HeaderUpdated from "../components/HeaderUpdated";
import Product from "./products/Product";
import ProductCarousel from "./products/ProductCarousel";
import ThreeDMall from "../components/ThreeDMall";

const HomeUpdated = () => {
  const { keyword } = useParams();
  const { data, isLoading, error } = useGetProductsQuery({ keyword });

  const handleViewProduct = (product) => alert(`View product: ${product.name}`);

  const handleAddToCart = (product) => alert(`Add to cart: ${product.name}`);

  return (
    <>
      {!keyword && <HeaderUpdated />}
      {!keyword && (
        <div style={{ display: "flex", height: "600px" }}>
          <div style={{ flex: 1, marginRight: "1rem", overflowY: "auto" }}>
            <ThreeDMall
              products={data ? data.products : []}
              onViewProduct={handleViewProduct}
              onAddToCart={handleAddToCart}
            />
          </div>
          <div style={{ flex: 1, marginLeft: "1rem", overflowY: "auto" }}>
            <ProductCarousel />
          </div>
        </div>
      )}
      {isLoading && <Loader />}
      {error && <Message variant="danger">{error?.data?.message || error.error}</Message>}
      {!isLoading && !error && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="ml-[20rem] mt-[10rem] text-[3rem]">Special Products</h1>
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

export default HomeUpdated;
