import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import HeartIcon from "./HeartIcon";
import Ratings from "./Ratings";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (error) {
      toast.error(error?.data || error.message);
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  return (
    <>
      {/* Go Back Link */}
      <div className="container mx-auto px-4 mt-4">
        <Link
          to="/"
          className="text-pink-600 font-semibold hover:underline"
        >
          Go Back
        </Link>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.message}
        </Message>
      ) : (
        <>
          {/* Main Details Section */}
          <div className="container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
            {/* Left Side - Product Image & Heart Icon */}
            <div className="relative w-full lg:w-1/2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto max-h-[30rem] object-cover rounded-lg shadow-lg"
              />
              <div className="absolute top-4 right-4">
                <HeartIcon product={product} />
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {product.name}
              </h2>
              <p className="my-4 text-gray-700 dark:text-gray-400">
                {product.description}
              </p>
              <p className="text-5xl my-4 font-extrabold text-gray-900 dark:text-white">
                KES {product.price}
              </p>

              <div className="flex flex-wrap justify-between text-gray-800 dark:text-gray-300 mb-6">
                {/* Left group */}
                <div>
                  <h1 className="flex items-center mb-3">
                    <FaStore className="mr-2 text-pink-600" /> Brand: {product.brand}
                  </h1>
                  <h1 className="flex items-center mb-3 w-full">
                    <FaClock className="mr-2 text-pink-600" /> Added:{" "}
                    {moment(product.createdAt).fromNow()}
                  </h1>
                  <h1 className="flex items-center mb-3">
                    <FaStar className="mr-2 text-pink-600" /> Reviews:{" "}
                    {product.numReviews}
                  </h1>
                </div>
                {/* Right group */}
                <div>
                  <h1 className="flex items-center mb-3">
                    <FaStar className="mr-2 text-pink-600" /> Ratings: {product.rating}
                  </h1>
                  <h1 className="flex items-center mb-3">
                    <FaShoppingCart className="mr-2 text-pink-600" /> Quantity:{" "}
                    {product.quantity}
                  </h1>
                  <h1 className="flex items-center mb-3 w-[10rem]">
                    <FaBox className="mr-2 text-pink-600" /> In Stock: {product.countInStock}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between">
                <Ratings
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                />

                {product.countInStock > 0 && (
                  <div>
                    <select
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="p-2 w-[6rem] rounded-md bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="btn-container mt-4">
                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="container mx-auto px-4 mt-12">
            <ProductTabs
              loadingProductReview={loadingProductReview}
              userInfo={userInfo}
              submitHandler={submitHandler}
              rating={rating}
              setRating={setRating}
              comment={comment}
              setComment={setComment}
              product={product}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ProductDetails;