import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";
import ImageComponent from "../../components/ImageComponent";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();

  // Debug log for image URL
  console.log('Product Image URL:', p?.image);

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added successfully", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  return (
    <div className="max-w-sm bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
      <section className="relative">
        <Link to={`/product/${p._id}`}>
          <span className="absolute top-3 left-3 bg-pink-100 text-pink-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
            {p?.brand}
          </span>          <ImageComponent
            className="cursor-pointer w-full h-48 object-cover"
            src={p.image}
            alt={p.name}
          />
        </Link>
        <HeartIcon product={p} />
      </section>

      <div className="p-5">
        <div className="flex justify-between items-start">
          <h5 className="text-xl font-semibold text-white">{p?.name}</h5>
          <p className="text-lg font-semibold text-pink-500">
            {p?.price?.toLocaleString("en-US", {
              style: "currency",
              currency: "KES",
            })}
          </p>
        </div>

        <p className="mt-2 text-sm text-gray-300">
          {p?.description?.substring(0, 60)}...
        </p>

        <div className="flex justify-between items-center mt-4">
          <Link
            to={`/product/${p._id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300"
          >
            Read More
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

          <button
            className="p-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white"
            onClick={() => addToCartHandler(p, 1)}
          >
            <AiOutlineShoppingCart size={25} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
