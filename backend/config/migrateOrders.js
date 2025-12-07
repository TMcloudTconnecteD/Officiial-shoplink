import mongoose from "mongoose";
import Order from "./models/orderModel.js"; // make sure this path is correct

const uri =
  "mongodb+srv://hillarygerald76:3W9RK474GedFpuEL@shoplinkbackend.7tmvd.mongodb.net/?retryWrites=true&w=majority&appName=shoplinkbackend";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function migrateOrders() {
  try {
    const orders = await Order.find({});

    for (const order of orders) {
      // Move old 'address' → 'apartment'
      if (order.shippingAddress.address) {
        order.shippingAddress.apartment = order.shippingAddress.address;
        delete order.shippingAddress.address;
      }

      // Ensure phone exists
      if (!order.shippingAddress.phone) {
        order.shippingAddress.phone = "0000000000"; // placeholder
      }

      await order.save();
      console.log(`Order ${order._id} updated`);
    }

    console.log("Migration complete!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Migration error:", err);
    mongoose.disconnect();
  }
}

migrateOrders();
