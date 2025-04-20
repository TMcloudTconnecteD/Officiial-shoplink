import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const Ratings = ({ value, text, color }) => {
  const fullStars = Math.floor(value);
  const halfStars = value - fullStars > 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={`full-${index}`} className={`ml-1 text-${color}`} />
      ))}

      {halfStars === 1 && (
        <FaStarHalfAlt className={`ml-1 text-${color}`} />
      )}

      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar key={`empty-${index}`} className={`ml-1 text-${color}`} />
      ))}

      {text && (
        <span className={`ml-8 text-${color}`}>{text}</span>
      )}
    </div>
  );
};

Ratings.defaultProps = {
  color: "yellow-500", // WindiCSS accepts this directly
};

export default Ratings;
