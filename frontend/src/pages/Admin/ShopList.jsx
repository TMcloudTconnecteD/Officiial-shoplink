import React from "react";
import { useFetchShopsQuery, useDeleteShopMutation } from "../../redux/Api/shopApiSlice";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import AdminMenu from "./AdminMenu";

const ShopList = () => {
  const { data: shops, isLoading, error } = useFetchShopsQuery();
  const [deleteShop] = useDeleteShopMutation();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;

    try {
      await deleteShop(id).unwrap();
      toast.success("Shop deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete shop");
    }
  };

  if (isLoading) return <div className="text-center mt-20">Loading shops...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">Error fetching shops</div>;

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <AdminMenu />
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mt-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">All Shops</h2>

        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Shop Name</th>
              <th className="border px-4 py-2">Location</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops?.map((shop) => (
              <tr key={shop._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{shop.name}</td>
                <td className="border px-4 py-2">{shop.location}</td>
                <td className="border px-4 py-2 flex gap-2">
                 <Link
                        to={`/admin/shops/update/${shop._id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                        Update
                        </Link>

                        <Link
                        to="/admin/shops/add"
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mb-4 inline-block"
                        >
                        Add Shop
                        </Link>


                  <button
                    onClick={() => handleDelete(shop._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShopList;
