import React, { useState } from "react";
import ShopPortfolio from "./ShopPortfolio";
import ShopCard from "../pages/shops/ShopCard.jsx";
import { useGetProductsQuery } from "../redux/Api/productApiSlice";
import { useFetchShopsQuery } from "../redux/Api/shopApiSlice";
import Loader from "./Loader.jsx";

const ShopList = () => {
  const [selectedShop, setSelectedShop] = useState(null);
  const { data: shops = [], isLoading: shopsLoading } = useFetchShopsQuery();
  const { data: products = [], isLoading: productsLoading } = useGetProductsQuery();

  // Filter products by selected shop
  const shopProducts = selectedShop
    ? products.filter((p) => p.shop === selectedShop._id)
    : [];

  if (shopsLoading || productsLoading) {
    return <div>Loading...
      <Loader/>
    </div>;
  }

  return (
    <div>
      {!selectedShop ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard
              key={shop._id}
              shop={shop}
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
