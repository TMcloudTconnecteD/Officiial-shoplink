import mongoose from "mongoose";
import Order from "../models/orderModel.js";

const uri =
  "mongodb+srv://hillarygerald76:3W9RK474GedFpuEL@shoplinkbackend.7tmvd.mongodb.net/?retryWrites=true&w=majority&appName=shoplinkbackend";

mongoose.connect(uri);

const DEFAULT_SHOP_ID = "68d2f4875179f7169a61120b"; // Farm Equipment

async function migrateOrders() {
  try {
    const orders = await Order.find({});

    for (const order of orders) {
      let updated = false;

      // Move old 'address' → 'apartment'
      if (order.shippingAddress.address) {
        order.shippingAddress.apartment = order.shippingAddress.address;
        delete order.shippingAddress.address;
        updated = true;
      }

      // Ensure phone exists
      if (!order.shippingAddress.phone) {
        order.shippingAddress.phone = "0000000000"; // placeholder
        updated = true;
      }

      // Ensure shop exists
      if (!order.shop) {
        order.shop = DEFAULT_SHOP_ID;
        updated = true;
      }

      if (updated) {
        // Skip validation to avoid issues with other required fields
        await order.save({ validateBeforeSave: false });
        console.log(`Order ${order._id} updated`);
      }
    }

    console.log("Migration complete!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Migration error:", err);
    mongoose.disconnect();
  }
}

migrateOrders();
