import asyncHandler from '../middlewares/asyncHandler.js';
import Order from '../models/orderModel.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Helper function to calculate tax and shop owner payout
const calculatePayouts = (totalAmount, taxRate) => {
  const taxAmount = totalAmount * taxRate;
  const payoutAmount = totalAmount - taxAmount;
  return { taxAmount, payoutAmount };
};

// Initiate payment flow: payment goes to your till, then payout to shop owner
const processPaymentFlow = asyncHandler(async (req, res) => {
  const { orderId, amount, taxRate } = req.body;

  if (!orderId || !amount) {
    res.status(400);
    throw new Error('Missing required payment flow parameters');
  }

  // Fetch order and populate shop to get shop owner's phone number
  const order = await Order.findById(orderId).populate('shop');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const shopOwnerMpesaNumber = order.shop.telephone;
  if (!shopOwnerMpesaNumber) {
    res.status(400);
    throw new Error('Shop owner phone number not found');
  }

  // Calculate tax and payout
  const { taxAmount, payoutAmount } = calculatePayouts(amount, taxRate || 0.16); // default 16% tax

  // Use M-Pesa B2C API to pay shop owner their share
  const accessToken = await getMpesaAccessToken();
  const b2cPayload = {
    InitiatorName: process.env.MPESA_INITIATOR_NAME,
    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
    CommandID: 'BusinessPayment',
    Amount: payoutAmount,
    PartyA: process.env.MPESA_SHORTCODE, // Your till number
    PartyB: shopOwnerMpesaNumber,
    Remarks: `Payout for Order ${orderId}`,
    QueueTimeOutURL: process.env.MPESA_B2C_TIMEOUT_URL,
    ResultURL: process.env.MPESA_B2C_RESULT_URL,
    Occasion: `OrderPayout-${orderId}`,
  };

  try {
    const response = await axios.post(
      `${process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'}/mpesa/b2c/v1/paymentrequest`,
      b2cPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      message: 'Payment flow processed: tax deducted and payout initiated',
      data: response.data,
    });
  } catch (error) {
    console.error('B2C payout failed:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process payout to shop owner',
      error: error.response?.data || error.message,
    });
  }
});

// Implement getMpesaAccessToken function
const getMpesaAccessToken = async () => {
  try {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const { data } = await axios.get(
      `${process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    return data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with M-Pesa API');
  }
};

export { processPaymentFlow };

