import React from "react";
import ProductCarousel from "../pages/products/ProductCarousel";
import { FaCartPlus, FaEnvelope, FaPhone } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/features/cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import HeartIcon from "../pages/products/HeartIcon";
import HeaderUpdated from "../components/HeaderUpdated";

const ShopPortfolio = ({ shop, products }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const topProducts = products.slice(0, 5); // carousel
  const allProducts = products;

  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
  };

  const handleClose = () => {
    navigate("/shops/all");
  };

  return (
    <>
      <HeaderUpdated />

      <main className="pt-28 bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg p-4 sm:p-6 gap-6 max-w-7xl mx-auto">
          {/* Left: Shop info */}
          <div className="md:w-1/3 flex flex-col items-center space-y-6 p-4 border rounded-lg shadow-md">
            <img
              src={shop.image}
              alt={shop.name}
              className="rounded-full w-32 h-32 sm:w-48 sm:h-48 object-cover shadow-md"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              {shop.name}
            </h2>
            <div className="flex flex-col space-y-3 w-full">
              <a
                href={`mailto:${shop.owner.email}`}
                className="flex items-center justify-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
              >
                <span>Email Seller</span>
                <FaEnvelope />
              </a>
              <a
                href={`tel:${shop.telephone}`}
                className="flex items-center justify-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
              >
                <span>Call Seller</span>
                <FaPhone />
              </a>
            </div>
            <button
              onClick={handleClose}
              className="mt-4 bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition font-semibold"
            >
              Close
            </button>
          </div>

          {/* Right: Products */}
          <div className="md:w-2/3 flex flex-col">
            {/* Carousel */}
            <div className="relative w-full overflow-hidden rounded-lg shadow-md max-h-[220px] sm:max-h-[320px]">
              <ProductCarousel products={topProducts} />
            </div>

            {/* Grid */}
            <h3 className="mt-6 sm:mt-8 mb-4 text-lg sm:text-xl font-semibold text-gray-800 border-b pb-2">
              All Products
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto max-h-[500px] sm:max-h-[600px]">
              {allProducts.map((product) => (
                <div
                  key={product._id}
                  className="border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 sm:h-40 object-cover rounded-md mb-3"
                  />
                  <h4 className="text-sm sm:text-lg font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    KES {product.price}
                  </p>

                  <div className="mt-auto flex justify-between items-center space-x-2">
                    <Link
                      to={`/product/${product._id}`}
                      className="bg-pink-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-pink-600 transition text-xs sm:text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => addToCartHandler(product)}
                      className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-600 transition text-xs sm:text-sm"
                    >
                      <FaCartPlus />
                    </button>
                    <HeartIcon product={product} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ShopPortfolio;
