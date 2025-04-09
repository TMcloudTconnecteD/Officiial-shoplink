import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const SmallProduct = ({ product }) => {
  return (
    <div className="w-[20rem] ml-[2rem] p-3 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-auto rounded-lg object-cover"
        />
        {/* Ensure HeartIcon is properly positioned */}
        <div className="absolute top-2 right-2">
          <HeartIcon product={product} />
        </div>
      </div>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h2 className="flex justify-between items-center text-gray-900 dark:text-gray-200">
            <div>{product.name}</div>
            <span className="bg-pink-100 text-pink-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
              KES {product.price}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default SmallProduct;