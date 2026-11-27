import "./OrderTimeline.css";
import { ORDER_STATUS_STEPS, getOrderFulfillmentStatus } from "./orderStatus";

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
};

const OrderTimeline = ({ order, compact = false }) => {
  const currentStatus = getOrderFulfillmentStatus(order);
  const currentIndex = ORDER_STATUS_STEPS.findIndex(({ status }) => status === currentStatus);
  const timestamps = new Map(
    (order?.statusHistory || []).map((entry) => [entry.status, entry.timestamp])
  );
  if (!timestamps.has("payment_confirmed") && order?.paidAt) {
    timestamps.set("payment_confirmed", order.paidAt);
  }
  if (!timestamps.has("delivered") && order?.deliveredAt) {
    timestamps.set("delivered", order.deliveredAt);
  }
  if (!timestamps.has("receipt_confirmed") && order?.receiptConfirmedAt) {
    timestamps.set("receipt_confirmed", order.receiptConfirmedAt);
  }

  return (
    <section
      className={`order-timeline${compact ? " order-timeline--compact" : ""}`}
      aria-label="Order status timeline"
    >
      <div className="order-timeline__heading">
        <div>
          <p>ORDER JOURNEY</p>
          <h2>{currentIndex < 0 ? "Awaiting payment" : ORDER_STATUS_STEPS[currentIndex].label}</h2>
        </div>
        {currentIndex < 0 && <span>Updates will appear here after payment.</span>}
      </div>
      <ol className="order-timeline__steps">
        {ORDER_STATUS_STEPS.map(({ status, label }, index) => {
          const completed = currentIndex >= 0 && index < currentIndex;
          const active = currentIndex === index;
          const timestamp = formatTimestamp(timestamps.get(status));
          return (
            <li
              className={`order-timeline__step${completed ? " is-complete" : ""}${active ? " is-current" : ""}`}
              key={status}
              aria-current={active ? "step" : undefined}
            >
              <span className="order-timeline__marker" aria-hidden="true">
                {completed ? "✓" : index + 1}
              </span>
              <span className="order-timeline__step-copy">
                <strong>{label}</strong>
                <span>{timestamp || (active ? "In progress" : completed ? "Skipped" : "Not yet reached")}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default OrderTimeline;
