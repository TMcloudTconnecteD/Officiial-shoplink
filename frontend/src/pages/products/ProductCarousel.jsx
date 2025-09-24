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

const ProductCarousel = ({ products: propProducts }) => {
  const { data: topProducts, isLoading, error } = useGetTopProductsQuery();

  const products = propProducts && propProducts.length > 0 ? propProducts : topProducts;

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  if (isLoading && !propProducts) return <Loader />;
  if (error && !propProducts) return (
    <Message variant="danger">
      {error?.data?.message || error.error}
    </Message>
  );

  if (!products || products.length === 0) {
    return <div>No products to display</div>;
  }

  return (
    <div className="mb-8 container mx-auto px-4">
      <div className="flex justify-end">
        <div className="w-3/4 lg:w-3/4">
          <Slider {...settings} className="w-full bg-purple-100 rounded-lg p-4">
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
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-[30rem] object-cover rounded-lg shadow-lg"
                  />

                  <div className="mt-6 flex flex-col lg:flex-row justify-between items-start">
                    <div className="lg:w-1/2 mb-4 lg:mb-0">
                      {/* Product basic info */}
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        {name}
                      </h2>
                      <p className="mt-2 text-xl font-bold text-purple-600">
                        KES {price}
                      </p>
                      <p className="mt-4 text-gray-500 dark:text-gray-300 w-full lg:w-[25rem]">
                        {description.substring(0, 50)} ...
                      </p>
                    </div>

                    <div className="lg:w-1/2 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="sm:w-1/2">
                        <h1 className="flex items-center mb-3 text-gray-700 dark:text-gray-200">
                          <FaStore className="mr-2 text-orange-500" /> Brand:{" "}
                          {brand}
                        </h1>
                        <h1 className="flex items-center mb-3 text-gray-700 dark:text-gray-200">
                          <FaClock className="mr-2 text-orange-500" /> Added:{" "}
                          {moment(createdAt).fromNow()}
                        </h1>
                        <h1 className="flex items-center mb-3 text-gray-700 dark:text-gray-200">
                          <FaStar className="mr-2 text-orange-500" /> Reviews:{" "}
                          {numReviews}
                        </h1>
                      </div>

                      <div className="sm:w-1/2">
                        <h1 className="flex items-center mb-3 text-gray-700 dark:text-gray-200">
                          <FaStar className="mr-2 text-orange-500" /> Ratings:{" "}
                          {Math.round(rating)}
                        </h1>
                        <h1 className="flex items-center mb-3 text-gray-700 dark:text-gray-200">
                          <FaShoppingCart className="mr-2 text-orange-500" /> Quantity:{" "}
                          {quantity}
                        </h1>
                        <h1 className="flex items-center mb-3 text-gray-700 dark:text-gray-200">
                          <FaBox className="mr-2 text-orange-500" /> In Stock:{" "}
                          {inStock}
                        </h1>
                      </div>
                    </div>
                  </div>
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
