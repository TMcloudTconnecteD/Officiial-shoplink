import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaPaypal, FaMobileAlt } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from "../../redux/Api/orderApiSlice";
import MpesaButton from "../../components/MpesaButton";

const Order = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal.clientId) {
      const loadPayPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "KES",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };

      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadPayPalScript();
        }
      }
    }
  }, [errorPayPal, loadingPayPal, order, paypal, paypalDispatch]);

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success("Order is paid");
      } catch (error) {
        toast.error(error?.data?.message || error?.message);
      }
    });
  }

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [{ amount: { value: order.totalPrice } }],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onError(err) {
    toast.error(err.message);
  }

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  // Helper function to safely get shop name string for display
  const getShopName = () => {
    if (!order) return "N/A";
    if (order.shippingAddress && order.shippingAddress.shopName) {
      if (typeof order.shippingAddress.shopName === "string") return order.shippingAddress.shopName;
      if (typeof order.shippingAddress.shopName === "object" && order.shippingAddress.shopName !== null) {
        return order.shippingAddress.shopName.name || "N/A";
      }
    }
    // Fallback to order.shop.name if shippingAddress.shopName is missing
    if (order.shop && order.shop.name) return order.shop.name;
    return "N/A";
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error.data.message}</Message>
  ) : (
    <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-2/3">
        <div className="bg-white shadow-lg rounded-xl p-4 mb-6">
          {order.orderItems.length === 0 ? (
            <Message>Order is empty</Message>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-gray-700">
                    <th className="p-2">Image</th>
                    <th className="p-2">Product</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-center">Price</th>
                    <th className="p-2 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded"
                        />
                      </td>
                      <td className="p-2">
                        <Link
                          to={`/product/${item.product}`}
                          className="text-blue-600 hover:underline"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="p-2 text-center">{item.qty}</td>
                      <td className="p-2 text-center">KES {item.price}</td>
                      <td className="p-2 text-center font-semibold">
                        KES {(item.qty * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-1/3 relative">
        {!order.isPaid && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-md z-10">
            Not Paid
          </div>
        )}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Shipping</h2>
          <div className="text-sm mb-3">
            <p>
              <strong className="text-gray-600">Order:</strong> {order._id}
            </p>
            <p>
              <strong className="text-gray-600">Name:</strong> {order.user.username}
            </p>
            <p>
              <strong className="text-gray-600">Email:</strong> {order.user.email}
            </p>
            <p>
              <strong className="text-gray-600">Shop:</strong> {getShopName()}
            </p>
            <p>
              <strong className="text-gray-600">Address:</strong>{" "}
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <p>
              <strong className="text-gray-600">Method:</strong> {order.paymentMethod}
            </p>
          </div>
          {order.isPaid ? (
            <Message variant="success">Paid on {order.paidAt}</Message>
          ) : (
            <Message variant="danger">Not paid</Message>
          )}
        </div>

        <div className="bg-white mt-6 shadow-md rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>KES {order.itemsPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>KES {order.shippingPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>KES {order.taxPrice}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>KES {order.totalPrice}</span>
            </div>
          </div>

          {!order.isPaid && (
            <div className="mt-6 space-y-4">
              {loadingPay && <Loader />}
              {isPending ? (
                <Loader />
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaPaypal className="text-blue-600 text-lg" />
                    <span className="font-semibold">Pay with PayPal</span>
                  </div>
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <FaMobileAlt className="text-green-600 text-lg" />
                <span className="font-semibold">Pay with M-Pesa</span>
              </div>

              <MpesaButton
                totalPrice={order.totalPrice}
                orderId={order._id}
                initialPhone={phone}
                onPhoneChange={setPhone}
                onSuccess={() => {
                  toast.success("Payment initiated successfully!");
                  toast.info("Please wait while we verify your M-Pesa payment...");
                  refetch();
                }}
                disabled={loadingPay || order.isPaid}
              />
            </div>
          )}

          {loadingDeliver && <Loader />}
          {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
            <button
              type="button"
              className="w-full mt-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
              onClick={deliverHandler}
            >
              Mark As Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
