import { useState } from "react";
import { Link } from "react-router-dom";
import Ratings from "./Ratings";
import { useGetTopProductsQuery } from "../../redux/Api/productApiSlice";
import SmallProduct from "./SmallProducts";
import Loader from "../../components/Loader";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  const { data, isLoading } = useGetTopProductsQuery();

  const [activeTab, setActiveTab] = useState(null);

  const handleTabClick = (tabNumber) => {
    setActiveTab((prev) => (prev === tabNumber ? null : tabNumber));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col md:flex-row gap-10 mt-10">

      {/* Tab List */}
      <section className="w-full md:w-1/4 space-y-3">
        <div
          className={`p-4 rounded-xl cursor-pointer shadow-md text-lg transition ${
            activeTab === 1
              ? "bg-green-600 text-white"
              : "bg-white text-gray-900 hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick(1)}
        >
          Write Your Review
        </div>

        <div
          className={`p-4 rounded-xl cursor-pointer shadow-md text-lg transition ${
            activeTab === 2
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-900 hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick(2)}
        >
          All Reviews
        </div>

        <div
          className={`p-4 rounded-xl cursor-pointer shadow-md text-lg transition ${
            activeTab === 3
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-900 hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick(3)}
        >
          Related Products
        </div>
      </section>

      {/* Content */}
      <section className="flex-1">
        {activeTab === 1 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            {userInfo ? (
              <form onSubmit={submitHandler}>
                <label className="block text-xl mb-2">Rating</label>
                <select
                  className="p-3 border rounded-xl w-full mb-5 bg-gray-50"
                  required
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="1">Inferior</option>
                  <option value="2">Decent</option>
                  <option value="3">Great</option>
                  <option value="4">Excellent</option>
                  <option value="5">Exceptional</option>
                </select>

                <label className="block text-xl mb-2">Comment</label>
                <textarea
                  className="p-3 border rounded-xl w-full bg-gray-50"
                  rows="3"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>

                <button
                  type="submit"
                  disabled={loadingProductReview}
                  className="mt-5 bg-green-600 text-white py-3 px-10 rounded-xl shadow hover:bg-green-700 transition"
                >
                  Submit
                </button>
              </form>
            ) : (
              <p>Please <Link to="/login">sign in</Link> to write a review</p>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            {product.reviews.length === 0 && <p>No Reviews</p>}

            {product.reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-100 p-5 rounded-xl mb-4 shadow"
              >
                <div className="flex justify-between text-gray-500">
                  <strong>{review.name}</strong>
                  <p>{review.createdAt.substring(0, 10)}</p>
                </div>

                <p className="my-4">{review.comment}</p>
                <Ratings value={review.rating} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 3 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-md">
            {!data ? <Loader /> : data.map((p) => (
              <SmallProduct product={p} key={p._id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductTabs;
