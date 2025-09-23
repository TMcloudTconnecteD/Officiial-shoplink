import React from 'react';
import ShopList from '../../components/ShopList.jsx';
import AdminMenu from '../Admin/AdminMenu';

const Shop = () => {
  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      {/* <AdminMenu /> */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Shops 🏬</h2>
        <ShopList />
      </div>
    </div>
  );
};

export default Shop;
