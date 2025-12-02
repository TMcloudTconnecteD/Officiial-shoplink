import { useState } from "react";
import { Link } from "react-router-dom";
import Ratings from "../products/Ratings";
import { useGetTopProductsQuery, useGetProductsByShopIdQuery } from "../../redux/Api/productApiSlice";
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
  const shopId = product?.shop?._id || product?.fromShop?._id || null;

const { data: shopProducts, isLoading: shopLoading } = useGetProductsByShopIdQuery(shopId, {
  skip: !shopId,
});


  const { data: topData, isLoading: topLoading } = useGetTopProductsQuery();

  const related =
    shopProducts && shopProducts.length > 0
      ? shopProducts.filter((p) => p._id !== product._id)
      : topData;

  const isLoading = shopLoading || topLoading;
  const [activeTab, setActiveTab] = useState(null);

  const handleTabClick = (tabNumber) => {
    setActiveTab((prev) => (prev === tabNumber ? null : tabNumber));
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col md:flex-row gap-10 mt-10">
      {/* Tabs */}
      <section className="w-full md:w-1/4 space-y-3">
        <div
          className={`p-4 rounded-xl cursor-pointer shadow-md text-lg transition ${
            activeTab === 1
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => handleTabClick(1)}
        >
          Write Your Review
        </div>

        <div
          className={`p-4 rounded-xl cursor-pointer shadow-md text-lg transition ${
            activeTab === 2
              ? "bg-amber-500 text-white"
              : "bg-white text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => handleTabClick(2)}
        >
          All Reviews
        </div>

        <div
          className={`p-4 rounded-xl cursor-pointer shadow-md text-lg transition ${
            activeTab === 3
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => handleTabClick(3)}
        >
          Related
        </div>
      </section>

      {/* Tab Content */}
      <section className="flex-1">
        {/* Write Review */}
        {activeTab === 1 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            {userInfo ? (
              <form onSubmit={submitHandler}>
                <label className="block text-lg mb-2">Rating</label>
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

                <label className="block text-lg mb-2">Comment</label>
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
                  className="mt-5 bg-emerald-600 text-white py-3 px-10 rounded-xl shadow hover:bg-emerald-700 transition"
                >
                  Submit
                </button>
              </form>
            ) : (
              <p>
                Please <Link to="/login">sign in</Link> to write a review
              </p>
            )}
          </div>
        )}

        {/* All Reviews */}
        {activeTab === 2 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            {product.reviews.length === 0 && <p>No Reviews</p>}

            {product.reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-50 p-4 rounded-xl mb-4 shadow-sm"
              >
                <div className="flex justify-between text-gray-600">
                  <strong>{review.name}</strong>
                  <p className="text-sm">{review.createdAt.substring(0, 10)}</p>
                </div>

                <p className="my-3 text-gray-800">{review.comment}</p>
                <Ratings value={review.rating} />
              </div>
            ))}
          </div>
        )}

        {/* Related Products */}
        {activeTab === 3 && (
          <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide">
            {related && related.length > 0 ? (
              related.map((p) => (
                <div key={p._id} className="flex-none w-56">
                  <SmallProduct product={p} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No related products from this shop
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductTabs;
