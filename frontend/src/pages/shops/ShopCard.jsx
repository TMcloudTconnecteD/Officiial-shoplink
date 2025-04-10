import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "../../pages/products/HeartIcon";

const ShopCard = ({ shop }) => {
  const dispatch = useDispatch();

  // Assuming shop.products is an array of products for that shop
  const addToCartHandler = (product, qty) => {
    // Add the specific product from the shop to the cart
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added to cart", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  return (
    <div className="max-w-sm bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
      <section className="relative">
        <Link to={`/${shop._id}`}>
          <span className="absolute top-3 left-3 bg-pink-100 text-pink-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
            {shop.name}
          </span>
          <img
            className="cursor-pointer w-full h-48 object-cover"
            src={shop.image}  // Assuming shop has an image property
            alt={shop.name}
          />
        </Link>
        <HeartIcon product={shop} />
      </section>

      <div className="p-5">
        <div className="flex justify-between items-start">
          <h5 className="text-xl font-semibold text-white">{shop.name}</h5>
          <p className="text-lg font-semibold text-pink-500">
            {/* You can display the price range here if needed */}
            {/* {shop.price?.toLocaleString("en-US", { style: "currency", currency: "KES" })} */}
          </p>
        </div>

        <p className="mt-2 text-sm text-gray-300">
          {shop.description?.substring(0, 60)}...
        </p>

        <div className="flex justify-between items-center mt-4">
          <Link
            to={`/shop/${shop._id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300"
          >
            View Shop
            <svg
              className="w-3 h-3 ml-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Link>

          {/* This button adds a product (not the shop) to the cart */}
          <button
            className="p-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white"
            onClick={() => {
              // Example: add the first product from the shop to the cart
              const product = shop.products[0];  // Assuming each shop has a 'products' array
              addToCartHandler(product, 1);  // Adjust the quantity as needed
            }}
          >
            <AiOutlineShoppingCart size={25} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
