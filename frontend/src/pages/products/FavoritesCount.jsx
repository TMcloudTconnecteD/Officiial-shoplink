import { useSelector } from "react-redux";

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites) || [];
  const favoriteCount = Array.isArray(favorites) ? favorites.length : 0;

  if (favoriteCount <= 0) return null;

  return (
    <span className="px-1 py-0 text-xs text-white bg-emerald-600 rounded-full min-w-[16px] h-[16px] flex items-center justify-center leading-none">
      {favoriteCount}
    </span>
  );
};

export default FavoritesCount;
