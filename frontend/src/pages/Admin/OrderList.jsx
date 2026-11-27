import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBoxOpen, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { ORDER_STATUS_STEPS, getOrderFulfillmentStatus } from "../../components/orders/orderStatus";
import {
  useDeliverOrderMutation,
  useGetOrderFinancialSummaryQuery,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../../redux/Api/orderApiSlice";
import AdminMenu from "./AdminMenu";
import "./AdminWorkspace.css";

const getOrderSearchText = (order) => [
  order?._id,
  order?.user?.username,
  order?.user?.email,
  order?.shippingAddress?.phone,
  order?.paymentMethod,
  order?.finalPaymentMethod,
  order?.paymentConfirmation?.receiptNumber,
  order?.paymentConfirmation?.method,
  order?.paymentResult?.id,
  order?.checkoutRequestId,
  order?.shop?.name,
  ...(order?.shopFulfillments || []).map((fulfillment) => fulfillment.shop?.name),
  ...(order?.orderItems || []).map((item) => item?.name),
].filter(Boolean).join(" ").toLowerCase();

const getStatusLabel = (status) => (
  ORDER_STATUS_STEPS.find((step) => step.status === status)?.label || "Awaiting payment"
);

const OrderList = ({ showMenu = true }) => {
  const { data: orders = [], isLoading, error } = useGetOrdersQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
  });
  const { data: financialSummary, error: financialSummaryError } = useGetOrderFinancialSummaryQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
  });
  const { userInfo } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deliverOrder] = useDeliverOrderMutation();

  const moveOrderForward = async (order, status, shopId = null) => {
    const updateKey = `${order._id}:${shopId || ""}`;
    setUpdatingOrderId(updateKey);
    try {
      await updateOrderStatus({ orderId: order._id, shopId, status }).unwrap();
      toast.success(`Order ${getStatusLabel(status).toLowerCase()}.`);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Could not update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const confirmDelivered = async (order, shopId = null) => {
    const updateKey = `${order._id}:${shopId || ""}`;
    setUpdatingOrderId(updateKey);
    try {
      await deliverOrder(shopId ? { orderId: order._id, shopId } : order._id).unwrap();
      toast.success("Order marked as delivered.");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Could not mark order delivered.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) => getOrderSearchText(order).includes(query));
  }, [orders, search]);

  const paidCount = orders.filter((order) => order.isPaid).length;
  const pendingCount = orders.length - paidCount;

  return (
    <div className="admin-workspace admin-orders">
      {showMenu && <AdminMenu />}
      <header className="admin-workspace__header">
        <div>
          <p className="admin-workspace__eyebrow">Marketplace operations</p>
          <h1>Orders</h1>
          <p className="admin-workspace__description">
            Track payments, fulfillment, customers, and receipts across your shops.
          </p>
        </div>
        <div className="admin-workspace__summary">
          <div className="admin-workspace__stat">
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="admin-workspace__stat">
            <span>Paid</span>
            <strong>{paidCount}</strong>
          </div>
          <div className="admin-workspace__stat">
            <span>Awaiting payment</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
      </header>

      {financialSummaryError ? (
        <Message variant="danger">
          {financialSummaryError?.data?.message || "Payment accounting summary is unavailable."}
        </Message>
      ) : (
        <section className="admin-orders__finance" aria-label="Confirmed payment accounting">
          <div className="admin-orders__finance-heading">
            <div>
              <p className="admin-workspace__eyebrow">Confirmed settlements</p>
              <h2>Payment &amp; revenue summary</h2>
            </div>
            <span>{financialSummary?.confirmedOrders || 0} settled orders</span>
          </div>
          <div className="admin-orders__finance-grid">
            <div><span>Product sales after discounts</span><strong>KES {Number(financialSummary?.productSales || 0).toLocaleString()}</strong></div>
            <div><span>Tax collected after discounts</span><strong>KES {Number(financialSummary?.taxCollected || 0).toLocaleString()}</strong></div>
            <div><span>Delivery fees after discounts</span><strong>KES {Number(financialSummary?.deliveryFees || 0).toLocaleString()}</strong></div>
            <div><span>Discounts applied</span><strong>KES {Number(financialSummary?.discountsGiven || 0).toLocaleString()}</strong></div>
            <div className="is-highlighted"><span>Platform tax + delivery fees</span><strong>KES {Number(financialSummary?.grossPlatformIncome || 0).toLocaleString()}</strong></div>
            <div><span>Total payments received</span><strong>KES {Number(financialSummary?.totalReceived || 0).toLocaleString()}</strong></div>
          </div>
          <div className="admin-orders__payment-methods">
            <h3>Confirmed by payment method</h3>
            {Object.entries(financialSummary?.paymentMethods || {}).length > 0 ? (
              Object.entries(financialSummary.paymentMethods).map(([method, details]) => (
                <div key={method}>
                  <span>{method} <small>{details.orderCount} {details.orderCount === 1 ? "order" : "orders"}</small></span>
                  <strong>KES {Number(details.amount || 0).toLocaleString()}</strong>
                </div>
              ))
            ) : (
              <p>No confirmed payments yet.</p>
            )}
          </div>
          <p className="admin-orders__finance-note">
            *Gross platform income is tax collected plus delivery fees. Product sales and collected taxes remain separately itemized; this is not net profit and does not subtract operating costs or tax remittances.
          </p>
        </section>
      )}

      <label className="admin-workspace__search">
        <FaSearch aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order number, receipt, customer, phone or shop"
          aria-label="Search orders by order number, receipt, customer, phone, or shop"
        />
      </label>

      {isLoading ? <div className="admin-workspace__loading"><Loader /></div>
        : error ? (
          <Message variant="danger">{error?.data?.message || error.error}</Message>
        ) : visibleOrders.length === 0 ? (
          <div className="admin-workspace__empty">
            <FaBoxOpen aria-hidden="true" />
            <h2>{search ? "No matching orders" : "No orders yet"}</h2>
            <p>{search ? "Try an order ID, payment receipt, phone number, or customer name." : "New customer orders will appear here."}</p>
          </div>
        ) : (
          <div className="admin-orders__list">
            {visibleOrders.map((order) => {
              const status = getOrderFulfillmentStatus(order);
              const orderFulfillments = (order.shopFulfillments?.length
                ? order.shopFulfillments
                : [{
                  shop: order.shop,
                  fulfillmentStatus: status,
                  statusHistory: order.statusHistory,
                  isLegacy: true,
                }]).filter((fulfillment) => (
                !userInfo?._id
                || userInfo.isSuperAdmin
                || String(fulfillment.shop?.owner?._id || fulfillment.shop?.owner || "") === String(userInfo._id)
              ));
              const reference = order.paymentConfirmation?.receiptNumber
                || order.paymentResult?.id
                || order.checkoutRequestId;
              const paymentMethod = order.finalPaymentMethod
                || order.paymentResult?.method
                || (order.checkoutRequestId ? "M-Pesa" : null)
                || (/^CASH-/i.test(order.paymentResult?.id || "") ? "Cash" : null)
                || (order.paymentResult?.email_address ? "PayPal" : null)
                || order.paymentMethod
                || "—";
              const customer = order.user?.username || order.user?.email || "Guest checkout";
              const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "Date unavailable";

              return (
                <article className="admin-order-card" key={order._id}>
                  <div className="admin-order-card__main">
                    <div className="admin-order-card__identity">
                      <img
                        src={order.orderItems?.[0]?.image}
                        alt=""
                        loading="lazy"
                      />
                      <div>
                        <span className="admin-order-card__label">Order</span>
                        <strong title={order._id}>{order._id}</strong>
                        <span>{customer} · {orderDate}</span>
                      </div>
                    </div>
                    <div className="admin-order-card__amount">
                      <span className="admin-order-card__label">Total</span>
                      <strong>KES {Number(order.totalPrice || 0).toLocaleString()}</strong>
                      <span>{order.orderItems?.length || 0} items</span>
                    </div>
                    <div className="admin-order-card__statuses">
                      <span className={`admin-status ${order.isPaid ? "admin-status--success" : "admin-status--pending"}`}>
                        {order.isPaid ? "Paid" : "Payment pending"}
                      </span>
                      <span className={`admin-status ${order.receiptConfirmedAt ? "admin-status--success" : order.isDelivered ? "admin-status--success" : "admin-status--neutral"}`}>
                        {order.receiptConfirmedAt ? "Receipt confirmed" : getStatusLabel(status)}
                      </span>
                    </div>
                    <Link className="admin-workspace__action" to={`/order/${order._id}`}>
                      View order
                    </Link>
                  </div>
                  <div className="admin-order-card__details">
                    <span><b>Shop</b>{order.shop?.name || order.shippingAddress?.shopName || "—"}</span>
                    <span><b>Final payment method</b>{order.isPaid ? paymentMethod : `Pending · ${paymentMethod}`}</span>
                    <span className="admin-order-card__reference"><b>{order.isPaid ? "Receipt number" : "Payment reference / receipt"}</b>{reference || (order.isPaid ? "Receipt not recorded" : "Awaiting payment")}</span>
                    {order.isPaid && order.paymentResult?.id && order.paymentResult.id !== reference && (
                      <span className="admin-order-card__reference"><b>Gateway reference</b>{order.paymentResult.id}</span>
                    )}
                    {order.paymentConfirmation?.method === "Cash" && (
                      <span>
                        <b>Cash confirmations</b>
                        Customer: {order.paymentConfirmation.customerConfirmedAt ? "confirmed" : "waiting"} · Shop: {order.paymentConfirmation.shopConfirmedAt ? "confirmed" : "waiting"}
                      </span>
                    )}
                    <span><b>Delivery</b>{order.shippingAddress?.city || "—"}, {order.shippingAddress?.country || "—"}</span>
                  </div>
                  {order.statusHistory?.length > 0 && (
                    <ol className="admin-order-card__history" aria-label="Order status audit history">
                      {order.statusHistory.map((entry, index) => (
                        <li key={`${entry.status}-${entry.timestamp}-${index}`}>
                          <strong>{getStatusLabel(entry.status)}</strong>
                          <span>{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "Timestamp unavailable"}</span>
                          <span>{entry.actor?.username || (entry.actorRole === "system" ? "System" : entry.actorRole || "Unknown actor")}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {orderFulfillments.map((fulfillment) => {
                    const fulfillmentStatus = fulfillment.fulfillmentStatus || "payment_confirmed";
                    const statusIndex = ORDER_STATUS_STEPS.findIndex((step) => step.status === fulfillmentStatus);
                    const nextStep = statusIndex >= 0 && statusIndex < 4
                      ? ORDER_STATUS_STEPS[statusIndex + 1]
                      : null;
                    const shopId = fulfillment.shop?._id || fulfillment.shop;
                    const updateKey = `${order._id}:${fulfillment.isLegacy ? "" : shopId}`;
                    const isUpdating = updatingOrderId === updateKey;
                    return (
                      <div className="admin-order-card__fulfillment" key={String(shopId)}>
                        <span>
                          {orderFulfillments.length > 1 && <strong>{fulfillment.shop?.name || "Shop"} · </strong>}
                          {nextStep
                            ? <>Next step: <strong>{nextStep.label}</strong></>
                            : fulfillmentStatus === "receipt_confirmed"
                              ? "Receipt confirmed"
                              : "Waiting for customer receipt confirmation"}
                        </span>
                        {order.isPaid && nextStep && (
                          <div>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => moveOrderForward(
                                order,
                                nextStep.status,
                                fulfillment.isLegacy ? null : shopId
                              )}
                            >
                              {isUpdating ? "Updating..." : `Mark ${nextStep.label}`}
                            </button>
                            {fulfillmentStatus !== "delivered" && (
                              <button
                                type="button"
                                className="is-shortcut"
                                disabled={isUpdating}
                                onClick={() => confirmDelivered(
                                  order,
                                  fulfillment.isLegacy ? null : shopId
                                )}
                                title="Use for hand-to-hand sales where no shipping updates are needed"
                              >
                                Confirm Delivered
                              </button>
                            )}
                          </div>
                        )}
                        {fulfillment.statusHistory?.length > 0 && (
                          <ol className="admin-order-card__history" aria-label={`${fulfillment.shop?.name || "Shop"} fulfillment audit history`}>
                            {fulfillment.statusHistory.map((entry, index) => (
                              <li key={`${entry.status}-${entry.timestamp}-${index}`}>
                                <strong>{getStatusLabel(entry.status)}</strong>
                                <span>{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "Timestamp unavailable"}</span>
                                <span>{entry.actor?.username || (entry.actorRole === "system" ? "System" : entry.actorRole || "Unknown actor")}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    );
                  })}
                </article>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default OrderList;
