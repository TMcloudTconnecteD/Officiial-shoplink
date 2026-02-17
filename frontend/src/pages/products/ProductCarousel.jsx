import { Link } from "react-router-dom";
import Message from "../../components/Message";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import moment from "moment";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import Loader from "../../components/Loader";
import { useGetTopProductsQuery } from "../../redux/Api/productApiSlice";
import { getOptimizedHeroImage } from "../../utils/imageOptimization";

const ProductCarousel = ({ products: propProducts }) => {
  const { data: topProducts, isLoading, error } = useGetTopProductsQuery();

  const products =
    propProducts && propProducts.length > 0 ? propProducts : topProducts;

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    autoplaySpeed: 3000,
  };

  if (isLoading && !propProducts) return <Loader />;

  if (error && !propProducts)
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );

  if (!products || products.length === 0) {
    return <div>No products to display</div>;
  }

  return (
    <div className="mb-8 container mx-auto px-4">
      <div className="flex justify-end w-full">
        <div className="w-full">
          <Slider
            {...settings}
            className="w-full rounded-xl overflow-hidden shadow-xl border border-emerald-200"
          >
            {products.map(
              ({
                image,
                _id,
                name,
                price,
                description,
                brand,
                createdAt,
                numReviews,
                rating,
                quantity,
                inStock,
              }) => (
                <div key={_id} className="px-2">
                  <Link
                    to={`/product/${_id}`}
                    className="block bg-white rounded-xl p-4 hover:opacity-95 transition"
                  >
                    <img
                      src={getOptimizedHeroImage(image)}
                      alt={name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-[28rem] object-cover rounded-xl shadow-lg"
                    />

                    <div className="mt-6 flex flex-col lg:flex-row justify-between items-start">
                      <div className="lg:w-1/2 mb-4 lg:mb-0">
                        <h2 className="text-3xl font-semibold text-zinc-900">
                          {name}
                        </h2>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">
                          KES {price}
                        </p>
                        <p className="mt-4 text-zinc-500 w-full lg:w-[25rem]">
                          {description.substring(0, 50)}...
                        </p>
                      </div>

                      <div className="lg:w-1/2 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="sm:w-1/2 space-y-3">
                          <p className="flex items-center text-zinc-700">
                            <FaStore className="mr-2 text-emerald-500" /> Brand: {brand}
                          </p>
                          <p className="flex items-center text-zinc-700">
                            <FaClock className="mr-2 text-emerald-500" /> Added:{" "}
                            {moment(createdAt).fromNow()}
                          </p>
                          <p className="flex items-center text-zinc-700">
                            <FaStar className="mr-2 text-emerald-500" /> Reviews: {numReviews}
                          </p>
                        </div>

                        <div className="sm:w-1/2 space-y-3">
                          <p className="flex items-center text-zinc-700">
                            <FaStar className="mr-2 text-emerald-500" /> Ratings:{" "}
                            {Math.round(rating)}
                          </p>
                          <p className="flex items-center text-zinc-700">
                            <FaShoppingCart className="mr-2 text-emerald-500" /> Quantity:{" "}
                            {quantity}
                          </p>
                          <p className="flex items-center text-zinc-700">
                            <FaBox className="mr-2 text-emerald-500" /> In Stock: {inStock}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            )}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
