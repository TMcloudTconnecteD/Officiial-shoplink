import { useSelector } from "react-redux";

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites);
  const favoriteCount = favorites.length;

  if (favoriteCount === 0) return null;

  return (
    <span className="px-1 py-0 text-xs text-white bg-pink-500 rounded-full">
      {favoriteCount}
    </span>
  );
};

export default FavoritesCount;
