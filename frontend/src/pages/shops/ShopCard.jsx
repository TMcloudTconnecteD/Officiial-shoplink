import React from "react";
import { Link } from "react-router-dom";
import { FaCircle } from "react-icons/fa";

const ShopCard = ({ shop, owner }) => {
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "";
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const normalizeShopImage = (imageValue) => {
    if (typeof imageValue === 'string' && imageValue.trim()) return imageValue;
    return 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder';
  };

  const normalizeTag = (tag) => {
    if (typeof tag === 'string' && tag.trim()) return tag;
    if (tag && typeof tag === 'object' && typeof tag.name === 'string' && tag.name.trim()) return tag.name;
    return 'Shop';
  };

  const isOnline = owner?.isOnline || false;
  const lastSeenText = formatLastSeen(owner?.lastSeen);
  const shopName = typeof shop?.name === 'string' && shop.name.trim() ? shop.name : 'Unnamed Shop';
  const shopImage = normalizeShopImage(shop?.image);
  const tag = normalizeTag(shop?.tag || shop?.category);

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition bg-white relative">
      <div className="relative h-48 md:h-64">
        <img
          src={shopImage}
          alt={shopName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://res.cloudinary.com/tmcloud/image/upload/w_500,q_auto,f_auto/v1/shop-placeholder';
          }}
        />

        <div className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          <FaCircle size={8} color={isOnline ? '#10B981' : '#9CA3AF'} />
          {isOnline ? 'Online' : `Seen ${lastSeenText}`}
        </div>

        <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
          {tag}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {shopName}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {shop?.description || 'Curated goods.'}
        </p>

        <Link
          to={`/shops/${shop?._id || shop?.id}`}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow hover:bg-emerald-700 transition text-sm"
        >
          Visit Shop
        </Link>
      </div>
    </div>
  );
};

export default ShopCard;
