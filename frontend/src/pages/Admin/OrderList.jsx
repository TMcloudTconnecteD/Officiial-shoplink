import { useState } from "react";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery } from "../../redux/Api/orderApiSlice";
import AdminMenu from "./AdminMenu";

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [expandedRow, setExpandedRow] = useState(null);

  return (
    <>
      <AdminMenu />

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div className="container mx-auto overflow-x-auto">
          <table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left p-3">ITEM</th>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">USER</th>
                <th className="text-left p-3">DATE</th>
                <th className="text-left p-3">TOTAL</th>
                <th className="text-left p-3">PAID</th>
                <th className="text-left p-3">DELIVERED</th>
                <th className="text-left p-3">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {orders.map(order => (
                <>
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      <img
                        src={order.orderItems[0]?.image}
                        alt={order._id}
                        className="w-20 rounded"
                      />
                    </td>

                    <td className="p-3 text-sm">{order._id}</td>

                    <td className="p-3">
                      {order.user ? order.user.username : "N/A"}
                    </td>

                    <td className="p-3">
                      {order.createdAt?.substring(0, 10)}
                    </td>

                    <td className="p-3 font-semibold">
                      KES {order.totalPrice}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          order.isPaid
                            ? "bg-green-400 text-black"
                            : "bg-red-400 text-black"
                        }`}
                      >
                        {order.isPaid ? "Completed" : "Pending"}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          order.isDelivered
                            ? "bg-green-400 text-black"
                            : "bg-red-400 text-black"
                        }`}
                      >
                        {order.isDelivered ? "Completed" : "Pending"}
                      </span>
                    </td>

                    <td className="p-3 space-x-2">
                      <button
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === order._id ? null : order._id
                          )
                        }
                        className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                      >
                        {expandedRow === order._id ? "Hide" : "Quick View"}
                      </button>

                      <Link to={`/order/${order._id}`}>
                        <button className="px-3 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm">
                          See More
                        </button>
                      </Link>
                    </td>
                  </tr>

                  {expandedRow === order._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="8" className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-semibold">Payment Method</p>
                            <p>{order.paymentMethod || "N/A"}</p>
                          </div>

                          <div>
                            <p className="font-semibold">Items</p>
                            <p>{order.orderItems.length}</p>
                          </div>

                          <div>
                            <p className="font-semibold">Shipping</p>
                            <p>
                              {order.shippingAddress?.city || "N/A"},{" "}
                              {order.shippingAddress?.country || ""}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold">Order Status</p>
                            <p>
                              {order.isDelivered
                                ? "Delivered"
                                : "Processing"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default OrderList;
