// controllers/orderController.js
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import PDFDocument from "pdfkit"; // npm i pdfkit

// Utility Function - returns numbers (not strings)
function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.qty),
    0
  );

  const shippingPrice = itemsPrice > 5000 ? 0 : 100;
  const taxRate = 0.15;
  const taxPrice = Number((itemsPrice * taxRate).toFixed(2));

  const totalPrice = Number(
    (itemsPrice + shippingPrice + taxPrice).toFixed(2)
  );

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
}

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, shop } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    if (!shippingAddress || !shippingAddress.phone || !shippingAddress.city) {
      return res.status(400).json({ message: "Incomplete shipping info" });
    }

    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );

      if (!matchingItemFromDB) {
        throw new Error(`Product not found: ${itemFromClient._id}`);
      }

      return {
        name: itemFromClient.name,
        qty: Number(itemFromClient.qty),
        image: itemFromClient.image || matchingItemFromDB.image,
        price: Number(matchingItemFromDB.price),
        product: itemFromClient._id,
      };
    });

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    const shopDoc = await Shop.findById(shop);
    const shippingAddressWithShopName = {
      ...shippingAddress,
      shopName: shopDoc ? shopDoc.name : undefined,
    };

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shop,
      shippingAddress: shippingAddressWithShopName,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id username")
      .populate("shop", "name location")
      .populate({
        path: "orderItems.product",
        populate: { path: "shop", select: "name location" },
      });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSales = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice || 0),
      0
    );
    res.json({ totalSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSalesByDate = async (req, res) => {
  try {
    const salesByDate = await Order.aggregate([
      {
        $match: { isPaid: true },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesByDate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("shop", "name location");

    if (order) {
      if (!order.shippingAddress.shopName && order.shop && order.shop.name) {
        order.shippingAddress.shopName = order.shop.name;
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address:
          (req.body.payer && req.body.payer.email_address) ||
          req.body.email_address ||
          (req.body.payer && req.body.payer.email) ||
          "",
      };

      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("shop", "name location");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.isPaid) return res.status(400).json({ message: "Order not paid yet" });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${order._id}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(20).text("Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.paidAt).toLocaleString()}`);
    doc.text(`Customer: ${order.user.username}`);
    doc.text(`Email: ${order.user.email}`);
    doc.text(`Shop: ${order.shop?.name || "N/A"}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.moveDown();

    doc.text("Items:", { underline: true });
    order.orderItems.forEach((item) => {
      doc.text(
        `${item.name} x${item.qty} = KES ${(item.qty * item.price).toFixed(2)}`
      );
    });
    doc.moveDown();

    doc.text(`Items: KES ${order.itemsPrice.toFixed(2)}`);
    doc.text(`Shipping: KES ${order.shippingPrice.toFixed(2)}`);
    doc.text(`Tax: KES ${order.taxPrice.toFixed(2)}`);
    doc.moveDown();
    doc.fontSize(14).text(`Total: KES ${order.totalPrice.toFixed(2)}`, {
      align: "right",
    });

    doc.end();
  } catch (err) {
    console.error("getReceipt error:", err);
    res.status(500).json({ message: err.message });
  }
};

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calculateTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  getReceipt,
};
