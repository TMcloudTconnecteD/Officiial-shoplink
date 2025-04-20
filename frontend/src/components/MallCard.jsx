// src/components/MallCard.jsx
import { FaStore } from "react-icons/fa";
import "./mallcard.css"; // 👈 import custom styles

const MallCard = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border-2 border-pink-500 rounded-xl p-6 bg-white shadow-xl hover:bg-pink-50 hover:scale-105 transition-all duration-300 flex flex-col items-center"
    >
      <div className="mb-2">
        <FaStore className="text-pink-500" size={40} />
      </div>
      <h3 className="text-lg font-bold text-pink-700">Mall View</h3>
      <p className="text-sm text-gray-500 text-center">Browse all available shops</p>
    </div>
  );
};

export default MallCard;