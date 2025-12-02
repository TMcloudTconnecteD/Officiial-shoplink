// src/components/ShopPortfolio.jsx
import React from "react";
import { FaCartPlus, FaEnvelope, FaPhone, FaWhatsapp } from "react-icons/fa";
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

    // pulse cart icon if present
    const cart = document.querySelector("#global-cart-icon");
    if (cart) {
      cart.classList.add("cart-pulse");
      setTimeout(() => cart.classList.remove("cart-pulse"), 900);
    }
  };

  const handleClose = () => {
    navigate("/shops/all");
  };

  const whatsappLink = (phone) => {
  if (!phone) return "#";

  const text = String(phone); 

  const cleaned = text.replace(/[^0-9+]/g, "");
  const normalized = cleaned.startsWith("0") ? cleaned.replace(/^0/, "") : cleaned;
  const withCode = normalized.startsWith("+")
    ? normalized.replace("+", "")
    : `254${normalized}`;

  return `https://wa.me/${withCode}`;
};

  return (
    <>
      <HeaderUpdated />

      <main className="pt-28 bg-gray-50 min-h-screen px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src={shop.image} alt={shop.name} className="w-full h-64 object-cover brightness-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <img src={shop.image} alt={shop.name} className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover" />
              <div>
                <h1 className="text-white text-2xl md:text-3xl font-extrabold drop-shadow">{shop.name}</h1>
                <p className="text-sm text-white/90 mt-1">Verified · Boutique</p>
              </div>
            </div>

            <div className="absolute top-6 right-6 flex gap-3">
              <button onClick={() => window.open(whatsappLink(shop.telephone), "_blank")} className="flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition">
                <FaWhatsapp /> Chat
              </button>

              <a href={`tel:${shop.telephone}`} className="flex items-center gap-2 bg-white/90 text-zinc-900 px-4 py-2 rounded-xl shadow hover:scale-105 transition">
                <FaPhone /> Call
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-start gap-4">
              <h2 className="text-xl font-semibold">{shop.name}</h2>
              <p className="text-sm text-zinc-600">{shop.description || "Boutique shop offering curated goods."}</p>

              <div className="w-full grid grid-cols-1 gap-3 mt-4">
                <a href={`mailto:${shop.owner?.email}`} className="flex items-center gap-2 justify-center bg-blue-600 text-white py-2 rounded-xl shadow hover:scale-102 transition">
                  <FaEnvelope /> Email Seller
                </a>

                <a href={whatsappLink(shop.telephone)} target="_blank" rel="noreferrer" className="flex items-center gap-2 justify-center bg-green-500 text-white py-2 rounded-xl shadow hover:scale-102 transition">
                  <FaWhatsapp /> WhatsApp Seller
                </a>

                <a href={`tel:${shop.telephone}`} className="flex items-center gap-2 justify-center bg-gray-100 text-zinc-900 py-2 rounded-xl shadow hover:scale-102 transition">
                  <FaPhone /> Call Seller
                </a>

                <button onClick={handleClose} className="mt-2 text-sm py-2 px-6 rounded-xl bg-zinc-50 hover:bg-zinc-100">Close</button>
              </div>
            </div>

            <div className="flex flex-col md:col-span-2 gap-4">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm text-zinc-500">Collection</p>
                  <h3 className="text-2xl font-bold">{products?.length || 0} items</h3>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-400">Open shop since</p>
                  <p className="font-semibold">2023</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mt-4">
                {products.map((product) => (
                  <div key={product._id} className="rounded-xl overflow-hidden bg-white border hover:shadow-xl transition">
                    <div className="relative">
                      <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
                      <button
                        onClick={() => addToCartHandler(product)}
                        className="absolute right-2 bottom-2 bg-white p-2 rounded-full shadow hover:scale-105 transition"
                        title="Order"
                      >
                        <FaCartPlus />
                      </button>
                    </div>

                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-emerald-600 font-semibold">KES {product.price}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Link to={`/product/${product._id}`} state={{ fromShop: shop._id }} className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-full hover:opacity-95 transition">
                          Order
                        </Link>
                        <HeartIcon product={product} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ShopPortfolio;
