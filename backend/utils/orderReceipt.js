const generateOrderReceiptNumber = (orderId, paidAt = new Date()) => (
  `SL-${paidAt.getFullYear()}-${orderId.toString().slice(-8).toUpperCase()}`
);

export { generateOrderReceiptNumber };
