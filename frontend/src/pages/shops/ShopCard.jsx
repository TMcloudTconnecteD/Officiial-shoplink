import React from "react";
import { Link } from "react-router-dom";

const ShopCard = ({ shop }) => {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col items-center">
      <img
        src={shop.image}
        alt={shop.name}
        className="w-full h-48 object-cover rounded-lg mb-2"
      />
      <h3 className="text-lg font-semibold mb-2">{shop.name}</h3>
      <Link
        to={`/shops/${shop._id}`}
        className="mt-2 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition text-center"
      >
        View Shop
      </Link>
    </div>
  );
};

export default ShopCard;
