export const ORDER_STATUS_STEPS = [
  { status: "payment_confirmed", label: "Payment Confirmed" },
  { status: "prepared_for_shipping", label: "Prepared for Shipping" },
  { status: "shipped", label: "Shipped" },
  { status: "arrived", label: "Arrived" },
  { status: "delivered", label: "Delivered" },
  { status: "receipt_confirmed", label: "Receipt Confirmed" },
];

export const getOrderFulfillmentStatus = (order) => (
  order?.fulfillmentStatus
  || (order?.isDelivered ? "delivered" : order?.isPaid ? "payment_confirmed" : null)
);
