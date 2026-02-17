import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import { getOptimizedProductImage } from "../../utils/imageOptimization";

// Product card component with mobile-friendly layout
const Product = ({ product }) => {
  return (
    <div className="group w-full h-full flex flex-col rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image Container - Fixed height to prevent layout shift */}
      <div className="relative w-full h-40 sm:h-48 md:h-[14rem] lg:h-[16rem] overflow-hidden bg-gray-100">
        <img
          src={getOptimizedProductImage(product.image, 400)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Wishlist Icon - Absolutely positioned over image */}
        <div className="absolute top-3 right-3 z-20">
          <HeartIcon product={product} />
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      {/* Content Container - Flex grow to push to bottom */}
      <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
        {/* Product Info */}
        <Link to={`/product/${product._id}`} className="focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">
          <h2 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2 hover:text-emerald-600 transition-colors">
            {product.name}
          </h2>
        </Link>

        {/* Description */}
        <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-2 md:line-clamp-1">
          {product.description || 'Quality product at best price'}
        </p>

        {/* Price and badge - Always at bottom */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-sm md:text-xs text-gray-500">From</span>
            <div className="text-lg md:text-xl font-bold text-emerald-600">
              KES {product.price?.toLocaleString()}
            </div>
          </div>
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
            In Stock
          </span>
        </div>
      </div>
    </div>
  );
};

export default Product;
