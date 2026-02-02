// src/pages/products/SmallProduct.jsx
import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const SmallProduct = ({ product }) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition bg-white">
      <div className="relative">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-36 sm:h-44 md:h-56 object-cover rounded-t-2xl transition-transform hover:scale-105"
          />
        </Link>
        <div className="absolute top-2 right-2">
          <HeartIcon product={product} />
        </div>
      </div>

      <div className="p-3 md:p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm md:text-base font-semibold text-zinc-900 truncate">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs md:text-sm text-emerald-600 font-bold mt-1">
          KES {product.price?.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default SmallProduct;
