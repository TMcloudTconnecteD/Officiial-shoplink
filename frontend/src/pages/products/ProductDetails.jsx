import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/Api/productApiSlice";
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
import { getOptimizedHeroImage } from "../../utils/imageOptimization";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const productImages = product?.images?.length
    ? product.images
    : product?.image ? [product.image] : [];

  useEffect(() => {
    setActiveImage(0);
  }, [productId]);

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
    <div className="product-detail-page">
      <div className="product-breadcrumb">
        <Link to="/shop">All products</Link>
        <span aria-hidden="true">/</span>
        <span>{product?.name || "Product details"}</span>
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
          <div className="product-detail-card">
            <div className="product-image-panel">
              <img
                src={getOptimizedHeroImage(productImages[activeImage] || product.image)}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="product-main-image"
              />
              <div className="product-favorite">
                <HeartIcon product={product} />
              </div>
              {productImages.length > 1 && (
                <div className="product-gallery-thumbnails" aria-label="Product photos">
                  {productImages.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      className={index === activeImage ? "is-active" : ""}
                      aria-label={`View product photo ${index + 1}`}
                      aria-pressed={index === activeImage}
                      onClick={() => setActiveImage(index)}
                    >
                      <img src={image} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-information">
              <p className="product-eyebrow">Available from local shops</p>
              <h1 className="product-title">{product.name}</h1>
              <p className="product-description">
                {product.description}
              </p>
              <p className="product-price">
                KES {Number(product.price || 0).toLocaleString()}
              </p>

              <dl className="product-facts">
                <div><dt><FaStore /> Brand</dt><dd>{product.brand || "Local shop"}</dd></div>
                <div><dt><FaClock /> Listed</dt><dd>{moment(product.createdAt).fromNow()}</dd></div>
                <div><dt><FaStar /> Reviews</dt><dd>{Number(product.numReviews || 0)} {Number(product.numReviews || 0) === 1 ? "review" : "reviews"}</dd></div>
                <div><dt><FaShoppingCart /> Available</dt><dd>{Number(product.quantity || 0)}</dd></div>
                <div><dt><FaBox /> In stock</dt><dd>{Number(product.inStock || 0)}</dd></div>
              </dl>

              <div className="product-purchase-row">
                <div className="product-rating">
                  <Ratings
                    value={Number(product.rating || 0)}
                    text={Number(product.numReviews || 0) === 0
                      ? "No reviews yet"
                      : `${product.numReviews} ${Number(product.numReviews) === 1 ? "review" : "reviews"}`}
                  />
                </div>

                {product.inStock > 0 && (
                  <div className="product-quantity">
                    <label htmlFor="product-quantity">Quantity</label>
                    <select
                      id="product-quantity"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
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

              <div className="btn-container mt-4">
                <button
                  onClick={addToCartHandler}
                  disabled={product.inStock === 0}
                  className="product-add-to-cart"
                >
                  {product.inStock > 0 ? "Add to cart" : "Currently out of stock"}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="product-tabs-wrap">
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
    </div>
  );
};

export default ProductDetails;