import { useState } from "react";
import { Link } from "react-router-dom";
import Ratings from "./Ratings";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import SmallProduct from "././SmallProducts";
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
  const [activeTab, setActiveTab] = useState(1);

  if (isLoading) return <Loader />;

  const handleTabClick = (tabNumber) => setActiveTab(tabNumber);

  return (
    // Wrap the whole tabs container in a background with padding and rounded edges
    <div className="bg-[#1F1F1F] text-white rounded-xl p-6 shadow-lg">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Tab Headers */}
        <section className="flex flex-col gap-3 text-lg font-medium">
          <div
            className={`transition-all px-4 py-2 rounded cursor-pointer 
              ${activeTab === 1 
                ? "bg-pink-600 text-white font-bold" 
                : "bg-gray-200 text-black hover:bg-pink-100"}`
            }
            onClick={() => handleTabClick(1)}
          >
            Write Your Review
          </div>
          <div
            className={`transition-all px-4 py-2 rounded cursor-pointer 
              ${activeTab === 2 
                ? "bg-pink-600 text-white font-bold" 
                : "bg-gray-200 text-black hover:bg-pink-100"}`
            }
            onClick={() => handleTabClick(2)}
          >
            All Reviews
          </div>
          <div
            className={`transition-all px-4 py-2 rounded cursor-pointer 
              ${activeTab === 3 
                ? "bg-pink-600 text-white font-bold" 
                : "bg-gray-200 text-black hover:bg-pink-100"}`
            }
            onClick={() => handleTabClick(3)}
          >
            Related Products
          </div>
        </section>

        {/* Tab Content */}
        <section className="flex-1">
          {activeTab === 1 && (
            <div className="mt-4 bg-gray-800 text-white p-6 rounded-xl shadow-md">
              {userInfo ? (
                <form onSubmit={submitHandler} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="rating" className="block text-xl mb-1">
                      Rating
                    </label>
                    <select
                      id="rating"
                      required
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="p-3 rounded-xl bg-white text-black w-full max-w-2xl"
                    >
                      <option value="">Select</option>
                      <option value="1">Low Quality</option>
                      <option value="2">Decent</option>
                      <option value="3">Great</option>
                      <option value="4">Excellent</option>
                      <option value="5">Exceptional</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-xl mb-1">
                      Comment
                    </label>
                    <textarea
                      id="comment"
                      rows="3"
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="p-3 rounded-xl bg-white text-black w-full max-w-2xl"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingProductReview}
                    className="bg-gradient-to-r from-pink-500 to-pink-700 text-white py-2 px-6 rounded-xl hover:scale-105 transition duration-300 shadow-md"
                  >
                    Submit
                  </button>
                </form>
              ) : (
                <p className="text-white">
                  Please{" "}
                  <Link to="/login" className="text-pink-500 underline">
                    sign in
                  </Link>{" "}
                  to write a review
                </p>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="mt-4 bg-gray-800 text-white p-6 rounded-xl shadow-md">
              {product.reviews && product.reviews.length === 0 ? (
                <p>No Reviews</p>
              ) : (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-[#1A1A1A] p-6 rounded-xl shadow-md"
                    >
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <strong>{review.name}</strong>
                        <p>{review.createdAt.substring(0, 10)}</p>
                      </div>
                      <p className="my-4 text-lg">{review.comment}</p>
                      <Ratings value={review.rating} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div className="mt-4 bg-gray-800 text-white p-6 rounded-xl shadow-md">
              <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-4">
                {!data ? (
                  <Loader />
                ) : (
                  data.map((product) => (
                    <SmallProduct key={product._id} product={product} />
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductTabs;
