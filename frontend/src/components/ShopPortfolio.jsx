import React from "react";
import { FaCartPlus, FaEnvelope, FaPhone } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/features/cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import HeartIcon from "../pages/products/HeartIcon";
import HeaderUpdated from "../components/HeaderUpdated";

const ShopPortfolio = ({ shop, products }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
  };

  const handleClose = () => {
    navigate("/shops/all");
  };

  return (
    <>
      <HeaderUpdated />

      <main className="pt-28 bg-gray-100 min-h-screen px-6">
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-xl p-8 gap-10 max-w-7xl mx-auto">

          {/* Shop info */}
          <div className="md:w-1/3 flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md">
            <img
              src={shop.image}
              alt={shop.name}
              className="rounded-full w-40 h-40 object-cover shadow-md"
            />

            <h2 className="text-2xl font-bold mt-4 text-gray-900 text-center">
              {shop.name}
            </h2>

            <div className="flex flex-col space-y-3 w-full mt-6">
              <a
                href={`mailto:${shop.owner.email}`}
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl shadow hover:bg-green-700 transition"
              >
                Email Seller <FaEnvelope />
              </a>
              <a
                href={`tel:${shop.telephone}`}
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl shadow hover:bg-green-700 transition"
              >
                Call Seller <FaPhone />
              </a>
            </div>

            <button
              onClick={handleClose}
              className="mt-6 bg-gray-300 py-2 px-6 rounded-xl hover:bg-gray-400 transition font-semibold"
            >
              Close
            </button>
          </div>

          {/* Products */}
          <div className="md:w-2/3">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              All Products
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[650px] overflow-y-auto pr-2">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border rounded-xl shadow-md hover:shadow-xl transition p-4 cursor-pointer flex flex-col"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />

                  <h4 className="text-lg font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-gray-700 mt-1 text-sm">KES {product.price}</p>

                  <div className="mt-auto flex justify-between items-center pt-3">
                    <Link
                      to={`/product/${product._id}`}
                      state={{ fromShop: shop._id }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => addToCartHandler(product)}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
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
