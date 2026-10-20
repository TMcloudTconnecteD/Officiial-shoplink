import React, { useState, useMemo } from "react";
import ShopPortfolio from "./ShopPortfolio";
import ShopCard from "../pages/shops/ShopCard.jsx";
import { useGetProductsQuery } from "../redux/Api/productApiSlice";
import { useFetchShopsQuery } from "../redux/Api/shopApiSlice";
import { useGetUsersQuery } from "../redux/Api/usersApiSlice";
import Loader from "./Loader.jsx";

const ShopList = () => {
  const [selectedShop, setSelectedShop] = useState(null);
  const { data: shops = [], isLoading: shopsLoading } = useFetchShopsQuery();
  const { data: products = [], isLoading: productsLoading } = useGetProductsQuery();
  const { data: users = [], isLoading: usersLoading } = useGetUsersQuery();

  // Create a map of user info by ID for quick lookup
  const userMap = useMemo(() => {
    const map = {};
    if (users && Array.isArray(users)) {
      users.forEach(user => {
        map[user._id] = user;
      });
    }
    return map;
  }, [users]);

  // Sort shops: active first, then by last seen (latest first)
  const sortedShops = useMemo(() => {
    if (!shops || shops.length === 0) return [];

    return [...shops].sort((a, b) => {
      const ownerA = userMap[a.owner];
      const ownerB = userMap[b.owner];

      // 1. Sort by online status (online first)
      const aOnline = ownerA?.isOnline ? 1 : 0;
      const bOnline = ownerB?.isOnline ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;

      // 2. Sort by last seen (most recent first)
      const aLastSeen = ownerA?.lastSeen ? new Date(ownerA.lastSeen) : new Date(0);
      const bLastSeen = ownerB?.lastSeen ? new Date(ownerB.lastSeen) : new Date(0);
      return bLastSeen - aLastSeen;
    });
  }, [shops, userMap]);

  // Filter products by selected shop
  const shopProducts = selectedShop
    ? products.filter((p) => p.shop === selectedShop._id)
    : [];

  if (shopsLoading || productsLoading || usersLoading) {
    return <div>Loading...
      <Loader/>
    </div>;
  }

  return (
    <div>
      {!selectedShop ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedShops.map((shop) => (
            <ShopCard
              key={shop._id}
              shop={shop}
              owner={userMap[shop.owner]}
              onViewShop={() => setSelectedShop(shop)}
            />
          ))}
        </div>
      ) : (
        <ShopPortfolio
          shop={selectedShop}
          products={shopProducts}
          onClose={() => setSelectedShop(null)}
        />
      )}
    </div>
  );
};

export default ShopList;
