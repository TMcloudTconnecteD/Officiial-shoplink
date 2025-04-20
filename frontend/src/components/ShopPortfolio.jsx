import React from "react";
import ProductCarousel from "../pages/products/ProductCarousel";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/features/cart/cartSlice";
import { Link } from "react-router-dom";
import HeartIcon from "../pages/products/HeartIcon";

const ShopPortfolio = ({ shop, products, onClose }) => {
  const dispatch = useDispatch();
  const topProducts = products.slice(0, 5); // top products for carousel
  const allProducts = products;

  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg p-6 gap-6 max-w-7xl mx-auto">
      {/* Left half: Shop image and owner info */}
      <div className="md:w-1/3 flex flex-col items-center space-y-6 p-4 border rounded-lg shadow-md">
        <img
          src={shop.image}
          alt={shop.name}
          className="rounded-full w-48 h-48 object-cover shadow-md"
        />
        <h2 className="text-2xl font-bold text-gray-900">{shop.name}</h2>
        <div className="flex flex-col space-y-3 w-full">
          <a
            href={`mailto:${shop.owner.email}`}
            className="flex items-center justify-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
          >
            <FaEnvelope />
            <span>Email: {shop.owner.email}</span>
          </a>
          <a
            href={`tel:${shop.owner.telephone}`}
            className="flex items-center justify-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
          >
            <FaPhone />
            <span>Call: {shop.owner.telephone}</span>
          </a>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition font-semibold"
        >
          Close
        </button>
      </div>

      {/* Right half: Product carousel and grid */}
      <div className="md:w-2/3 flex flex-col">
        <ProductCarousel products={topProducts} />
        <h3 className="mt-8 mb-4 text-xl font-semibold text-gray-800 border-b pb-2">
          All Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto max-h-[600px]">
          {allProducts.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600 mt-1">${product.price}</p>

              <div className="mt-auto flex justify-between items-center space-x-2">
                <Link
                  to={`/product/${product._id}`}
                  className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 transition text-sm"
                >
                  View Product
                </Link>
                <button
                  onClick={() => addToCartHandler(product)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                >
                  Add to Cart
                </button>
                <HeartIcon product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopPortfolio;
