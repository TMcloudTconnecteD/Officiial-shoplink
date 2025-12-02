// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "../products/HeartIcon";


const ProductCard = ({ p }) => {
  const dispatch = useDispatch();

  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success("Added to cart", { autoClose: 1500 });
  };

  return (
    <article className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform hover:scale-[1.03] bg-white dark:bg-zinc-900">
      {/* IMAGE */}
      <div className="relative w-full">
        <Link to={`/product/${p._id}`} state={{ fromShop: p.shop?._id }}>
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-t-2xl transition-transform hover:scale-105"
          />
        </Link>

        {/* Brand Tag */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs bg-white/80 dark:bg-zinc-800/70 text-zinc-900 dark:text-zinc-100 font-semibold">
          {p.brand}
        </span>

        {/* Heart Icon */}
        <div className="absolute top-3 right-3">
          <HeartIcon product={p} />
        </div>
      </div>

      {/* DETAILS */}
      <div className="p-4 ext-zinc-500 dark:text-zinc-300">
        <Link to={`/product/${p._id}`} state={{ fromShop: p.shop?._id }}>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {p.name}
          </h3>
        </Link>

        <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 line-clamp-2">
          {p.description || "Amazing product you’ll love!"}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              KES {p.price?.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              In stock: {p.inStock}
            </div>
          </div>

          <button
            onClick={() => addToCartHandler(p)}
            className="p-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition shadow"
          >
            <AiOutlineShoppingCart />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
