import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/Api/productApiSlice";
import Rating from "./Rating";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { addToCart } from "../../redux/features/cart/cartSlice";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import ProductTabs from "./Tabs";
import HeartIcon from "./HeartIcon";

const Products = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

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
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      {/* Header / Go Back Link */}
      <div className="container mx-auto px-4 mt-4 py-4 flex justify-between items-center">
        <Link className="text-pink-600 font-semibold hover:underline " to="/">
          Go Back
        </Link>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          {/* Product Detail Section */}
          <div className="container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8 items-start">
            <div className="relative w-full lg:w-1/2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto max-h-[30rem] object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4">
                <HeartIcon product={product} />
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-between  space-y-6">
              <h2 className="text-3xl font-semibold text-orange-800 dark:text-orange-100">
                {product.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
              <p className="text-5xl font-extrabold text-pink-600">
                KES{product.price}
              </p>
              {/* --------------------------------------------------- */}
              <div className="flex flex-col md:flex-row justify-between gap-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div>
                  <h1 className="flex items-center mb-4 text-gray-700 dark:text-gray-200">
                    <FaStore className="mr-2 text-orange-500" /> Brand: {product.brand}
                  </h1>
                  <h1 className="flex items-center mb-4 text-gray-700 dark:text-gray-200">
                    <FaClock className="mr-2 text-pink-500" /> Added:{" "}
                    {moment(product.createdAt).fromNow()}
                  </h1>
                  <h1 className="flex items-center mb-4 text-gray-700 dark:text-gray-200">
                    <FaStar className="mr-2 text-pink-500" /> Reviews: {product.numReviews}
                  </h1>
                </div>
                <div>
                  <h1 className="flex items-center mb-4 text-gray-700 dark:text-gray-200">
                    <FaStar className="mr-2 text-pink-500" /> Ratings: {rating}
                  </h1>
                  <h1 className="flex items-center mb-4 text-gray-700 dark:text-gray-200">
                    <FaShoppingCart className="mr-2 text-pink-500" /> Quantity: {product.quantity}
                  </h1>
                  <h1 className="flex items-center mb-4 text-gray-700 dark:text-gray-200">
                    <FaBox className="mr-2 text-orange-500" /> In Stock: {product.inStock}
                  </h1>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Rating value={product.rating} text={`${product.numReviews} reviews`} />

                {product.inStock > 0 && (
                  <div>
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="p-2 rounded-lg text-black w-24"
                    >
                      {[...Array(product.inStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="btn-container">
                <button
                  onClick={addToCartHandler}
                  disabled={product.inStock === 0}
                  className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg transition-all mt-2 disabled:opacity-50"
                >
                  Add To Cart
                </button>
              </div>
              {/* --------------------------------------------------- */}
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

export default Products;
