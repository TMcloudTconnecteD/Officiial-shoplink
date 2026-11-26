import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const Ratings = ({ value = 0, text, color = "#eab308" }) => {
  const safeValue = Number.isFinite(Number(value)) ? Math.min(5, Math.max(0, Number(value))) : 0;
  const fullStars = Math.floor(safeValue);
  const halfStars = safeValue - fullStars > 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return (
    <div className="inline-flex items-center">
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={`full-${index}`} className="ml-1" style={{ color }} />
      ))}

      {halfStars === 1 && (
        <FaStarHalfAlt className="ml-1" style={{ color }} />
      )}

      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar key={`empty-${index}`} className="ml-1" style={{ color }} />
      ))}

      {text && (
        <span className="ml-2 text-sm font-semibold text-slate-600">{text}</span>
      )}
    </div>
  );
};

export default Ratings;
