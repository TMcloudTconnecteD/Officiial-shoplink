// models/orderModel.js
import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: false, ref: "User" },
    shop: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Shop" },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],

    shippingAddress: {
      phone: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      apartment: { type: String },
      shopName: { type: String }, // added to store shop name
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    finalPaymentMethod: {
      type: String,
      enum: ["PayPal", "M-Pesa", "Cash", "ShopLink voucher"],
      default: null,
    },

    paymentConfirmation: {
      method: { type: String, enum: ["PayPal", "M-Pesa", "Cash", "ShopLink voucher"], default: null },
      gatewayVerified: { type: Boolean, default: false },
      gatewayStatus: { type: String, default: null },
      gatewayCheckoutRequestId: { type: String, default: null },
      customerConfirmedAt: { type: Date, default: null },
      customerConfirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      shopConfirmedAt: { type: Date, default: null },
      shopConfirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      receiptNumber: { type: String, default: null },
    },

    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
      method: { type: String },
    },

    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    pointsAwardedAt: {
      type: Date,
      default: null,
    },

    // Store checkoutRequestId from M-Pesa STK push for reconciliation
    checkoutRequestId: {
      type: String,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    referralVoucher: {
      redemption: { type: mongoose.Schema.Types.ObjectId, ref: "VoucherRedemption", default: null },
      rewardCredit: { type: mongoose.Schema.Types.ObjectId, ref: "RewardCredit", default: null },
      discountAmount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
