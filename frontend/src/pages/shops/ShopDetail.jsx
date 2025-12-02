// src/pages/ShopDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useFetchShopsQuery } from "../../redux/Api/shopApiSlice";
import { useGetProductsByShopIdQuery } from "../../redux/Api/productApiSlice";
import ShopPortfolio from "../../components/ShopPortfolio";

const ShopDetail = () => {
  const { id } = useParams();

  const { data: shops = [], isLoading: shopsLoading } = useFetchShopsQuery();
  const { data: products = [], isLoading: productsLoading } = useGetProductsByShopIdQuery(id);

  if (shopsLoading || productsLoading) {
    return <div className="pt-28"><div className="text-center py-20">Loading...</div></div>;
  }

  const shop = shops.find((s) => s._id === id);

  if (!shop) {
    return <div className="pt-28 text-center">Shop not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <ShopPortfolio shop={shop} products={products} onClose={() => {}} />
      </div>
    </div>
  );
};

export default ShopDetail;
