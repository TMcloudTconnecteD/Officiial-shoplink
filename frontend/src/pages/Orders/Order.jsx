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
  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const { data: paypal, isLoading: loadingPayPal, error: errorPayPal } = useGetPaypalClientIdQuery();

  const [exchangeRate, setExchangeRate] = useState(null);
  const [usdAmount, setUsdAmount] = useState("0.00");

  // Fetch conversion rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const resp = await fetch(`https://api.exchangerate.host/convert?from=KES&to=USD`);
        const json = await resp.json();
        if (json.success) setExchangeRate(json.info.rate);
        else throw new Error("Rate fetch failed");
      } catch (err) {
        console.error("Exchange rate fetch error:", err);
        setExchangeRate(0.0077);
      }
    };
    fetchRate();
  }, []);

  // Compute USD
  useEffect(() => {
    if (order && exchangeRate) {
      setUsdAmount((order.totalPrice * exchangeRate).toFixed(2));
    }
  }, [order, exchangeRate]);

  // Load PayPal
  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal?.clientId) {
      paypalDispatch({
        type: "resetOptions",
        value: { "client-id": paypal.clientId, currency: "USD" },
      });
      paypalDispatch({ type: "setLoadingStatus", value: "pending" });
    }
  }, [paypal, errorPayPal, loadingPayPal, paypalDispatch]);

  const createOrder = (data, actions) =>
    actions.order.create({
      purchase_units: [
        {
          amount: { value: usdAmount },
          description: `Order ${order._id} (KES ${order.totalPrice})`,
        },
      ],
    });

  const onApprove = (data, actions) =>
    actions.order.capture().then(async (details) => {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success("Order is paid");
      } catch (err) {
        toast.error(err?.data?.message || err?.message);
      }
    });

  const onError = (err) => toast.error(err.message);

  // ----------------------------
  // CASH PAYMENT HANDLER ADDED
  // ----------------------------
  const cashPayHandler = async () => {
    try {
      const cashDetails = {
        id: "CASH-" + Date.now(),
        status: "COMPLETED",
        update_time: new Date().toISOString(),
        payer: { email_address: "cash@local" },
        method: "cash",
      };

      await payOrder({ orderId, details: cashDetails });
      refetch();
      toast.success("Order marked as PAID (Cash)");
    } catch (err) {
      toast.error(err?.data?.message || err?.message);
    }
  };
const apiUrl = import.meta.env.VITE_API_URL;
  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error.data?.message || "Error loading order"}</Message>;

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* Order Items */}
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
                  {order.orderItems.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded" />
                      </td>
                      <td className="p-2">
                        <Link to={`/product/${item.product}`} className="text-blue-600 hover:underline">
                          {item.name}
                        </Link>
                      </td>
                      <td className="p-2 text-center">{item.qty}</td>
                      <td className="p-2 text-center">KES {item.price}</td>
                      <td className="p-2 text-center font-semibold">KES {(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary + Payment */}
      <div className="w-full lg:w-1/3 relative">
        {!order.isPaid && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-md z-10">
            Not Paid
          </div>
        )}

        {/* Shipping Info */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Shipping</h2>
          <div className="text-sm">
            <p><strong>Order:</strong> {order._id}</p>
            <p><strong>Name:</strong> {order.user.username}</p>
            <p><strong>Email:</strong> {order.user.email}</p>
            <p><strong>Shop:</strong> {order.shop?.name || "N/A"}</p>
            <p>
              <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}, {order.shippingAddress.apartment}
            </p>
            <p><strong>Method:</strong> {order.paymentMethod}</p>
          </div>

          {order.isPaid ? (
            <Message variant="success">Paid on {order.paidAt}</Message>
          ) : (
            <Message variant="danger">Not paid</Message>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Items:</span><span>KES {order.itemsPrice}</span></div>
            <div className="flex justify-between"><span>Shipping:</span><span>KES {order.shippingPrice}</span></div>
            <div className="flex justify-between"><span>Tax:</span><span>KES {order.taxPrice}</span></div>
            <div className="flex justify-between font-bold"><span>Total:</span><span>KES {order.totalPrice}</span></div>
          </div>

          {/* Payment Section */}
          {!order.isPaid && (
            <div className="mt-6 space-y-4">

              {/* PayPal */}
              {isPending ? (
                <Loader />
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FaPaypal className="text-blue-600 text-lg" />
                    <span className="font-semibold">Pay with PayPal</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Total: KES {order.totalPrice} (~USD {usdAmount})
                  </div>
                  <PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError} />
                </div>
              )}

              {/* M-Pesa */}
              <div className="flex items-center gap-2 mb-4">
                <FaMobileAlt className="text-green-600 text-lg" />
                <span className="font-semibold">Pay with M-Pesa</span>
              </div>
              <MpesaButton
                totalPrice={order.totalPrice}
                orderId={order._id}
                initialPhone=""
                onPhoneChange={() => {}}
                onSuccess={() => {
                  toast.success("Payment initiated successfully!");
                  toast.info("Verifying M-Pesa payment...");
                  refetch();
                }}
                disabled={loadingPay || order.isPaid}
              />

              {/* ⭐ CASH PAYMENT ADDED HERE */}
              {userInfo?.isAdmin && (
              <button
                onClick={cashPayHandler}
                disabled={loadingPay}
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-green-200 transition-all text-sm font-semibold text-green-800"
              >
                Mark as Paid (Cash)
              </button>
              )}
            </div>
          )}

                {order.isPaid && (
                        <button
                          onClick={() => window.open(`${apiUrl}/orders/${order._id}/receipt`)}
                          className="w-full mt-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Download Receipt (PDF)
                        </button>
                      )}

          {/* Deliver */}
          {loadingDeliver && <Loader />}
          {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
            <button
              type="button"
              className="w-full mt-6 py-2 bg-pink-500 text-white rounded hover:bg-blue-600"
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
