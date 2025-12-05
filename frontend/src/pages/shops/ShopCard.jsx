import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const ShopCard = ({ shop }) => {
  const { userInfo } = useSelector((state) => state.auth);

  const canEdit =
    userInfo &&
    (userInfo.isAdmin || userInfo.isSuperAdmin || userInfo._id === shop.owner);

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
        className="mt-2 bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition text-center"
      >
        View Shop
      </Link>

      {canEdit && (
        <Link
          to={`/admin/shop/update/${shop._id}`}
          className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition text-center"
        >
          Update Shop
        </Link>
      )}
    </div>
  );
};

export default ShopCard;
