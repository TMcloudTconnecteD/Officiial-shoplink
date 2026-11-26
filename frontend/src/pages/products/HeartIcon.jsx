import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import {
  addToFavorites,
  removeFromFavorites,
} from "../../redux/features/favorites/favoriteSlice";
import { toast } from "react-toastify";
import { useToggleProductFavoriteMutation } from "../../redux/Api/productApiSlice";

const HeartIcon = ({ product }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites) || [];
  const { userInfo } = useSelector((state) => state.auth);
  const [toggleFavorite] = useToggleProductFavoriteMutation();
  const isFavorite = favorites.some((p) => p._id === product._id);

  const toggleFavorites = async () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product));
    } else {
      dispatch(addToFavorites(product));
    }
    if (userInfo) {
      try {
        await toggleFavorite({ productId: product._id, favorited: !isFavorite }).unwrap();
      } catch (error) {
        if (isFavorite) dispatch(addToFavorites(product));
        else dispatch(removeFromFavorites(product));
        toast.error(error?.data?.message || "Could not update your favorites");
      }
    }
  };

  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-md transition-transform hover:scale-110"
      onClick={toggleFavorites}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
    >
      {isFavorite ? (
        <FaHeart />
      ) : (
        <FaRegHeart />
      )}
    </button>
  );
};

export default HeartIcon;