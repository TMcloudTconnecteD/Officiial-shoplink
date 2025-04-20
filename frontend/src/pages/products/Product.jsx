import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

// Product card component
const Product = ({ product }) => {
  return (
    <div className="w-full sm:w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[30rem] mx-auto my-4 p-3 rounded-xl shadow-lg bg-white dark:bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="relative">
        {/* Product image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[18rem] object-cover rounded-lg"
        />

        {/* Heart icon for wishlist */}
        <div className="absolute top-2 right-2 z-10">
          <HeartIcon product={product} />
        </div>
      </div>

      <div className="p-4">
        {/* Product name and price */}
        <Link to={`/product/${product._id}`}>
          <h2 className="flex justify-between items-center text-lg font-semibold text-gray-800 dark:text-gray-100">
            <span>{product.name}</span>
            <span className="bg-pink-100 text-pink-800 text-sm font-semibold px-3 py-1 rounded-full dark:bg-pink-800 dark:text-white">
              KES{product.price}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default Product;
