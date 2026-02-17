// controllers/orderController.js
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import PDFDocument from "pdfkit"; // npm i pdfkit
import { sendWatiMessage } from "../utils/wati.js";

// Utility Function - returns numbers (not strings)
function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.qty),
    0
  );

  const shippingPrice = itemsPrice > 5000 ? 0 : 100;
  const taxRate = 0.08
  ;
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

    // Ensure required shipping fields exist
    if (!shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({
        message: "Incomplete shipping info",
        missingFields: [
          !shippingAddress?.city && "city",
          !shippingAddress?.postalCode && "postalCode",
          !shippingAddress?.country && "country",
        ].filter(Boolean),
      });
    }

    // Fetch products from DB
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

    // Calculate prices
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems);

    // Fetch shop details
    const shopDoc = await Shop.findById(shop);

    // Clean shipping address: move old 'address' → 'apartment', ensure phone exists
    const shippingAddressCleaned = {
      ...shippingAddress,
      apartment: shippingAddress.apartment || shippingAddress.address || "",
      phone: shippingAddress.phone || "0000000000",
      shopName: shopDoc ? shopDoc.name : undefined,
    };
    delete shippingAddressCleaned.address; // remove old 'address'

    // Create new order
    const order = new Order({
      orderItems: dbOrderItems,
      // Support guest checkout - user is optional
      user: req.user ? req.user._id : undefined,
      shop,
      shippingAddress: shippingAddressCleaned,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Notify shop owner via WATI (if configured)
    try {
      if (shopDoc && shopDoc.telephone) {
        const phone = shopDoc.telephone.toString();
        sendWatiMessage(
          phone,
          `You have a new order (${createdOrder._id}). Please check your dashboard.`
        );
      }
    } catch (err) {
      console.error("WATI notification error:", err);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};




const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "username email")
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
    console.log(`getReceipt called for order id: ${req.params.id}`);
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("shop", "name location");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.isPaid) return res.status(400).json({ message: "Order not paid yet" });

    const doc = new PDFDocument({ size: 'A5', margin: 20 });
    // Ensure PDFs are never cached by CDNs
    // Mark origin for debugging (helps identify when a CDN is returning stale HTML)
    res.setHeader('X-Receipt-Source', 'origin');
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${order._id}.pdf`
    );
    // also explicitly prevent caching for PDF
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');

    doc.pipe(res);

    // Try to include logo as a watermark (semi-transparent, centered behind text)
    const logoUrl = (order.shop && order.shop.image) || process.env.SITE_LOGO_URL || 'https://res.cloudinary.com/tmcloud/image/upload/v1765073472/shoplink_uploads/zhj9iddpymn8z441krtg.png';
    try {
      if (typeof fetch === 'function') {
        const logoResp = await fetch(logoUrl);
        if (logoResp.ok) {
          const arrayBuffer = await logoResp.arrayBuffer();
          const buf = Buffer.from(arrayBuffer);
          // place a small semi-transparent watermark for A5 format
          const watermarkSize = 60; // smaller for A5 page
          const pageWidth = doc.page.width;
          const pageHeight = doc.page.height;
          const left = (pageWidth - watermarkSize) / 2;
          const top = (pageHeight - watermarkSize) / 2;
          // set opacity to ~10% for a subtle watermark effect
          doc.opacity(0.1);
          doc.image(buf, left, top, { fit: [watermarkSize, watermarkSize] });
          // restore full opacity for content
          doc.opacity(1);
          console.log(`Receipt watermark placed at center with opacity=0.1 size=${watermarkSize}`);
        }
      }
    } catch (err) {
      console.warn('Could not fetch logo for watermark:', err.message || err);
    }

    // Luxurious centered title with a gold accent (starts below logo)
    try {
      doc.font('Times-Roman');
    } catch (e) {
      // Times-Roman is built-in, but ignore if unavailable
    }
    doc.moveDown(0.2);
    doc.fontSize(14).fillColor('#b58b28').text((order.shop && order.shop.name) ? String(order.shop.name) : 'Shop_Link', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(11).fillColor('#111827').text('RECEIPT', { align: 'center', characterSpacing: 1 });
    doc.moveDown(0.3);

    doc.fontSize(9).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.paidAt).toLocaleString()}`);
    // Determine customer info: prefer recorded order user, then request-authenticated user, else Guest
    let customerSource = 'guest';
    let customerName = 'Guest';
    let customerEmail = 'N/A';

    if (order.user && (order.user.username || order.user.email)) {
      customerSource = 'order.user';
      customerName = order.user.username || `User:${order.user._id}`;
      customerEmail = order.user.email || 'N/A';
    } else if (req.user) {
      customerSource = 'request.user';
      customerName = req.user.username || `User:${req.user._id}`;
      customerEmail = req.user.email || 'N/A';
    }

    console.log(`Receipt customer source: ${customerSource} (name=${customerName}, email=${customerEmail})`);

    doc.text(`Customer: ${customerName}`);
    doc.text(`Email: ${customerEmail}`);
    doc.text(`Shop: ${order.shop?.name || "N/A"}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.text(`Payment: ${order.paymentMethod}`);
    doc.moveDown(0.2);


    doc.fontSize(9).text("Items:", { underline: true });
    order.orderItems.forEach((item) => {
      doc.fontSize(8).text(
        `${item.name} x${item.qty} = KES ${(item.qty * item.price).toFixed(2)}`
      );
    });
    doc.moveDown(0.1);

    doc.fontSize(9).text(`Items: KES ${order.itemsPrice.toFixed(2)}`);
    doc.text(`Shipping: KES ${order.shippingPrice.toFixed(2)}`);
    doc.text(`Tax: KES ${order.taxPrice.toFixed(2)}`);
    doc.moveDown(0.1);
    doc.fontSize(11).text(`Total: KES ${order.totalPrice.toFixed(2)}`, {
      align: "right",
    });

    // Footer helper - compact footer for A5 format
    const addFooter = (docInstance) => {
      try {
        const footerY = docInstance.page.height - 30; // compact for A5
        const shopName = (order.shop && order.shop.name) ? String(order.shop.name) : 'Shop_Link';
        const contact = (order.shop && order.shop.telephone) ? String(order.shop.telephone) : (process.env.SUPPORT_PHONE || 'N/A');
        const center = `© ${new Date().getFullYear()} ${shopName} — ${contact}`;

        // separator line (subtle but visible)
        docInstance.strokeColor('#d1d5db').lineWidth(0.5);
        docInstance.moveTo(docInstance.page.margins.left, footerY - 8)
          .lineTo(docInstance.page.width - docInstance.page.margins.right, footerY - 8)
          .stroke();

        // footer text
        docInstance.fontSize(7).fillColor('#374151');
        docInstance.text(center, docInstance.page.margins.left, footerY - 4, { align: 'center' });

        // reset color for body content
        docInstance.fillColor('#111827');
      } catch (e) {
        console.warn('Failed to render footer:', e.message || e);
      }
    };

    // Only add footer to single A5 page (don't trigger pageAdded event for unwanted extra pages)
    addFooter(doc);

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
