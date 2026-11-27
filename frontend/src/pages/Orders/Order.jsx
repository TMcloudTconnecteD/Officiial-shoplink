import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaPaypal, FaMobileAlt } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import PageBackButton from "../../components/PageBackButton";
import {
  useDeliverOrderMutation,
  useConfirmOrderReceiptMutation,
  useConfirmCashPaymentMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
  useUpdateOrderStatusMutation,
} from "../../redux/Api/orderApiSlice";
import MpesaButton from "../../components/MpesaButton";
import OrderTimeline from "../../components/orders/OrderTimeline";
import { ORDER_STATUS_STEPS } from "../../components/orders/orderStatus";
import "./Order.css";
import PostOrderDelight from "../../components/marketing/PostOrderDelight";

const Order = () => {
  const { id: orderId } = useParams();
  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId, {
    pollingInterval: 20000,
    refetchOnFocus: true,
  });
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [confirmCashPayment, { isLoading: confirmingCash }] = useConfirmCashPaymentMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const [confirmOrderReceipt, { isLoading: confirmingReceipt }] = useConfirmOrderReceiptMutation();
  const [updateOrderStatus, { isLoading: updatingFulfillment }] = useUpdateOrderStatusMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const { data: paypal, isLoading: loadingPayPal, error: errorPayPal } = useGetPaypalClientIdQuery();

  const [usdAmount, setUsdAmount] = useState("0.00");

  useEffect(() => {
    const kesToUsdRate = Number(paypal?.kesToUsdRate);
    if (order && Number.isFinite(kesToUsdRate) && kesToUsdRate > 0) {
      setUsdAmount((order.totalPrice * kesToUsdRate).toFixed(2));
    }
  }, [order, paypal?.kesToUsdRate]);

  // Load PayPal
  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal?.clientId && paypal?.serverVerificationReady) {
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
          reference_id: order._id,
          custom_id: order._id,
          amount: { value: usdAmount },
          description: `Order ${order._id} (KES ${order.totalPrice})`,
        },
      ],
    });

  const onApprove = (data, actions) =>
    actions.order.capture().then(async (details) => {
      try {
        await payOrder({ orderId, details }).unwrap();
        refetch();
        toast.success("Order is paid");
      } catch (err) {
        toast.error(err?.data?.message || err?.message);
      }
    });

  const onError = (err) => toast.error(err.message);

  const confirmCashHandler = async () => {
    try {
      const updatedOrder = await confirmCashPayment({ orderId, method: "Cash" }).unwrap();
      await refetch();
      toast.success(updatedOrder.isPaid
        ? `Cash payment confirmed. Receipt ${updatedOrder.paymentConfirmation?.receiptNumber}.`
        : "Your confirmation was recorded. Waiting for the other party.");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Cash confirmation failed");
    }
  };

  const handleMpesaSuccess = useCallback(() => {
    toast.success("Payment confirmed by M-Pesa. Refreshing order status…");
    refetch();
    window.setTimeout(() => refetch(), 1500);
  }, [refetch]);
  const handleMpesaFailure = useCallback(() => {
    refetch();
  }, [refetch]);

  const apiUrl = import.meta.env.VITE_API_URL;
  const deliverHandler = async (shopId = null) => {
    try {
      await deliverOrder(shopId ? { orderId, shopId } : orderId).unwrap();
      toast.success("Order marked as delivered.");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Could not update delivery status.");
    }
  };

  const confirmReceiptHandler = async (shopId = null) => {
    try {
      await confirmOrderReceipt(shopId ? { orderId, shopId } : orderId).unwrap();
      toast.success("Receipt confirmed. 10 loyalty points were added to the shop owner.");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Could not confirm receipt.");
    }
  };

  const updateFulfillmentHandler = async (shopId, status) => {
    try {
      await updateOrderStatus({ orderId, shopId, status }).unwrap();
      toast.success("Shop order status updated.");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Could not update shop order status.");
    }
  };

  const downloadReceipt = async () => {
    const tryFetch = async (url, headers = {}) => {
      try {
        const res = await fetch(url, { headers });
        return res;
      } catch (e) {
        return { ok: false, status: 0, _networkError: true, text: async () => e.message };
      }
    };

    try {
      const token = userInfo?.token;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // Try configured API URL first (with cache-buster), then fall back to relative path (also cache-busted)
      const ts = Date.now();
      const primary = apiUrl ? `${apiUrl}/api/orders/${order._id}/receipt?cb=${ts}` : null;
      const v2 = apiUrl ? `${apiUrl}/api/v2/orders/${order._id}/receipt?cb=${ts}` : `/api/v2/orders/${order._id}/receipt?cb=${ts}`;
      const fallback = `/api/orders/${order._id}/receipt?cb=${ts}`;

      // Known backend host (Render service) as an extra fallback when frontend domain serves index.html
      const knownBackend = 'https://shoplink-b.onrender.com';
      const backendPrimary = `${knownBackend}/api/orders/${order._id}/receipt?cb=${ts}`;
      const backendV2 = `${knownBackend}/api/v2/orders/${order._id}/receipt?cb=${ts}`;

      let res = null;
      // 1) try configured API URL
      if (primary) res = await tryFetch(primary, headers);
      // 2) try v2 path (helps bypass stale CDN caches)
      if ((!res || !res.ok) && v2) res = await tryFetch(v2, headers);
      // 3) try known backend (use auth header if available)
      if ((!res || !res.ok)) res = await tryFetch(backendV2, headers);
      if ((!res || !res.ok)) res = await tryFetch(backendPrimary, headers);
      // 4) finally try relative path
      if ((!res || !res.ok)) {
        // try fallback without auth header (public endpoint)
        res = await tryFetch(fallback, {});
      }

      if (!res.ok) {
        const text = await res.text();
        const statusMsg = res._networkError ? 'Network error' : `Status ${res.status}`;
        throw new Error(`${statusMsg}: ${text || 'Failed to download receipt'}`);
      }

      const contentType = res.headers && res.headers.get ? res.headers.get('content-type') : '';
      if (!contentType || !contentType.includes('application/pdf')) {
        // Server returned HTML or error page instead of PDF
        const text = await res.text();
        const preview = (text || '').slice(0, 400);
        const debugUrl = primary || v2 || fallback;
        try {
          // open a debug tab so the developer can inspect the HTML response quickly
          window.open(debugUrl, "_blank");
          // try copying to clipboard for convenience
          navigator.clipboard && navigator.clipboard.writeText(debugUrl);
        } catch (receiptDebugError) {
          console.warn("Could not open receipt debug URL:", receiptDebugError);
        }
        throw new Error(`Unexpected response content-type: ${contentType || 'unknown'} - ${preview}`);
      }

      const blob = await res.blob();
      // guard: empty PDF
      if (!blob || blob.size === 0) {
        throw new Error('Received empty receipt PDF');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${order.paymentConfirmation?.receiptNumber || order.paymentResult?.id || order._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || "Download failed");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error.data?.message || "Error loading order"}</Message>;

  const currentUserId = userInfo?._id?.toString();
  const orderUserId = order.user?._id?.toString() || order.user?.toString();
  const shopOwnerId = order.shop?.owner?._id?.toString() || order.shop?.owner?.toString();
  const isBuyer = Boolean(currentUserId && orderUserId && currentUserId === orderUserId);
  const isShopAdminForOrder = Boolean(userInfo?.isSuperAdmin || (
    userInfo?.isAdmin && currentUserId && shopOwnerId === currentUserId
  ));
  const canManageShopPayment = isShopAdminForOrder && !isBuyer;
  const canManageFulfillment = (fulfillment) => {
    const ownerId = fulfillment.shop?.owner?._id?.toString() || fulfillment.shop?.owner?.toString();
    return Boolean(userInfo?.isSuperAdmin || (
      userInfo?.isAdmin && currentUserId && ownerId === currentUserId
    ));
  };
  const customerCashConfirmed = Boolean(order.paymentConfirmation?.customerConfirmedAt);
  const shopCashConfirmed = Boolean(order.paymentConfirmation?.shopConfirmedAt);

  return (
    <div className="order-detail-page">
      <PageBackButton />
      <header className="order-detail-page__header">
        <div>
          <p>ORDER DETAILS</p>
          <h1>Your order</h1>
        </div>
        <span className={`order-detail-page__status${order.isDelivered ? " is-delivered" : order.isPaid ? " is-paid" : ""}`}>
          {order.receiptConfirmedAt
            ? "Receipt confirmed"
            : order.isDelivered
              ? "Delivered"
              : order.isPaid
                ? "Payment confirmed"
                : "Payment pending"}
        </span>
      </header>
      <OrderTimeline order={order} />
      {order.shopFulfillments?.length > 0 && (
        <section className="order-detail-page__card" aria-label="Delivery by shop">
          <h2>Delivery by shop</h2>
          <p>Each shop updates its own items. Confirm each delivery to complete this order.</p>
          <div className="space-y-4">
            {order.shopFulfillments.map((fulfillment) => {
              const shopId = fulfillment.shop?._id || fulfillment.shop;
              const currentStatus = fulfillment.fulfillmentStatus || "payment_confirmed";
              const currentIndex = ORDER_STATUS_STEPS.findIndex((step) => step.status === currentStatus);
              const nextStep = currentIndex >= 0 && currentIndex < 4
                ? ORDER_STATUS_STEPS[currentIndex + 1]
                : null;
              const isShopAdmin = canManageFulfillment(fulfillment);
              const fulfillmentOrder = {
                ...order,
                fulfillmentStatus: currentStatus,
                statusHistory: fulfillment.statusHistory || [],
                isDelivered: ["delivered", "receipt_confirmed"].includes(currentStatus),
                deliveredAt: fulfillment.deliveredAt,
                receiptConfirmedAt: fulfillment.receiptConfirmedAt,
              };
              return (
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={String(shopId)}>
                  <h3 className="mb-3 text-lg font-bold">{fulfillment.shop?.name || "Shop"}</h3>
                  <OrderTimeline order={fulfillmentOrder} compact />
                  {isBuyer && currentStatus === "delivered" && !fulfillment.receiptConfirmedAt && (
                    <button
                      type="button"
                      className="order-detail-page__action order-detail-page__action--receipt"
                      disabled={confirmingReceipt}
                      onClick={() => confirmReceiptHandler(shopId)}
                    >
                      {confirmingReceipt ? "Confirming receipt..." : `Confirm Receipt from ${fulfillment.shop?.name || "Shop"}`}
                    </button>
                  )}
                  {isBuyer && fulfillment.receiptConfirmedAt && (
                    <p className="order-detail-page__payment-note">Receipt confirmed for {fulfillment.shop?.name || "this shop"}.</p>
                  )}
                  {isShopAdmin && order.isPaid && nextStep && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="order-detail-page__action order-detail-page__action--deliver"
                        disabled={updatingFulfillment}
                        onClick={() => updateFulfillmentHandler(shopId, nextStep.status)}
                      >
                        {updatingFulfillment ? "Updating..." : `Mark ${nextStep.label}`}
                      </button>
                      {currentStatus !== "delivered" && (
                        <button
                          type="button"
                          className="order-detail-page__action order-detail-page__action--deliver"
                          disabled={loadingDeliver}
                          onClick={() => deliverHandler(shopId)}
                        >
                          {loadingDeliver ? "Updating..." : "Confirm Delivered"}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
      {isBuyer && !userInfo?.isAdmin && !userInfo?.isSuperAdmin && <PostOrderDelight order={order} />}
      {/* Order Items */}
      <section className="order-detail-page__items-panel">
        <div className="order-detail-page__card">
          <div className="order-detail-page__section-heading">
            <h2>Items in this order</h2>
            <span>{order.orderItems.length} {order.orderItems.length === 1 ? "item" : "items"}</span>
          </div>
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
                        <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-14 h-14 object-cover rounded" />
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
      </section>

      {/* Order Summary + Payment */}
      <aside className="order-detail-page__sidebar">
        {/* Shipping Info */}
        <section className="order-detail-page__card order-detail-page__shipping">
          <h2>Shipping details</h2>
          <div className="order-detail-page__shipping-details">
            <p><strong>Order:</strong> {order._id}</p>
            <p><strong>Name:</strong> {order.user ? order.user.username : 'Guest'}</p>
            <p><strong>Email:</strong> {order.user ? order.user.email : 'N/A'}</p>
            <p><strong>Shop:</strong> {order.shop?.name || "N/A"}</p>
            <p>
              <strong>Address:</strong> {order.shippingAddress.phone}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}, {order.shippingAddress.apartment}
            </p>
            {!order.isPaid && <p><strong>Checkout preference:</strong> {order.paymentMethod}</p>}
            {order.isPaid && (
              <>
                <p><strong>Final payment method:</strong> {order.finalPaymentMethod || order.paymentMethod}</p>
                <p><strong>Receipt number:</strong> {order.paymentConfirmation?.receiptNumber || order.paymentResult?.id || "Not recorded"}</p>
                {order.paymentResult?.id && order.paymentResult.id !== order.paymentConfirmation?.receiptNumber && (
                  <p><strong>Payment reference:</strong> {order.paymentResult.id}</p>
                )}
              </>
            )}
          </div>

          {order.isPaid ? (
            <Message variant="success">Paid on {order.paidAt}</Message>
          ) : (
            <Message variant="danger">Not paid</Message>
          )}
        </section>

        {/* Order Summary */}
        <section className="order-detail-page__card order-detail-page__summary">
          <h2>Order summary</h2>

          <div className="order-detail-page__totals">
            <div><span>Items</span><span>KES {order.itemsPrice}</span></div>
            <div><span>Shipping</span><span>KES {order.shippingPrice}</span></div>
            <div><span>Tax</span><span>KES {order.taxPrice}</span></div>
            {Number(order.referralVoucher?.discountAmount) > 0 && (
              <div><span>Reward voucher</span><span>- KES {Number(order.referralVoucher.discountAmount).toFixed(2)}</span></div>
            )}
            {Number(order.rewardRedemption?.discountAmount) > 0 && (
              <div>
                <span>Rewards discount ({Number(order.rewardRedemption.pointsRedeemed || order.rewardRedemption.pointsReserved).toLocaleString()} points)</span>
                <span>- KES {Number(order.rewardRedemption.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="order-detail-page__grand-total"><span>Total</span><strong>KES {order.totalPrice}</strong></div>
          </div>

          {/* Payment Section */}
          {!order.isPaid && (
            <div className="order-detail-page__payment">
              {isBuyer && order.paymentConfirmation?.method !== "Cash" ? (
                <>

              {/* PayPal */}
              {loadingPayPal ? (
                <Loader />
              ) : errorPayPal ? (
                <p className="order-detail-page__payment-note">PayPal configuration could not be loaded. Please use M-Pesa or try again later.</p>
              ) : !paypal?.serverVerificationReady ? (
                <p className="order-detail-page__payment-note">PayPal is temporarily unavailable because server-side payment verification is not configured.</p>
              ) : isPending ? (
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
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    disabled={!Number(usdAmount)}
                  />
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
                onSuccess={handleMpesaSuccess}
                onFailure={handleMpesaFailure}
                disabled={loadingPay || order.isPaid}
              />
                </>
              ) : (
                <p className="order-detail-page__payment-note">
                  {order.paymentConfirmation?.method === "Cash"
                    ? "Cash confirmation has started. Complete it with the other party before choosing another payment method."
                    : "Online payment can only be initiated by the customer who placed this order."}
                </p>
              )}
            </div>
          )}

          {!order.isPaid && (
            <section className="order-detail-page__cash-confirmation">
              <h3>Cash payment confirmation</h3>
              <p>Cash is recorded only after both the customer and this shop confirm the handover. If an M-Pesa request is pending, wait for its cancellation or failure before confirming cash.</p>
              <div className="order-detail-page__confirmation-status">
                <span className={customerCashConfirmed ? "is-confirmed" : ""}>
                  Customer: {customerCashConfirmed ? "Confirmed" : "Waiting"}
                </span>
                <span className={shopCashConfirmed ? "is-confirmed" : ""}>
                  Shop: {shopCashConfirmed ? "Confirmed" : "Waiting"}
                </span>
              </div>
              {(isBuyer && !customerCashConfirmed) || (canManageShopPayment && !shopCashConfirmed) ? (
                <button
                  type="button"
                  className="order-detail-page__action order-detail-page__action--cash"
                  disabled={confirmingCash}
                  onClick={confirmCashHandler}
                >
                  {confirmingCash
                    ? "Recording confirmation…"
                    : isBuyer && !customerCashConfirmed
                      ? "Confirm cash paid"
                      : "Confirm cash received"}
                </button>
              ) : null}
              {isBuyer && isShopAdminForOrder && (
                <p className="order-detail-page__payment-note">
                  A second person with shop-admin access must confirm the shop side of this cash payment.
                </p>
              )}
              {!order.user && canManageShopPayment && (
                <p className="order-detail-page__payment-note">This guest order has no signed-in customer account, so customer confirmation is unavailable.</p>
              )}
            </section>
          )}

                {order.isPaid && (
                        <button
                          onClick={downloadReceipt}
                          className="order-detail-page__action order-detail-page__action--receipt"
                        >
                          Download Receipt (PDF)
                        </button>
                      )}

          {/* Deliver */}
          {loadingDeliver && <Loader />}
          {!order.shopFulfillments?.length && isBuyer && order.isDelivered && !order.receiptConfirmedAt && order.fulfillmentStatus !== "receipt_confirmed" && (
            <button
              type="button"
              className="order-detail-page__action order-detail-page__action--receipt"
              disabled={confirmingReceipt}
              onClick={confirmReceiptHandler}
            >
              {confirmingReceipt ? "Confirming receipt..." : "Confirm Receipt"}
            </button>
          )}
          {!order.shopFulfillments?.length && isBuyer && order.receiptConfirmedAt && (
            <p className="order-detail-page__payment-note">Receipt confirmed. This order is complete.</p>
          )}

          {!order.shopFulfillments?.length && canManageShopPayment && order.isPaid && !order.isDelivered && (
            <button
              type="button"
              className="order-detail-page__action order-detail-page__action--deliver"
              disabled={loadingDeliver}
              onClick={deliverHandler}
            >
              {loadingDeliver ? "Updating delivery..." : "Confirm Delivered"}
            </button>
            
          )}
          </section>
      </aside>
    </div>
  );
};

export default Order;
