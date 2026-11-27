import { Link } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import OrderTimeline from "../../components/orders/OrderTimeline";
import { ORDER_STATUS_STEPS } from "../../components/orders/orderStatus";
import { useGetMyOrdersQuery } from "../../redux/Api/orderApiSlice";
import "./MyOrders.css";

const paymentMethodFor = (order) => (
  order.finalPaymentMethod
  || order.paymentResult?.method
  || (order.checkoutRequestId ? "M-Pesa" : null)
  || (/^CASH-/i.test(order.paymentResult?.id || "") ? "Cash" : null)
  || (order.paymentResult?.email_address ? "PayPal" : null)
  || order.paymentMethod
  || "Pending"
);

const MyOrders = () => {
  const { data: orders = [], isLoading, error } = useGetMyOrdersQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
  });

  if (isLoading) return <div className="my-orders my-orders__loading"><Loader /></div>;
  if (error) {
    return (
      <div className="my-orders">
        <Message variant="danger">{error?.data?.message || "We couldn't load your orders. Please try again."}</Message>
      </div>
    );
  }

  return (
    <main className="my-orders">
      <header className="my-orders__header">
        <div>
          <p>YOUR SHOPLINK ORDERS</p>
          <h1>My Orders</h1>
          <span>Follow each order from payment through delivery and receipt confirmation.</span>
        </div>
        <strong>{orders.length} {orders.length === 1 ? "order" : "orders"}</strong>
      </header>

      {orders.length === 0 ? (
        <section className="my-orders__empty">
          <FaBoxOpen aria-hidden="true" />
          <h2>Your orders will show up here</h2>
          <p>Once you place an order, you can follow its progress and find its receipt here.</p>
          <Link to="/shop">Explore shops</Link>
        </section>
      ) : (
        <div className="my-orders__list">
          {orders.map((order) => {
            const receipt = order.paymentConfirmation?.receiptNumber
              || order.paymentResult?.id
              || "Not issued yet";
              const shopFulfillments = order.shopFulfillments || [];
              const shopNames = shopFulfillments.map((fulfillment) => fulfillment.shop?.name).filter(Boolean);
              return (
              <article className="my-orders__card" key={order._id}>
                <header className="my-orders__card-header">
                  <div>
                    <span>{shopNames.length > 1 ? "SHOPS" : "SHOP"}</span>
                    <h2>{shopNames.length > 1
                      ? `${shopNames.length} shops`
                      : shopNames[0] || order.shop?.name || order.shippingAddress?.shopName || "Shop"}</h2>
                    {shopNames.length > 1 && <p>{shopNames.join(" · ")}</p>}
                    <p>Order placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "date unavailable"}</p>
                  </div>
                  <strong>KES {Number(order.totalPrice || 0).toLocaleString()}</strong>
                </header>

                <div className="my-orders__details">
                  <div>
                    <span>ITEMS</span>
                    <ul>
                      {(order.orderItems || []).map((item, index) => (
                        <li key={`${item.product || item.name}-${index}`}>
                          {item.name} <span>x {item.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div><span>PAYMENT MODE</span><strong>{paymentMethodFor(order)}</strong></div>
                  <div><span>RECEIPT</span><strong>{receipt}</strong></div>
                </div>

                <OrderTimeline order={order} compact />
                {shopFulfillments.length > 1 && (
                  <ul className="my-orders__shop-statuses" aria-label="Delivery status by shop">
                    {shopFulfillments.map((fulfillment) => {
                      const status = fulfillment.fulfillmentStatus || "payment_confirmed";
                      const label = ORDER_STATUS_STEPS.find((step) => step.status === status)?.label || "Awaiting payment";
                      return (
                        <li key={fulfillment.shop?._id || fulfillment.shop}>
                          <span>{fulfillment.shop?.name || "Shop"}</span>
                          <strong>{label}</strong>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="my-orders__card-footer">
                  {order.isPaid && (
                    <span>{order.receiptConfirmedAt ? "Order complete" : order.isDelivered ? "Waiting for your receipt confirmation" : "Payment confirmed"}</span>
                  )}
                  <Link to={`/order/${order._id}`}>
                    {order.isPaid ? "Track order & view receipt" : "View order"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyOrders;
