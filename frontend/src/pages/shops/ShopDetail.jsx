import React from 'react';
import { useParams } from 'react-router-dom';
import { useFetchShopsQuery } from '../../redux/Api/shopApiSlice';
import { useGetProductsByShopIdQuery } from '../../redux/Api/productApiSlice';
import ShopPortfolio from '../../components/ShopPortfolio';
import AdminMenu from '../Admin/AdminMenu';

const ShopDetail = () => {
  const { id } = useParams();

  const { data: shops = [], isLoading: shopsLoading } = useFetchShopsQuery();
  const { data: products = [], isLoading: productsLoading } = useGetProductsByShopIdQuery(id);

  // Debug logs to verify data
  console.log('ShopDetail - products:', products);
  console.log('ShopDetail - shops:', shops);

  if (shopsLoading || productsLoading) {
    return <div>Loading...</div>;
  }

  const shop = shops.find((s) => s._id === id);

  if (!shop) {
    return <div>Shop not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      {/* <AdminMenu /> */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <ShopPortfolio shop={shop} products={products} onClose={() => {}} />
      </div>
    </div>
  );
};

export default ShopDetail;
