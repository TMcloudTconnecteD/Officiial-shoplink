import React from "react";
import { Link } from "react-router-dom";

const ShopCard = ({ shop }) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition bg-white">
      
      {/* IMAGE */}
      <div className="relative h-48 md:h-64">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
          {shop.tag || "Mall"}
        </div>
      </div>

      {/* DETAILS */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {shop.name || "Unnamed Shop"}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {shop.description || "Curated goods."}
        </p>

        <Link
          to={`/shops/${shop._id}`}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow hover:bg-emerald-700 transition text-sm"
        >
          Visit Shop
        </Link>
      </div>
    </div>
  );
};

export default ShopCard;
